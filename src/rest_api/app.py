from fastapi import FastAPI, HTTPException, Query
from src.services.weather_service import get_weather as fetch_weather

app = FastAPI(title="Weather REST API")


@app.get("/")
def read_root():
    return {"status": "ok", "service": "weather-rest-api"}


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "weather-rest-api"}


@app.get("/api/weather")
def get_weather(city: str = Query(..., description="City name, e.g. 'London'")):
    result = fetch_weather(city)
    if "error" in result:
        status = 404 if "not found" in result["error"].lower() else 500
        raise HTTPException(status_code=status, detail=result["error"])
    return result
