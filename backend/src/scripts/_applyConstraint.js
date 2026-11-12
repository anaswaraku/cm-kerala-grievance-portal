const { Pool } = require("pg");
require("dotenv").config();

const sql = `
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_department_check') THEN
      ALTER TABLE users ADD CONSTRAINT users_role_department_check
        CHECK (
          (role = 'citizen' AND department_id IS NULL)
          OR role = 'cmo_admin'
          OR (role = 'department_officer' AND department_id IS NOT NULL)
        );
    END IF;
  END $$;
`;

const apply = async () => {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: "postgres",
    password: process.env.DB_PASSWORD,
  });
  try {
    await pool.query(sql);
    console.log("Department role rule is in place.");
  } finally {
    await pool.end();
  }
};

apply().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
