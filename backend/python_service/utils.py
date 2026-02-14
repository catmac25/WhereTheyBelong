# import numpy as np
# import mediapipe as mp
# from PIL import Image


# def image_obj_to_numpy(image_path: str) -> np.ndarray:
#     """
#     Read an image from disk and convert to a numpy array (RGB).
#     """
#     image = Image.open(image_path).convert("RGB")
#     return np.array(image)


# def extract_face_mesh_landmarks(image: np.ndarray) -> np.ndarray | None:
#     """
#     Extract face mesh landmarks from an RGB numpy image.
#     Returns a flattened numpy array of shape (468*3,) or None if no face is found.
#     """
#     mp_face_mesh = mp.solutions.face_mesh

#     # MediaPipe requires RGB input
#     rgb_image = image.copy()

#     with mp_face_mesh.FaceMesh(
#         static_image_mode=True,
#         max_num_faces=1,
#         refine_landmarks=True,
#         min_detection_confidence=0.5
#     ) as face_mesh:

#         results = face_mesh.process(rgb_image)

#         if not results.multi_face_landmarks:
#             return None

#         # 468 landmarks, each has (x,y,z)
#         landmarks = results.multi_face_landmarks[0].landmark

#         # Flattened vector: [x1, y1, z1, x2, y2, z2, ...]
#         vector = np.array(
#             [coord for lm in landmarks for coord in (lm.x, lm.y, lm.z)],
#             dtype=np.float32
#         )

#         return vector
# import numpy as np
# import cv2
# from insightface.app import FaceAnalysis

# app = FaceAnalysis(name="buffalo_l")
# app.prepare(ctx_id=0)  # CPU (ctx_id = -1), GPU (0)

# def image_obj_to_numpy(image_path: str) -> np.ndarray:
#     return cv2.cvtColor(cv2.imread(image_path), cv2.COLOR_BGR2RGB)


# def extract_face_mesh_landmarks(image: np.ndarray) -> np.ndarray | None:
#     faces = app.get(image)

#     if len(faces) == 0:
#         return None

#     embedding = faces[0].embedding.astype(np.float32)

#     # Replace NaN / inf with zeros (prevents KNN crash)
#     embedding = np.nan_to_num(embedding, nan=0.0, posinf=0.0, neginf=0.0)

#     # Normalize embedding → IMPORTANT
#     norm = np.linalg.norm(embedding)
#     if norm == 0:
#         return None  # avoid invalid embedding

#     embedding = embedding / norm

#     return embedding
import PIL
import numpy as np
# import streamlit as st
import mediapipe as mp


def image_obj_to_numpy(image_obj) -> np.ndarray:
    """Convert a Streamlit-uploaded image object to a numpy array."""
    image = PIL.Image.open(image_obj)
    return np.array(image)


def extract_face_mesh_landmarks(image: np.ndarray):
    """
    Extract face mesh landmarks from an image using MediaPipe.
    Returns a flattened list of all (x, y, z) landmarks if a face is found, else None.
    """
    mp_face_mesh = mp.solutions.face_mesh
    with mp_face_mesh.FaceMesh(
        static_image_mode=True, max_num_faces=1, refine_landmarks=True
    ) as face_mesh:
        results = face_mesh.process(image)
        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0].landmark
            # Flatten all landmarks into a single list [x1, y1, z1, x2, y2, z2, ...]
            return [coord for lm in landmarks for coord in (lm.x, lm.y, lm.z)]
        else:
            
            return None