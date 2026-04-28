const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "supersecret";
const PASSWORD = process.env.DASHBOARD_PASSWORD || "supersecret";

module.exports = {
  login(req, res) {
    const { username, password } = req.body;
    if (username !== "admin" || password !== PASSWORD) return res.status(401).json({ error: "Invalid login" });
    const token = jwt.sign({ user: "admin" }, SECRET, { expiresIn: "1d" });
    res.json({ token });
  },
  verify(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No auth" });
    try {
      const token = authHeader.split(" ")[1];
      jwt.verify(token, SECRET);
      next();
    } catch (err) { res.status(403).json({ error: "Invalid token" }); }
  }
};
