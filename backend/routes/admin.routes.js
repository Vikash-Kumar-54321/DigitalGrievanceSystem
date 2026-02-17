const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const auth = require("../middleware/auth.middleware");
const checkRole = require("../middleware/role.middleware");

router.post(
  "/create-department",
  auth,
  checkRole("admin"),
  async (req, res) => {
    const { name, email, password, level, parentDepartment } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashed,
      role: "department",
      department: name,
      level,
      parentDepartment: parentDepartment || null,
    });

    res.send("Department created successfully");
  }
);

module.exports = router;
