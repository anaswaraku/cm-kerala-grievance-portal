const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const authenticate = async (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication is required" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      `SELECT id, name, email, mobile, role, department_id, is_active
       FROM users
       WHERE id = $1`,
      [payload.sub],
    );
    const user = result.rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({ message: "This account is unavailable" });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Your session is invalid or has expired" });
    }
    return next(error);
  }
};

module.exports = authenticate;
