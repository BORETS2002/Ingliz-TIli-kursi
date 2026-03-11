const fs = require("fs");
const path = require("path");

async function migrate(app) {
  // idempotent migrations by applying a single schema.sql (for now)
  const isPg = app.db.isPg;
  const fileName = isPg ? "schema-pg.sql" : "schema-sqlite.sql";
  const sqlPath = path.join(__dirname, "..", "sql", fileName);
  const sql = fs.readFileSync(sqlPath, "utf8");
  
  if (isPg) {
    await app.db.query(sql);
  } else {
    app.db.exec(sql);
  }
}

module.exports = { migrate };
