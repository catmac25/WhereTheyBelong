"""
AI vs Human image detector using SigLIP.
Detects if an image is AI-generated or of a real human.
"""
import io
from typing import Optional

_MODEL_CACHE = None
MODEL_ID = "Ateeqq/ai-vs-human-image-detector"


def _load_model():
    """Lazy-load the model and processor (heavy, ~500MB+)."""
    global _MODEL_CACHE
    if _MODEL_CACHE is not None:
        return _MODEL_CACHE

    import torch
    from transformers import AutoImageProcessor, SiglipForImageClassification

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    processor = AutoImageProcessor.from_pretrained(MODEL_ID)
    model = SiglipForImageClassification.from_pretrained(MODEL_ID)
    model.to(device)
    model.eval()

    _MODEL_CACHE = (processor, model, device)
    return _MODEL_CACHE


def check_ai_image(image_bytes: bytes) -> dict:
    """
    Check if the image is AI-generated or real human.
    Returns: { "is_ai": bool, "confidence": float, "label": str }
    """
    from PIL import Image
    import torch

    processor, model, device = _load_model()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    inputs = processor(images=image, return_tensors="pt").to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        predicted_class_idx = logits.argmax(-1).item()
        predicted_label = model.config.id2label[predicted_class_idx]
        probabilities = torch.softmax(logits, dim=-1)
        confidence = float(probabilities[0, predicted_class_idx].item())

    is_ai = predicted_label.lower() == "ai"

    return {
        "is_ai": is_ai,
        "confidence": round(confidence, 4),
        "label": predicted_label,
    }
