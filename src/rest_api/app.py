import os

import httpx
from fastapi import FastAPI, HTTPException, Query

# A plain REST API. This is the "external API you don't own" stand-in: the MCP
# server will call THIS over HTTP, exactly how you'd wrap a third-party service.
app = FastAPI(title="Weather REST API")

OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"


@app.get("/")
def read_root():
    return {"status": "ok", "service": "weather-rest-api"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/weather")
def get_weather(city: str = Query(..., description="City name, e.g. 'London'")):
    """Fetch current weather for a city from OpenWeather.

    Callable from Postman:  GET http://127.0.0.1:9000/api/weather?city=London
    """
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENWEATHER_API_KEY is not set")

    try:
        resp = httpx.get(
            OPENWEATHER_URL,
            params={"q": city, "appid": api_key, "units": "metric"},
            timeout=10,
        )
        print("The request to OpenWeather was successful.", resp.status_code)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"OpenWeather unreachable: {exc}") from exc

    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail=f"City '{city}' not found")
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="OpenWeather error")

    data = resp.json()
    # Trim the large OpenWeather payload down to the fields that matter.
    return {
        "city": data.get("name"),
        "country": data.get("sys", {}).get("country"),
        "description": data.get("weather", [{}])[0].get("description"),
        "temp_c": data.get("main", {}).get("temp"),
        "feels_like_c": data.get("main", {}).get("feels_like"),
        "humidity": data.get("main", {}).get("humidity"),
        "wind_mps": data.get("wind", {}).get("speed"),
    }
