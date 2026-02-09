import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { FaHome, FaBriefcase, FaUsers, FaUser, FaSignOutAlt } from "react-icons/fa";

function MatchedStudents() {
  const { job_id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
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
    fetchMatchedStudents();
  }, [job_id]);

  const fetchMatchedStudents = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/matching/students/${job_id}`, {
        headers: { Authorization: `Bearer ${user}` }
      });
      const data = await res.json();
      setStudents(data.matched_students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewStudentProfile = (studentId) => {
    navigate(`/company/student-profile/${studentId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="w-64 bg-gray-900 text-white p-6">
          <h2 className="text-2xl font-bold">Company Portal</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl">Loading...</p>
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

      <div className="flex-1 p-10">
        <button
          onClick={() => navigate("/company/my-jobs")}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to My Jobs
        </button>

        <h1 className="text-3xl font-bold mb-6">Matched Students for this Job</h1>

        {students.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-gray-600">No matched students found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {students.map((student) => (
              <div key={student.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="flex gap-4">
                  {student.profile_photo && (
                    <img
                      src={student.profile_photo}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{student.full_name || "Name Not Set"}</h3>
                    <p className="text-gray-600">{student.email}</p>
                    
                    <div className="mt-3">
                      <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold">
                        {student.match_percentage}% Match
                      </span>
                      <p className="text-sm text-gray-600 mt-2">
                        {student.matched_skills}/{student.total_required} skills matched
                      </p>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      {student.mobile && <p>📱 {student.mobile}</p>}
                      {student.current_location && <p>📍 {student.current_location}</p>}
                    </div>

                    <button
                      onClick={() => viewStudentProfile(student.id)}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchedStudents;