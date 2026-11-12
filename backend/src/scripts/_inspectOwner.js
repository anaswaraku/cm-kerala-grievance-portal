const pool = require("../config/db");

const inspect = async () => {
  const result = await pool.query(
    `SELECT current_user,
            pg_get_userbyid(c.relowner) AS owner
     FROM pg_class c
     WHERE c.relname = 'users'`,
  );
  console.log(result.rows[0]);
  await pool.end();
};

inspect().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
