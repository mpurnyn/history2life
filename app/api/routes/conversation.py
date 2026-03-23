import asyncio
from pathlib import Path
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

import json
from services.nova_tool_use import BedrockStreamManager, load_persona

router = APIRouter()

_APP_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(_APP_DIR / "templates"))


def list_personas() -> list[dict]:
    data_dir = _APP_DIR / "data" / "personas"
    personas = []
    for f in sorted(data_dir.glob("*.json")):
        try:
            p = json.loads(f.read_text())
            if "id" in p and "persona_name" in p:
                personas.append({"id": p["id"], "name": p["persona_name"]})
        except Exception:
            continue
    return personas


@router.get("/conversation", response_class=HTMLResponse)
@router.get("/conversation/{persona_id}", response_class=HTMLResponse)
async def conversation_page(request: Request, persona_id: int = 1):
    persona = load_persona(persona_id)
    persona_name = persona.get("persona_name", "")
    return templates.TemplateResponse(
        request,
        "conversation.html",
        {
            "persona_id": persona_id,
            "persona_name": persona_name,
            "persona_image_url": f"/static/images/personas/{persona_id}.png",
            "personas": list_personas(),
        },
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
