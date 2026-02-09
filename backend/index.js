require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const educationRoutes = require("./routes/educationRoutes");
const skillsRoutes = require("./routes/skillsRoutes");
const languagesRoutes = require("./routes/languagesRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const projectsRoutes = require("./routes/projectsRoutes");
const certificationsRoutes = require("./routes/certificationsRoutes");



const formRoutes = require('./routes/formRoutes');



// Company routes
const companyAuthRoutes = require("./routes/companyAuthRoutes");
const companyProfileRoutes = require("./routes/companyProfileRoutes");
const jobsRoutes = require("./routes/jobsRoutes");
const applicationsRoutes = require("./routes/applicationsRoutes");
const matchingRoutes = require("./routes/matchingRoutes");


const studentViewRoutes = require("./routes/studentViewRoutes");
// After other imports
const companyApplicantsRoutes = require("./routes/companyApplicantsRoutes");




const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Student routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/languages", languagesRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/certifications", certificationsRoutes);

// Company routes
app.use("/api/company/auth", companyAuthRoutes);
app.use("/api/company/profile", companyProfileRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/student", studentViewRoutes);

// After other route registrations
app.use("/api/company", companyApplicantsRoutes);


app.use('/api/form', formRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});