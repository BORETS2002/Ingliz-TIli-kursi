const fp = require("fastify-plugin");
const { Pool } = require("pg");

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing env: ${name}`);
  }
  return v;
}

async function dbPlugin(fastify) {
  const pool = new Pool({
    connectionString: requiredEnv("DATABASE_URL"),
    max: Number(process.env.DB_POOL_MAX || 20),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS || 10_000),
    query_timeout: Number(process.env.DB_QUERY_TIMEOUT_MS || 10_000),
  });

  fastify.decorate("db", pool);

  fastify.addHook("onClose", async () => {
    await pool.end();
  });
}

module.exports.buildDb = fp(dbPlugin, { name: "db" });

