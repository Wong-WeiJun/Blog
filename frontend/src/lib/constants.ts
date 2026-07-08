export const BRAND_NAME = "Wong Wei Jun";
export const BRAND_DOMAIN = "wongweijun.me";
export const BRAND_EMAIL = "wong.weijun923@gmail.com";
export const BRAND_HANDLE = "Wei Jun Wong";
export const BRAND_GITHUB = "Wong-WeiJun";
export const BRAND_TWITTER = "@SakaiWJWong";
export const COPYRIGHT_YEAR = new Date().getFullYear();

const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
export const RSS_FEED_URL = apiBase ? `${apiBase}/api/v1/feed.xml` : "/api/v1/feed.xml";
