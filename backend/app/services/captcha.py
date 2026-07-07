import httpx

from app.core.config import settings

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


def verify_turnstile_token(token: str, remote_ip: str | None = None) -> bool:
    if not settings.TURNSTILE_SECRET_KEY:
        return False

    data: dict[str, str] = {
        "secret": settings.TURNSTILE_SECRET_KEY,
        "response": token,
    }
    if remote_ip:
        data["remoteip"] = remote_ip

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(TURNSTILE_VERIFY_URL, data=data)
            response.raise_for_status()
            result = response.json()
    except (httpx.HTTPError, ValueError):
        return False

    return bool(result.get("success"))
