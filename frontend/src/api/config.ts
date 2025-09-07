export const API_BASE_URL = process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:1666";
export const API_TIMEOUT = Number(process.env["NEXT_PUBLIC_API_TIMEOUT"]) || 30000;
export const WS_URL = process.env["NEXT_PUBLIC_WS_URL"] || "ws://localhost:1666/ws";
