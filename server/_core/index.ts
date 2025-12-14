import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";

// Create the Express app
const app = express();

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// OAuth callback under /api/oauth/callback
registerOAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// For Netlify Functions - export a handler
export const handler = async (event: any, context: any) => {
  const serverless = await import("serverless-http");
  const serverlessHandler = serverless.default(app);
  return serverlessHandler(event, context);
};

// Production only: serve static files
// In development, tsx runs this file and Vite handles static files separately
if (process.env.NODE_ENV !== "development") {
  const distPath = path.resolve(
    typeof __dirname !== "undefined" ? __dirname : ".",
    "public"
  );
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use("*", (_req: any, res: any) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
}

// Development mode: start local server with Vite HMR
// This block only runs with tsx (not bundled code)
if (process.env.NODE_ENV === "development") {
  (async () => {
    const { createServer } = await import("http");
    const net = await import("net");
    const { setupVite } = await import("./vite");

    const server = createServer(app);
    await setupVite(app, server);

    // Find available port
    const isPortAvailable = (port: number): Promise<boolean> =>
      new Promise(resolve => {
        const testServer = net.createServer();
        testServer.listen(port, () => {
          testServer.close(() => resolve(true));
        });
        testServer.on("error", () => resolve(false));
      });

    let port = parseInt(process.env.PORT || "3000");
    for (let i = 0; i < 20; i++) {
      if (await isPortAvailable(port + i)) {
        port = port + i;
        break;
      }
    }

    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/`);
    });
  })().catch(console.error);
}

