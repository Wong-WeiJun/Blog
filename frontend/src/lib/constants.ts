export const BRAND_NAME = "Wong Wei Jun";
export const BRAND_DOMAIN = "BlogIn";
export const LOGO_SRC = "/logo.svg";
export const BRAND_EMAIL = "wong.weijun923@gmail.com";
export const BRAND_HANDLE = "Wei Jun Wong";
export const BRAND_GITHUB = "Wong-WeiJun";
export const BRAND_TWITTER = "@SakaiWJWong";
export const COPYRIGHT_YEAR = new Date().getFullYear();

const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
export const API_BASE_URL = apiBase;
export const RSS_FEED_URL = `${apiBase}/api/v1/feed.xml`;
