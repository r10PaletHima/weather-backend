const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1]; // Get token from Authorization header
  
  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = decoded; // Add the decoded user data to the request object
    next();
  });
};

module.exports = auth;
