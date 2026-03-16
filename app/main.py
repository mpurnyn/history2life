from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from api.routes.conversation import router as conversation_router

app = FastAPI()

app.include_router(conversation_router)


@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/health")
def health():
    return {"status": "healthy"}
