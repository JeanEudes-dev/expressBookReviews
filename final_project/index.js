const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();
const PORT = 5000;


app.use(express.json());


app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);


app.use("/customer/auth/*", function auth(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied, no token provided." });
  }

  // Verify the token
  jwt.verify(token, "yeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyIiwiaWF0IjoxNzMwMzIxNDU4LCJleHAiOjE3MzAzMjUwNTh9.YII4lBip296JrRDiy-7BtCQm2zu-7iWLxBI2IX5XOj4", (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }
    
    req.user = decoded;
    next();
  });
});

// Route setup
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start the server
app.listen(PORT, () => console.log("Server is running on port " + PORT));
