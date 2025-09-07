export const config = {
  app: {
    name: process.env["NEXT_PUBLIC_APP_NAME"] || "Quant Trading System",
    version: process.env["NEXT_PUBLIC_APP_VERSION"] || "0.1.0",
    env: process.env["NEXT_PUBLIC_ENV"] || "development",
    debug: process.env["NEXT_PUBLIC_DEBUG"] === "true",
  },
  api: {
    baseUrl: process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:1666",
    timeout: Number(process.env["NEXT_PUBLIC_API_TIMEOUT"]) || 30000,
    wsUrl: process.env["NEXT_PUBLIC_WS_URL"] || "ws://localhost:1666/ws",
  },
  port: Number(process.env["PORT"]) || 3668,
};
