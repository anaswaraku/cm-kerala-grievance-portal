const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const required = [
  "CMO_ADMIN_NAME", "CMO_ADMIN_EMAIL", "CMO_ADMIN_PASSWORD",
  "OFFICER_NAME", "OFFICER_EMAIL", "OFFICER_PASSWORD",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const upsertUser = async (client, { name, email, password, role, departmentId = null }) => {
  const passwordHash = await bcrypt.hash(password, 12);
  await client.query(
    `INSERT INTO users (name, email, password_hash, role, department_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE
     SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role, department_id = EXCLUDED.department_id, is_active = TRUE`,
    [name, email.toLowerCase(), passwordHash, role, departmentId],
  );
};

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const departmentName = process.env.OFFICER_DEPARTMENT || "Public Works Department";
    const department = await client.query(
      `INSERT INTO departments (name, description)
       VALUES ($1, 'Department account created for local development')
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [departmentName],
    );
    await upsertUser(client, { name: process.env.CMO_ADMIN_NAME, email: process.env.CMO_ADMIN_EMAIL, password: process.env.CMO_ADMIN_PASSWORD, role: "cmo_admin" });
    await upsertUser(client, { name: process.env.OFFICER_NAME, email: process.env.OFFICER_EMAIL, password: process.env.OFFICER_PASSWORD, role: "department_officer", departmentId: department.rows[0].id });
    await client.query("COMMIT");
    console.log("CMO administrator and department officer accounts are ready.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Could not seed staff accounts:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
