import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaHome, FaBriefcase, FaUsers, FaUser, FaSignOutAlt } from "react-icons/fa";

const SKILL_OPTIONS = [
  // Programming Languages
  "Python", "Java", "JavaScript", "TypeScript", "C", "C++", "C#", 
  "PHP", "Ruby", "Go", "Swift", "Kotlin", "Rust", "Scala", "R",
  
  // Web Development - Frontend
  "HTML", "CSS", "React", "Angular", "Vue.js", "Next.js", "Svelte",
  "jQuery", "Bootstrap", "Tailwind CSS", "Material UI", "SASS", "LESS",
  
  // Web Development - Backend
  "Node.js", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot",
  "ASP.NET", "Laravel", "Ruby on Rails", "GraphQL", "REST API",
  
  // Mobile Development
  "React Native", "Flutter", "Android Development", "iOS Development",
  "Xamarin", "Ionic",
  
  // Database
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle",
  "MS SQL Server", "SQLite", "Cassandra", "DynamoDB", "Firebase",
  
  // Cloud & DevOps
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins",
  "Git", "GitHub", "GitLab", "CI/CD", "Terraform", "Ansible",
  
  // Data Science & AI/ML
  "Machine Learning", "Deep Learning", "Data Analysis", "Data Science",
  "TensorFlow", "PyTorch", "Keras", "Pandas", "NumPy", "Scikit-learn",
  "Power BI", "Tableau", "Excel", "Statistics",
  
  // Design & UI/UX
  "UI/UX Design", "Figma", "Adobe XD", "Sketch", "Photoshop",
  "Illustrator", "InDesign", "Canva", "Wireframing", "Prototyping",
  
  // Software Development
  "Agile", "Scrum", "Jira", "Testing", "QA", "Unit Testing",
  "Integration Testing", "Test Automation", "Selenium", "Jest",
  
  // Soft Skills
  "Communication", "Leadership", "Team Management", "Problem Solving",
  "Time Management", "Public Speaking", "Critical Thinking",
  "Project Management", "Presentation Skills", "Teamwork",
  
  // Other Technical
  "Linux", "Windows Server", "Networking", "Cybersecurity",
  "Blockchain", "Solidity", "Ethical Hacking", "Penetration Testing",
  "SEO", "Digital Marketing", "Content Writing"
];

function PostJob() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState({ skill_name: "", required_level: "" });

  const [form, setForm] = useState({
    job_title: "",
    job_type: "",
    job_mode: "",
    location: "",
    salary_range: "",
    description: "",
    responsibilities: "",
    requirements: "",
    application_deadline: "",
    application_link: ""
  });

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/company/dashboard" },
    { name: "Profile", icon: <FaUser />, path: "/company/profile" },
    { name: "Post Job", icon: <FaBriefcase />, path: "/company/post-job" },
    { name: "My Jobs", icon: <FaBriefcase />, path: "/company/my-jobs" },
    { name: "Applicants", icon: <FaUsers />, path: "/company/applicants" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("userType");
    logout();
    navigate("/company/login");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    if (currentSkill.skill_name && currentSkill.required_level) {
      setRequiredSkills([...requiredSkills, currentSkill]);
      setCurrentSkill({ skill_name: "", required_level: "" });
    }
  };

  const removeSkill = (index) => {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user}`
        },
        body: JSON.stringify({ ...form, required_skills: requiredSkills })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      setSuccess("Job posted successfully!");
      setForm({
        job_title: "",
        job_type: "",
        job_mode: "",
        location: "",
        salary_range: "",
        description: "",
        responsibilities: "",
        requirements: "",
        application_deadline: "",
        application_link: ""
      });
      setRequiredSkills([]);
    } catch (err) {
      setError("Server error");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-gray-900 text-white flex flex-col justify-between p-6">
        <div>
          <h2 className="text-2xl font-bold mb-8">Company Portal</h2>
          <ul className="space-y-4">
            {menuItems.map((item, index) => (
              <li
                key={index}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-700 p-2 rounded-lg transition"
              >
                {item.icon}
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 bg-red-500 hover:bg-red-600 p-2 rounded-lg transition"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>

      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Post New Job</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

        <div className="bg-white p-6 rounded-xl shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="job_title" placeholder="Job Title *" value={form.job_title} onChange={handleChange} required className="input" />

            <div className="grid grid-cols-2 gap-4">
              <select name="job_type" value={form.job_type} onChange={handleChange} required className="input">
                <option value="">Job Type *</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Internship</option>
                <option>Freelance</option>
                <option>Contract</option>
              </select>

              <select name="job_mode" value={form.job_mode} onChange={handleChange} required className="input">
                <option value="">Job Mode *</option>
                <option>Remote</option>
                <option>On-site</option>
                <option>Hybrid</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="input" />
              <input name="salary_range" placeholder="Salary Range (e.g., 5-8 LPA)" value={form.salary_range} onChange={handleChange} className="input" />
            </div>

            <textarea name="description" placeholder="Job Description *" value={form.description} onChange={handleChange} rows="4" required className="input" />
            <textarea name="responsibilities" placeholder="Responsibilities" value={form.responsibilities} onChange={handleChange} rows="3" className="input" />
            <textarea name="requirements" placeholder="Requirements" value={form.requirements} onChange={handleChange} rows="3" className="input" />

            <div className="grid grid-cols-2 gap-4">
              <input type="date" name="application_deadline" value={form.application_deadline} onChange={handleChange} className="input" />
              <input name="application_link" placeholder="Application Link (optional)" value={form.application_link} onChange={handleChange} className="input" />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold mb-3">Required Skills</h3>
              <div className="flex gap-2 mb-3">
                <select
                  value={currentSkill.skill_name}
                  onChange={(e) => setCurrentSkill({ ...currentSkill, skill_name: e.target.value })}
                  className="input flex-1"
                >
                  <option value="">Select Skill</option>
                  {SKILL_OPTIONS.map((skill, i) => (
                    <option key={i} value={skill}>{skill}</option>
                  ))}
                </select>

                <select
                  value={currentSkill.required_level}
                  onChange={(e) => setCurrentSkill({ ...currentSkill, required_level: e.target.value })}
                  className="input flex-1"
                >
                  <option value="">Level</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>

                <button type="button" onClick={addSkill} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {skill.skill_name} ({skill.required_level})
                    <button type="button" onClick={() => removeSkill(index)} className="text-red-600 hover:text-red-800">✕</button>
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Post Job
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PostJob;