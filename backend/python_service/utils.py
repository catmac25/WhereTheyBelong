import PIL
import numpy as np
import cv2
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh

def image_obj_to_numpy(image_obj) -> np.ndarray:
    """Convert a Streamlit-uploaded image object to a numpy array (RGB)."""
    image = PIL.Image.open(image_obj).convert("RGB")
    return np.array(image)

def extract_face_mesh_landmarks(image: np.ndarray):
    """
    Extract face mesh landmarks from an image using MediaPipe.
    Returns flattened [x1,y1,z1,...] if a face is found, else None.
    MediaPipe expects RGB input.
    """
    rgb_image = np.asarray(image)
    if rgb_image.ndim == 2:
        rgb_image = cv2.cvtColor(rgb_image, cv2.COLOR_GRAY2RGB)
    elif rgb_image.shape[-1] == 4:
        rgb_image = cv2.cvtColor(rgb_image, cv2.COLOR_RGBA2RGB)

    with mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5
    ) as face_mesh:
        results = face_mesh.process(rgb_image)

        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0].landmark
            return [coord for lm in landmarks for coord in (lm.x, lm.y, lm.z)]
        return None

