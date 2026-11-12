const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  departmentId: user.department_id,
});

const createToken = (user) => jwt.sign(
  { role: user.role, email: user.email },
  process.env.JWT_SECRET,
  { subject: user.id, expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
);

const validEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const validMobile = (mobile) => /^\d{10,15}$/.test(mobile);

const register = async (req, res, next) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const mobile = String(req.body.mobile || "").trim();
  const password = String(req.body.password || "");

  if (!name || !email || !mobile || !password) {
    return res.status(400).json({ message: "Name, email, mobile and password are required" });
  }
  if (name.length > 150 || !validEmail(email) || !validMobile(mobile)) {
    return res.status(400).json({ message: "Please provide a valid name, email and 10–15 digit mobile number" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must contain at least 8 characters" });
  }

  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR mobile = $2",
      [email, mobile],
    );
    if (existing.rowCount) {
      return res.status(409).json({ message: "An account already uses this email or mobile number" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, mobile, password_hash, role, department_id)
       VALUES ($1, $2, $3, $4, 'citizen', NULL)
       RETURNING id, name, email, mobile, role, department_id`,
      [name, email, mobile, passwordHash],
    );
    const user = result.rows[0];

    return res.status(201).json({
      message: "Citizen account created successfully",
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "An account already uses this email or mobile number" });
    }
    return next(error);
  }
};

const login = async (req, res, next) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, email, mobile, password_hash, role, department_id, is_active
       FROM users WHERE email = $1`,
      [email],
    );
    const user = result.rows[0];
    const passwordMatches = user && await bcrypt.compare(password, user.password_hash);

    if (!user || !passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.is_active) {
      return res.status(403).json({ message: "This account has been deactivated" });
    }

    return res.json({
      message: "Login successful",
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const me = (req, res) => res.json({ user: publicUser(req.user) });

const logout = (req, res) => res.json({ message: "Signed out successfully" });

const dashboard = (role) => (req, res) => res.json({
  message: `Welcome to the ${role.replace("_", " ")} dashboard`,
  user: publicUser(req.user),
});

module.exports = { register, login, me, logout, dashboard };
