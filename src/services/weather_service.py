import os

import httpx

OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"


def get_weather(city: str) -> dict:
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        return {"error": "OPENWEATHER_API_KEY is not set"}

    try:
        resp = httpx.get(
            OPENWEATHER_URL,
            params={"q": city, "appid": api_key, "units": "metric"},
            timeout=10,
        )
    except httpx.RequestError as exc:
        return {"error": f"OpenWeather unreachable: {exc}"}

    if resp.status_code == 404:
        return {"error": f"City '{city}' not found"}
    if resp.status_code != 200:
        return {"error": f"OpenWeather error (status {resp.status_code})"}

    data = resp.json()
    return {
        "city": data.get("name"),
        "country": data.get("sys", {}).get("country"),
        "description": data.get("weather", [{}])[0].get("description"),
        "temp_c": data.get("main", {}).get("temp"),
        "feels_like_c": data.get("main", {}).get("feels_like"),
        "humidity": data.get("main", {}).get("humidity"),
        "wind_mps": data.get("wind", {}).get("speed"),
    }
