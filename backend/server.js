const express = require("express");
const mongoose = require("mongoose");
const Complaint = require("./models/Complaint");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const auth = require("./middleware/auth.middleware");
const checkRole = require("./middleware/role.middleware");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");

require("dotenv").config();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use(express.static("public"));
app.use("/admin", adminRoutes);
app.set("view engine", "ejs");
app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files allowed"));
    }
  },
});
app.get("/", (req, res) => {
  res.render("index", {
    title: "Digital Grievance System",
    message: "Backend with EJS is working"
  });
});


app.get(
  "/student/dashboard",
  auth,
  checkRole("student"),
  async (req, res) => {
    const complaints = await Complaint.find({
      student: req.user.id,
    }).sort({ createdAt: -1 });

    res.render("student-dashboard", { complaints });
  }
);


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

app.get(
  "/department/dashboard",
  auth,
  checkRole("department"),
  async (req, res) => {
    const complaints = await Complaint.find({
      department: req.user.department,
    }).sort({ createdAt: -1 });

    res.render("department-dashboard", { complaints });
  }
);

app.post(
  "/department/update-status/:id",
  auth,
  checkRole("department"),
  upload.single("proofDocument"),
  async (req, res) => {

    const updateData = {
      status: req.body.status,
    };

    if (req.body.status === "Resolved") {
      updateData.remarks = req.body.remarks;
      updateData.proofDocument = req.file
        ? req.file.filename
        : null;
    }

    await Complaint.findByIdAndUpdate(req.params.id, updateData);

    res.redirect("/department/dashboard");
  }
);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
