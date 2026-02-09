import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaHome, FaBriefcase, FaUsers, FaUser, FaSignOutAlt } from "react-icons/fa";

function MyJobs() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
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
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/jobs/company/my-jobs", {
        headers: { Authorization: `Bearer ${user}` }
      });
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleJobStatus = async (id, currentStatus) => {
    try {
      await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteJob = async (id) => {
    if (!confirm("Delete this job?")) return;

    try {
      await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user}` }
      });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const viewApplicants = (jobId) => {
    navigate(`/company/job-applicants/${jobId}`);
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
        <h1 className="text-3xl font-bold mb-6">My Jobs</h1>

        {jobs.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-gray-600">No jobs posted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{job.job_title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        job.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {job.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-gray-600">{job.job_type} • {job.job_mode}</p>
                    {job.location && <p className="text-gray-600">📍 {job.location}</p>}
                    {job.salary_range && <p className="text-gray-600">💰 {job.salary_range}</p>}
                    <p className="text-sm text-gray-500 mt-2">Posted: {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => viewApplicants(job.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      View Applicants
                    </button>

                    <button
    onClick={() => navigate(`/company/matched-students/${job.id}`)}
    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
  >
    View Matched Students
  </button>
                    <button
                      onClick={() => toggleJobStatus(job.id, job.is_active)}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        job.is_active ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"
                      } text-white`}
                    >
                      {job.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => deleteJob(job.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                    >
                      Delete
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

export default MyJobs;