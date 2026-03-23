import os
import firebase_admin
from firebase_admin import auth, credentials

_app = None

def get_firebase_app():
    global _app
    if _app is None:
        sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT")
        if sa_path:
            cred = credentials.Certificate(sa_path)
            _app = firebase_admin.initialize_app(cred)
        else:
            _app = firebase_admin.initialize_app(options={
                "projectId": os.getenv("FIREBASE_PROJECT_ID", "history2life-7dd4b"),
            })
    return _app

def verify_token(id_token: str) -> dict:
    get_firebase_app()
    return auth.verify_id_token(id_token)
