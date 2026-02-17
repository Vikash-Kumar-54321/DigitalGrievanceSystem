const express = require("express");
const mongoose = require("mongoose");
const Complaint = require("./models/Complaint");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const auth = require("./middleware/auth.middleware");
const checkRole = require("./middleware/role.middleware");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
app.use(cookieParser());
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


app.get("/student/dashboard", auth, checkRole("student"), (req, res) => {
  res.render("student-dashboard");
});


app.post("/student/submit-complaint", auth, checkRole("student"), async (req, res) => {
  const { department, message } = req.body;

  await Complaint.create({
    student: req.user.id,
    department,
    message,
  });

  res.send("Complaint submitted successfully");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});


app.get("/admin/dashboard", (req, res) => {
  res.render("admin-dashboard");
});



app.listen(5000, () => {
  console.log("Server running on port 5000");
});
