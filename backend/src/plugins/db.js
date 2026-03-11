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
  const dbUrl = process.env.DATABASE_URL || "";
  const usePg = dbUrl.startsWith("postgres://");

  if (usePg) {
    const { Pool } = require("pg");
    const pool = new Pool({
      connectionString: dbUrl,
      max: Number(process.env.DB_POOL_MAX || 20),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS || 10_000),
      query_timeout: Number(process.env.DB_QUERY_TIMEOUT_MS || 10_000),
    });
    pool.isPg = true;
    fastify.decorate("db", pool);
    fastify.addHook("onClose", async () => await pool.end());
  } else {
    // Fallback to SQLite (No external DB required) local development
    const Database = require("better-sqlite3");
    const path = require("path");
    const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, "..", "..", "database.sqlite");
    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");

    const pool = {
      isPg: false,
      exec: (sql) => db.exec(sql),
      query: async (text, params) => {
        let sql = text.replace(/\$\d+/g, '?');
        const isSelect = /^\s*(SELECT|PRAGMA|EXPLAIN|WITH)/i.test(sql);
        if (isSelect) {
          const rows = db.prepare(sql).all(params || []);
          return { rows, rowCount: rows.length };
        } else {
          const info = db.prepare(sql).run(params || []);
          return { rowCount: info.changes, rows: [] };
        }
      },
      connect: async () => {
        return {
          query: async (text, params) => {
            let sql = text.replace(/\$\d+/g, '?');
            if (/^\s*(BEGIN|COMMIT|ROLLBACK)/i.test(sql)) {
              db.exec(sql);
              return { rowCount: 0, rows: [] };
            }
            return pool.query(text, params);
          },
          release: () => {}
        };
      },
      end: async () => db.close()
    };
    fastify.decorate("db", pool);
    fastify.addHook("onClose", async () => pool.end());
  }
}

module.exports.buildDb = fp(dbPlugin, { name: "db" });

