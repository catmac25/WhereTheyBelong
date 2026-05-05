import os
import random

def extract_features_from_image(image_bytes: bytes) -> dict:
    """
    Simulates ML extraction of physical attributes from an image.
    In a production environment, this would call a Vision API (like Gemini Pro Vision)
    or use a local VLM/classifier pipeline.
    
    Returns a dictionary of features: skintone, spectacles, hair_color
    """
    # Using the size of bytes to seed random so the same image gives consistent results
    seed_val = len(image_bytes)
    random.seed(seed_val)
    
    skintones = ["Fair", "Medium", "Dark", "Olive", "Brown"]
    spectacles_options = ["Yes", "No", "Sometimes"]
    hair_colors = ["Black", "Brown", "Blonde", "Grey", "White", "Red", "Bald"]
    
    # We will skew towards common values but keep it deterministic per image size
    return {
        "skintone": random.choice(skintones),
        "spectacles": random.choices(spectacles_options, weights=[0.3, 0.6, 0.1])[0],
        "hair_color": random.choice(hair_colors)
    }
