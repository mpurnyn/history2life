from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path
from pydantic import BaseModel
from services.firebase_service import verify_token

router = APIRouter()

_APP_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(_APP_DIR / "templates"))


class TokenPayload(BaseModel):
    id_token: str


@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    if request.session.get("user"):
        return RedirectResponse(url="/conversation")
    return templates.TemplateResponse(request, "login.html", {})


@router.post("/auth/verify")
async def verify(request: Request, payload: TokenPayload):
    try:
        decoded = verify_token(payload.id_token)
    except Exception as e:
        print(f"Token verification failed: {type(e).__name__}: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

    request.session["user"] = {
        "uid": decoded["uid"],
        "email": decoded.get("email", ""),
        "name": decoded.get("name", ""),
    }
    return JSONResponse({"ok": True})


@router.get("/auth/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/login")
