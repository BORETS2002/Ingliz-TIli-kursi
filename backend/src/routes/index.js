const bcrypt = require("bcryptjs");
const { requireAdmin } = require("../lib/auth");
const {
  registrationCreateSchema,
  registrationStatusSchema,
  adminLoginSchema,
  contentPatchSchema,
} = require("../lib/schemas");

async function ensureAdminUser(app) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return;

  const { rows } = await app.db.query("SELECT id FROM admin_users WHERE username=$1", [username]);
  if (rows.length > 0) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await app.db.query(
    "INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)",
    [username, passwordHash]
  );
  app.log.info("Admin user created from env.");
}

async function routes(app) {
  await ensureAdminUser(app);

  app.post("/api/leads", async (request, reply) => {
    const parsed = registrationCreateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload", details: parsed.error.issues });
    }
    const body = parsed.data;

    const id =
      Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);

    await app.db.query(
      `INSERT INTO registrations (id, first_name, last_name, phone, course, note, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,'new', NOW())`,
      [id, body.firstName, body.lastName, body.phone, body.course, body.note || ""]
    );

    return reply.code(201).send({ id });
  });

  app.post("/api/admin/login", async (request, reply) => {
    const parsed = adminLoginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload" });
    }
    const { username, password } = parsed.data;

    const { rows } = await app.db.query(
      "SELECT id, password_hash FROM admin_users WHERE username=$1",
      [username]
    );
    if (rows.length === 0) return reply.code(401).send({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return reply.code(401).send({ error: "Invalid credentials" });

    const token = await reply.jwtSign(
      { sub: String(rows[0].id), username },
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    return reply.send({ token });
  });

  app.get("/api/admin/registrations", { preHandler: requireAdmin }, async (req) => {
    // Drop expired "not" rows older than 1 hour
    await app.db.query(
      `DELETE FROM registrations
       WHERE status='not'
         AND status_updated_at IS NOT NULL
         AND status_updated_at < NOW() - INTERVAL '1 hour'`
    );

    const limit = Math.min(Number(req.query.limit || 500), 2000);
    const { rows } = await app.db.query(
      `SELECT id,
              first_name AS "firstName",
              last_name AS "lastName",
              phone,
              course,
              note,
              status,
              status_updated_at AS "statusUpdatedAt",
              created_at AS "createdAt"
       FROM registrations
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    return { items: rows };
  });

  app.patch(
    "/api/admin/registrations/:id/status",
    { preHandler: requireAdmin },
    async (request, reply) => {
      const parsed = registrationStatusSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "Invalid payload" });
      const status = parsed.data.status;
      const id = request.params.id;
      const { rowCount } = await app.db.query(
        `UPDATE registrations
         SET status=$2,
             status_updated_at=NOW()
         WHERE id=$1`,
        [id, status]
      );
      if (rowCount === 0) return reply.code(404).send({ error: "Not found" });
      return { ok: true };
    }
  );

  app.get("/api/content", async () => {
    const { rows } = await app.db.query("SELECT key, value FROM content_kv");
    const entries = {};
    rows.forEach((r) => {
      entries[r.key] = r.value;
    });
    return { entries };
  });

  app.patch("/api/admin/content", { preHandler: requireAdmin }, async (request, reply) => {
    const parsed = contentPatchSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload" });
    }
    const entries = parsed.data.entries;

    const keys = Object.keys(entries);
    if (keys.length === 0) return { ok: true };

    const client = await app.db.connect();
    try {
      await client.query("BEGIN");
      for (const k of keys) {
        const v = entries[k];
        await client.query(
          `INSERT INTO content_kv (key, value, updated_at)
           VALUES ($1,$2,NOW())
           ON CONFLICT (key)
           DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
          [k, v]
        );
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      app.log.error(e);
      return reply.code(500).send({ error: "Failed to save" });
    } finally {
      client.release();
    }

    return { ok: true };
  });
}

module.exports = { routes };

