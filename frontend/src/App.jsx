import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Otp from "./pages/Otp";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Education from "./pages/Education";
import Skills from "./pages/Skills";
import Languages from "./pages/Languages";
import Experience from "./pages/Experience";
import Projects from "./pages/Projects";
import Certifications from "./pages/Certifications";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import MyApplications from "./pages/MyApplications";
import ProtectedRoute from "./components/ProtectedRoute";

// Company routes
import CompanySignup from "./pages/CompanySignup";
import CompanyLogin from "./pages/CompanyLogin";
import CompanyOtp from "./pages/CompanyOtp";
import CompanyDashboard from "./pages/CompanyDashboard";
import CompanyProfile from "./pages/CompanyProfile";
import PostJob from "./pages/PostJob";
import MyJobs from "./pages/MyJobs";
import JobApplicants from "./pages/JobApplicants";
import MatchedStudents from "./pages/MatchedStudents";

import StudentProfileView from "./pages/StudentProfileView";

import Analytics from "./pages/Analytics";
import AllApplicants from "./pages/AllApplicants";
import GenerateResume from "./pages/GenerateResume";






function App() {
  return (
    <Routes>
      {/* Student Routes */}
      <Route path="/" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/otp" element={<Otp />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/education" element={<ProtectedRoute><Education /></ProtectedRoute>} />
      <Route path="/skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
      <Route path="/languages" element={<ProtectedRoute><Languages /></ProtectedRoute>} />
      <Route path="/experience" element={<ProtectedRoute><Experience /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/certifications" element={<ProtectedRoute><Certifications /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      <Route path="/job/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
      <Route path="/my-applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />

      {/* Company Routes */}
      <Route path="/company/signup" element={<CompanySignup />} />
      <Route path="/company/login" element={<CompanyLogin />} />
      <Route path="/company/otp" element={<CompanyOtp />} />
      <Route path="/company/dashboard" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
      <Route path="/company/profile" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
      <Route path="/company/post-job" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
      <Route path="/company/my-jobs" element={<ProtectedRoute><MyJobs /></ProtectedRoute>} />
      <Route path="/company/job-applicants/:job_id" element={<ProtectedRoute><JobApplicants /></ProtectedRoute>} />
      <Route path="/company/matched-students/:job_id" element={<ProtectedRoute><MatchedStudents /></ProtectedRoute>} />

      // Add this route in Company section
<Route path="/company/student-profile/:student_id" element={<ProtectedRoute><StudentProfileView /></ProtectedRoute>} />




// Student routes
<Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
<Route path="/generate-resume" element={<ProtectedRoute><GenerateResume /></ProtectedRoute>} />

// Company routes
<Route path="/company/applicants" element={<ProtectedRoute><AllApplicants /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;