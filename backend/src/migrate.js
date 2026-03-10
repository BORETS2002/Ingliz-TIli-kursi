const fs = require("fs");
const path = require("path");

async function migrate(app) {
  // idempotent migrations by applying a single schema.sql (for now)
  const sqlPath = path.join(__dirname, "..", "sql", "schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  await app.db.query(sql);
}

module.exports = { migrate };

