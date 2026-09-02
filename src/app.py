from contextlib import asynccontextmanager

from fastapi.middleware.cors import CORSMiddleware
from src.mcp_server.server import mcp
from src.rest_api.app import app

mcp_app = mcp.streamable_http_app(
    streamable_http_path="/mcp",
    stateless_http=True,
)


@asynccontextmanager
async def lifespan(_app):
    async with mcp_app.router.lifespan_context(mcp_app):
        yield


app.router.lifespan_context = lifespan

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/", mcp_app)
