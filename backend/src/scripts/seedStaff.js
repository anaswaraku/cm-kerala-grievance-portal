require("dotenv").config();
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

const applyRoleRules = async () => {
  try {
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
          ALTER TABLE users ADD CONSTRAINT users_role_check
            CHECK (role IN ('citizen', 'cmo_admin', 'department_officer'));
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_department_check') THEN
          ALTER TABLE users ADD CONSTRAINT users_role_department_check
            CHECK (
              (role = 'citizen' AND department_id IS NULL)
              OR role = 'cmo_admin'
              OR (role = 'department_officer' AND department_id IS NOT NULL)
            );
        END IF;
      END $$;
    `);
  } catch (error) {
    if (error.code !== "42501") throw error;
    console.warn("Skipped new role rules because this database user does not own users. The existing role check still applies.");
  }
};

const upsertUser = async (client, { name, email, password, role, departmentId = null }) => {
  const passwordHash = await bcrypt.hash(password, 12);
  await client.query(
    `INSERT INTO users (name, email, password_hash, role, department_id, is_active)
     VALUES ($1, $2, $3, $4, $5, TRUE)
     ON CONFLICT (email) DO UPDATE
     SET name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role,
         department_id = EXCLUDED.department_id,
         is_active = TRUE,
         updated_at = CURRENT_TIMESTAMP`,
    [name, email.toLowerCase(), passwordHash, role, departmentId],
  );
};

const seed = async () => {
  const client = await pool.connect();
  try {
    await applyRoleRules();
    await client.query("BEGIN");

    const departmentName = process.env.OFFICER_DEPARTMENT || "Public Works Department";
    const department = await client.query(
      `INSERT INTO departments (name, description)
       VALUES ($1, 'Fictional department used for local development and evaluation')
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
       RETURNING id`,
      [departmentName],
    );

    await upsertUser(client, {
      name: process.env.CMO_ADMIN_NAME,
      email: process.env.CMO_ADMIN_EMAIL,
      password: process.env.CMO_ADMIN_PASSWORD,
      role: "cmo_admin",
    });
    await upsertUser(client, {
      name: process.env.OFFICER_NAME,
      email: process.env.OFFICER_EMAIL,
      password: process.env.OFFICER_PASSWORD,
      role: "department_officer",
      departmentId: department.rows[0].id,
    });

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
