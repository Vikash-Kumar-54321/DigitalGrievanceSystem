const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use(express.static("public"));
app.use("/admin", adminRoutes);
app.set("view engine", "ejs");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.render("index", {
    title: "Digital Grievance System",
    message: "Backend with EJS is working"
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});



app.get("/admin/dashboard", (req, res) => {
  res.render("admin-dashboard");
});



app.listen(5000, () => {
  console.log("Server running on port 5000");
});
