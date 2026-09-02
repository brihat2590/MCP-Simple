# MCP-Simple

FastAPI backend plus a local MCP server.

## Vercel deployment

This repo is configured for Vercel's FastAPI runtime through `src/app.py`, which
exports the FastAPI `app` from `src/rest_api/app.py`.

Required Vercel environment variable:

```text
OPENWEATHER_API_KEY=your_openweather_api_key
```

Deploy with the Vercel CLI:

```bash
vercel
```

Useful endpoints after deployment:

```text
GET /
GET /health
GET /api/health
GET /api/weather?city=London
POST /mcp
```

`/mcp` is the MCP streamable HTTP endpoint. The health endpoints are normal
JSON endpoints, so use those for Vercel deployment checks.

## Local REST API

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
OPENWEATHER_API_KEY=your_openweather_api_key uvicorn src.app:app --reload --port 9000
```
