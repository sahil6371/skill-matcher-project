import {
  FaHome,
  FaUser,
  FaBriefcase,
  FaChartBar,
  FaGraduationCap,
  FaTools,
  FaLanguage,
  FaBriefcase as FaExperience,
  FaProjectDiagram,
  FaCertificate,
  FaFileAlt,
  FaSignOutAlt
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
  { name: "Home", icon: <FaHome />, path: "/dashboard" },
  { name: "Profile", icon: <FaUser />, path: "/profile" },
  { name: "Education", icon: <FaGraduationCap />, path: "/education" },
  { name: "Skills", icon: <FaTools />, path: "/skills" },
  { name: "Languages", icon: <FaLanguage />, path: "/languages" },
  { name: "Experience", icon: <FaExperience />, path: "/experience" },
  { name: "Projects", icon: <FaProjectDiagram />, path: "/projects" },
  { name: "Certifications", icon: <FaCertificate />, path: "/certifications" },
  { name: "Jobs", icon: <FaBriefcase />, path: "/jobs" },
  { name: "My Applications", icon: <FaFileAlt />, path: "/my-applications" },
  { name: "Analytics", icon: <FaChartBar />, path: "/analytics" },
  { name: "Generate Resume", icon: <FaFileAlt />, path: "/generate-resume" }, // NEW
];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col justify-between p-5 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold mb-8">SkillMatcher</h2>

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
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="flex items-center gap-3 bg-red-500 hover:bg-red-600 p-2 rounded-lg transition"
      >
        <FaSignOutAlt />
        Logout
      </button>
    </div>
  );
}

export default Sidebar;