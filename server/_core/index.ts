import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
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
// The handler strips the /.netlify/functions/index prefix that Netlify adds
export const handler = async (event: any, context: any) => {
  // Dynamically import serverless-http only when needed
  const serverless = await import("serverless-http");
  const serverlessHandler = serverless.default(app);
  return serverlessHandler(event, context);
};

// Static file serving for production (inline to avoid importing vite.ts)
function serveStatic(expressApp: express.Express) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  expressApp.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  expressApp.use("*", (_req: any, res: any) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// For development mode - start local server
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const server = createServer(app);

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    // Dynamically import vite.ts only in development to avoid bundling vite dependencies
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

// Only start the server in development mode
// In production (Netlify Functions), the handler export is used
if (process.env.NODE_ENV === "development") {
  startServer().catch(console.error);
}
