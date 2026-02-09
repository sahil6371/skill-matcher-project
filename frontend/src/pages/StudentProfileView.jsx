import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { FaHome, FaBriefcase, FaUsers, FaUser, FaSignOutAlt } from "react-icons/fa";

function StudentProfileView() {
  const { student_id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchStudentData();
  }, [student_id]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // Fetch basic profile
      const profileRes = await fetch(`http://localhost:5000/api/student/profile/${student_id}`, {
        headers: { Authorization: `Bearer ${user}` }
      });
      const profileData = await profileRes.json();
      setProfile(profileData.profile);

      // Fetch education
      const eduRes = await fetch(`http://localhost:5000/api/student/education/${student_id}`, {
        headers: { Authorization: `Bearer ${user}` }
      });
      const eduData = await eduRes.json();
      setEducation(eduData.education || []);

      // Fetch skills
      const skillsRes = await fetch(`http://localhost:5000/api/student/skills/${student_id}`, {
        headers: { Authorization: `Bearer ${user}` }
      });
      const skillsData = await skillsRes.json();
      setSkills(skillsData.skills || []);

      // Fetch languages
      const langRes = await fetch(`http://localhost:5000/api/student/languages/${student_id}`, {
        headers: { Authorization: `Bearer ${user}` }
      });
      const langData = await langRes.json();
      setLanguages(langData.languages || []);

      // Fetch experience
      const expRes = await fetch(`http://localhost:5000/api/student/experience/${student_id}`, {
        headers: { Authorization: `Bearer ${user}` }
      });
      const expData = await expRes.json();
      setExperience(expData.experience || []);

      // Fetch projects
      const projRes = await fetch(`http://localhost:5000/api/student/projects/${student_id}`, {
        headers: { Authorization: `Bearer ${user}` }
      });
      const projData = await projRes.json();
      setProjects(projData.projects || []);

      // Fetch certifications
      const certRes = await fetch(`http://localhost:5000/api/student/certifications/${student_id}`, {
        headers: { Authorization: `Bearer ${user}` }
      });
      const certData = await certRes.json();
      setCertifications(certData.certifications || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="w-64 bg-gray-900 text-white p-6">
          <h2 className="text-2xl font-bold">Company Portal</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="w-64 bg-gray-900 text-white p-6">
          <h2 className="text-2xl font-bold">Company Portal</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl">Student profile not found</p>
        </div>
      </div>
    );
  }

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

      <div className="flex-1 p-10 overflow-y-auto">
        <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">
          ← Back
        </button>

        <h1 className="text-3xl font-bold mb-6">Student Profile</h1>

        {/* Basic Profile */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <div className="flex items-start gap-6">
            {profile.profile_photo && (
              <img
                src={profile.profile_photo}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.full_name}</h2>
              <p className="text-gray-600 mt-1">{profile.email}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-semibold">{profile.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-semibold">{new Date(profile.date_of_birth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mobile</p>
                  <p className="font-semibold">{profile.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Location</p>
                  <p className="font-semibold">{profile.current_location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Country</p>
                  <p className="font-semibold">{profile.country}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hometown</p>
                  <p className="font-semibold">{profile.hometown}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-xl font-bold mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold"
                >
                  {skill.skill_name} ({skill.proficiency_level})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-xl font-bold mb-4">Education</h3>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                      {edu.degree_type}
                    </span>
                    {edu.currently_studying && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        Currently Studying
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold">{edu.field_of_study}</h4>
                  <p className="text-gray-700">{edu.institution_name}</p>
                  {edu.university_name && <p className="text-gray-600 text-sm">{edu.university_name}</p>}
                  <p className="text-gray-600 text-sm mt-1">
                    {edu.start_year} - {edu.currently_studying ? "Present" : edu.end_year || "N/A"}
                  </p>
                  {edu.grade_percentage && (
                    <p className="text-gray-700 text-sm">Grade: {edu.grade_percentage}%</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-xl font-bold mb-4">Languages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {languages.map((lang) => (
                <div key={lang.id} className="border rounded-lg p-3">
                  <h4 className="font-bold">{lang.language_name}</h4>
                  <span className="inline-block mt-1 bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                    {lang.proficiency_level}
                  </span>
                  <div className="flex gap-2 mt-2">
                    {lang.can_speak && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">🗣️ Speak</span>}
                    {lang.can_read && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">📖 Read</span>}
                    {lang.can_write && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">✍️ Write</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-xl font-bold mb-4">Experience</h3>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {exp.employment_type}
                    </span>
                    {exp.currently_working && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Current</span>
                    )}
                  </div>
                  <h4 className="font-bold">{exp.job_title}</h4>
                  <p className="text-gray-700">{exp.company_name}</p>
                  <p className="text-gray-600 text-sm">
                    {new Date(exp.start_date).toLocaleDateString()} - {exp.currently_working ? "Present" : new Date(exp.end_date).toLocaleDateString()}
                  </p>
                  {exp.location && <p className="text-gray-600 text-sm">📍 {exp.location}</p>}
                  {exp.description && <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-xl font-bold mb-4">Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                    {project.project_type}
                  </span>
                  <h4 className="font-bold mt-2">{project.project_title}</h4>
                  <p className="text-gray-700 text-sm mt-1">{project.description}</p>
                  {project.technologies_used && (
                    <p className="text-gray-600 text-sm mt-2">
                      <strong>Tech:</strong> {project.technologies_used}
                    </p>
                  )}
                  {project.project_url && (
                    <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                      🔗 View Project
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-xl font-bold mb-4">Certifications</h3>
            <div className="space-y-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    <div className="flex-1">
                      <h4 className="font-bold">{cert.certification_name}</h4>
                      <p className="text-gray-700">{cert.issuing_organization}</p>
                      <p className="text-gray-600 text-sm">
                        Issued: {new Date(cert.issue_date).toLocaleDateString()}
                      </p>
                      {cert.credential_url && (
                        <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                          🔗 Verify
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentProfileView;