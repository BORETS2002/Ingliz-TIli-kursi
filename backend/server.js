/**
 * High-performance backend for Speaking Hub.
 *
 * Goals:
 * - Fastify (high throughput) + PostgreSQL
 * - JWT-protected admin endpoints
 * - Validated input with Zod
 * - Rate limiting + secure defaults (helmet, CORS)
 * - Designed to handle 1000+ concurrent requests (depends on hosting/DB)
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const path = require("path");
const Fastify = require("fastify");
const cors = require("@fastify/cors");
const helmet = require("@fastify/helmet");
const rateLimit = require("@fastify/rate-limit");
const jwt = require("@fastify/jwt");
const fastifyStatic = require("@fastify/static");

const { migrate } = require("./src/migrate");
const { buildDb } = require("./src/plugins/db");
const { routes } = require("./src/routes");

const isProd = process.env.NODE_ENV === "production";

async function start() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
      transport: isProd
        ? undefined
        : {
            target: "pino-pretty",
            options: { translateTime: "SYS:standard", ignore: "pid,hostname" },
          },
    },
    trustProxy: true,
    bodyLimit: 1024 * 64,
    disableRequestLogging: isProd,
    connectionTimeout: 15_000,
    keepAliveTimeout: 60_000,
  });

  await app.register(helmet, { global: true });
  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow same-origin, file:// (no origin), and explicit allowlist.
      if (!origin) return cb(null, true);
      const allow = (process.env.CORS_ORIGINS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (allow.length === 0) return cb(null, true);
      if (allow.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  });

  await app.register(rateLimit, {
    max: Number(process.env.RATE_LIMIT_MAX || 240),
    timeWindow: process.env.RATE_LIMIT_WINDOW || "1 minute",
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || "dev-secret-change-me",
  });

  await app.register(buildDb);
  await migrate(app);

  // Optional: serve the static frontend from project root
  if (process.env.SERVE_STATIC === "true") {
    await app.register(fastifyStatic, {
      root: path.join(__dirname, ".."),
      prefix: "/",
      decorateReply: false,
    });
  }

  await app.register(routes);

  app.get("/health", async () => ({ ok: true }));

  const fs = require('fs');
  app.get("/admin", async (req, reply) => {
    reply.type('text/html');
    return fs.readFileSync(path.join(__dirname, "..", "admin.html"), "utf8");
  });
  const host = process.env.HOST || "0.0.0.0";
  const port = Number(process.env.PORT || 3000);
  await app.listen({ host, port });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

