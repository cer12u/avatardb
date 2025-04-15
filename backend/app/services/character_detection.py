import torch
import torchvision
from torchvision.models.detection import FasterRCNN_ResNet50_FPN_V2_Weights
from PIL import Image as PILImage
from sqlmodel.ext.asyncio.session import AsyncSession
from ..models import CharacterDetection, Image

print("Loading detection model...")
weights = FasterRCNN_ResNet50_FPN_V2_Weights.DEFAULT
model = torchvision.models.detection.fasterrcnn_resnet50_fpn_v2(
    weights=weights, box_score_thresh=0.8
)  # Adjust threshold
model.eval()  # Set model to evaluation mode
print("Detection model loaded.")

preprocess = weights.transforms()


async def detect_characters(db: AsyncSession, image_record: Image):
    print(
        f"Starting detection for image ID: {image_record.id}, Path: {image_record.filepath}"
    )
    if not image_record.id:
        print(
            f"Error: Image record for {image_record.filepath} does not have an ID. Skipping detection."
        )
        return
    try:
        img = PILImage.open(image_record.filepath).convert("RGB")
        batch = [preprocess(img)]  # Corrected: Apply preprocess directly to PIL image

        with torch.no_grad():
            outputs = model(batch)

        detections_added = 0
        output = outputs[0]
        boxes = output["boxes"]
        labels = output["labels"]
        scores = output["scores"]

        for box, label, score in zip(boxes, labels, scores):
            if label == 1 and score > 0.8:  # Example: COCO person label is 1
                x1, y1, x2, y2 = box.int().tolist()
                detection = CharacterDetection(
                    image_id=image_record.id,  # Use the committed image ID
                    bbox_x=x1,
                    bbox_y=y1,
                    bbox_w=x2 - x1,
                    bbox_h=y2 - y1,
                    confidence=float(score),
                )
                db.add(detection)
                detections_added += 1
                print(
                    f"  Detected person at [{x1},{y1},{x2},{y2}] with score {score:.2f}"
                )

        if detections_added > 0:
            await db.commit()
            print(
                f"Finished detection for image {image_record.id}. Added {detections_added} detections to DB."
            )
        else:
            print(
                f"Finished detection for image {image_record.id}. No relevant objects detected."
            )

    except FileNotFoundError:
        print(
            f"Error: File not found at {image_record.filepath} for image ID {image_record.id}"
        )
    except Exception as e:
        print(f"Error during detection for image {image_record.id}: {e}")
        await db.rollback()
