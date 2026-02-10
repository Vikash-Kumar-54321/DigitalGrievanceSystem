const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth.routes");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(express.static("public"));
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


app.listen(5000, () => {
  console.log("Server running on port 5000");
});
