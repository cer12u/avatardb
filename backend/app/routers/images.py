from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.future import select as sql_select  # Use sqlalchemy select for options
from sqlalchemy.orm import selectinload  # Import selectinload
from ..db import get_session
from ..models import Image
from ..services.character_detection import detect_characters
import shutil
import os
from typing import List
import datetime

router = APIRouter(prefix="/images", tags=["images"])

IMAGE_DIR = "backend/data/images"


@router.post("", response_model=Image)
async def upload_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
):
    os.makedirs(IMAGE_DIR, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S%f")
    safe_filename = "".join(
        c for c in file.filename if c.isalnum() or c in ("-", "_", ".")
    )
    if not safe_filename:
        safe_filename = "uploaded_image"
    filename = f"{timestamp}_{safe_filename}"
    file_path = os.path.join(IMAGE_DIR, filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")
    finally:
        file.file.close()

    db_image = Image(filename=filename, filepath=file_path)
    session.add(db_image)
    try:
        await session.commit()
        await session.refresh(db_image)
    except Exception as e:
        await session.rollback()
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=500, detail=f"Could not save image metadata to DB: {e}"
        )

    print(f"Adding background task for image ID: {db_image.id}")
    background_tasks.add_task(detect_characters, session, db_image)

    return db_image


@router.get("", response_model=List[Image])
async def read_images(
    skip: int = 0, limit: int = 100, session: AsyncSession = Depends(get_session)
):
    result = await session.execute(
        select(Image).offset(skip).limit(limit).order_by(Image.timestamp.desc())
    )
    images = result.scalars().all()
    return images


@router.get("/{image_id}", response_model=Image)
async def read_image(image_id: int, session: AsyncSession = Depends(get_session)):
    stmt = (
        sql_select(Image)
        .where(Image.id == image_id)
        .options(selectinload(Image.detections))
    )
    result = await session.execute(stmt)
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return image
