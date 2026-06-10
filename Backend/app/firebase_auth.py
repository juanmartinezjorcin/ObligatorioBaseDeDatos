import os
from typing import Optional
import firebase_admin
from firebase_admin import auth as fb_auth, credentials


def init_firebase():
    if not firebase_admin._apps:
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # Initialize default app (requires environment setup or will fail)
            firebase_admin.initialize_app()


def verify_id_token(id_token: str) -> Optional[dict]:
    init_firebase()
    try:
        decoded = fb_auth.verify_id_token(id_token)
        return decoded
    except Exception:
        return None
