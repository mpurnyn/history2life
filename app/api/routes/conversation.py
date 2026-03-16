import asyncio
from pathlib import Path
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from services.nova_tool_use import BedrockStreamManager, load_persona

router = APIRouter()

_APP_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(_APP_DIR / "templates"))


@router.get("/conversation", response_class=HTMLResponse)
@router.get("/conversation/{persona_id}", response_class=HTMLResponse)
async def conversation_page(request: Request, persona_id: int = 1):
    return templates.TemplateResponse(
        "conversation.html",
        {"request": request, "persona_id": persona_id},
    )


@router.websocket("/ws/conversation/{persona_id}")
async def websocket_conversation(websocket: WebSocket, persona_id: int = 1):
    await websocket.accept()
    persona = load_persona(persona_id)
    stream_manager = BedrockStreamManager(model_id="amazon.nova-2-sonic-v1:0", region="us-east-1", persona=persona)
    try:
        await stream_manager.initialize_stream()
        await stream_manager.send_audio_content_start_event()

        async def receive_loop():
            async for data in websocket.iter_bytes():
                stream_manager.add_audio_chunk(data)

        async def send_loop():
            while True:
                audio = await stream_manager.audio_output_queue.get()
                await websocket.send_bytes(audio)

        receive_task = asyncio.create_task(receive_loop())
        send_task = asyncio.create_task(send_loop())

        done, pending = await asyncio.wait(
            [receive_task, send_task],
            return_when=asyncio.FIRST_COMPLETED,
        )
        for task in pending:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket conversation error: {e}")
    finally:
        await stream_manager.close()
