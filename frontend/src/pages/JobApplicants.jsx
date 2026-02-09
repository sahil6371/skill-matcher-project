import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { FaHome, FaBriefcase, FaUsers, FaUser, FaSignOutAlt } from "react-icons/fa";

function JobApplicants() {
  const { job_id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
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
    fetchApplicants();
  }, [job_id]);

  const fetchApplicants = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/job/${job_id}`, {
        headers: { Authorization: `Bearer ${user}` }
      });
      const data = await res.json();
      setApplicants(data.applicants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, newStatus) => {
    try {
      await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchApplicants();
    } catch (err) {
      console.error(err);
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

        <h1 className="text-3xl font-bold mb-6">Job Applicants</h1>

        {applicants.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-gray-600">No applicants yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((applicant) => (
              <div key={applicant.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 flex-1">
                    {applicant.profile_photo && (
                      <img
                        src={applicant.profile_photo}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{applicant.full_name || "Name Not Set"}</h3>
                      <p className="text-gray-600">{applicant.email}</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Applied: {new Date(applicant.applied_at).toLocaleDateString()}
                      </p>
                      
                      {applicant.cover_letter && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600 font-semibold mb-1">Cover Letter:</p>
                          <p className="text-sm text-gray-700">{applicant.cover_letter}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <select
                      value={applicant.status}
                      onChange={(e) => updateStatus(applicant.id, e.target.value)}
                      className="input text-sm"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Accepted">Accepted</option>
                    </select>

                    <button
                      onClick={() => viewStudentProfile(applicant.student_id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      View Profile
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

export default JobApplicants;