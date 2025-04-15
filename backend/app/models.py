from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
import datetime


class CharacterDetection(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    image_id: int = Field(foreign_key="image.id")
    bbox_x: int
    bbox_y: int
    bbox_w: int
    bbox_h: int
    confidence: Optional[float] = Field(default=None)

    image: "Image" = Relationship(back_populates="detections")


class Image(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str = Field(index=True)
    filepath: str
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

    detections: List["CharacterDetection"] = Relationship(back_populates="image")
