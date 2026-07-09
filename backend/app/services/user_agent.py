from dataclasses import dataclass


@dataclass(frozen=True)
class ParsedUserAgent:
    device: str
    browser: str
    os: str
    device_type: str


def parse_user_agent(user_agent: str | None) -> ParsedUserAgent:
    if not user_agent:
        return ParsedUserAgent(
            device="Unknown device",
            browser="Unknown browser",
            os="Unknown OS",
            device_type="desktop",
        )

    ua = user_agent.lower()

    if "iphone" in ua:
        device_type = "mobile"
        device = "iPhone"
    elif "ipad" in ua:
        device_type = "tablet"
        device = "iPad"
    elif "android" in ua and "mobile" in ua:
        device_type = "mobile"
        device = "Android phone"
    elif "android" in ua:
        device_type = "tablet"
        device = "Android tablet"
    elif "mobile" in ua:
        device_type = "mobile"
        device = "Mobile device"
    else:
        device_type = "desktop"
        if "macintosh" in ua or "mac os" in ua:
            device = "Mac"
        elif "windows" in ua:
            device = "Windows PC"
        elif "linux" in ua:
            device = "Linux PC"
        else:
            device = "Desktop"

    if "firefox/" in ua:
        browser = "Firefox"
    elif "edg/" in ua:
        browser = "Edge"
    elif "opr/" in ua or "opera" in ua:
        browser = "Opera"
    elif "chrome/" in ua and "chromium" not in ua:
        browser = "Chrome"
    elif "safari/" in ua and "chrome/" not in ua:
        browser = "Safari"
    else:
        browser = "Unknown browser"

    if "iphone" in ua or "ipad" in ua:
        os = "iOS"
    elif "android" in ua:
        os = "Android"
    elif "windows nt" in ua:
        os = "Windows"
    elif "mac os" in ua or "macintosh" in ua:
        os = "macOS"
    elif "linux" in ua:
        os = "Linux"
    else:
        os = "Unknown OS"

    return ParsedUserAgent(
        device=device,
        browser=browser,
        os=os,
        device_type=device_type,
    )
