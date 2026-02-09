import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaHome, FaBriefcase, FaUsers, FaUser, FaSignOutAlt } from "react-icons/fa";

function AllApplicants() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [allApplicants, setAllApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/company/dashboard" },
    { name: "Profile", icon: <FaUser />, path: "/company/profile" },
    { name: "Post Job", icon: <FaBriefcase />, path: "/company/post-job" },
    { name: "My Jobs", icon: <FaBriefcase />, path: "/company/my-jobs" },
    { name: "All Applicants", icon: <FaUsers />, path: "/company/applicants" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("userType");
    logout();
    navigate("/company/login");
  };

  useEffect(() => {
    fetchAllApplicants();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, searchQuery, allApplicants]);

  const fetchAllApplicants = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/company/all-applicants", {
        headers: { Authorization: `Bearer ${user}` }
      });
      const data = await res.json();
      setAllApplicants(data.applicants || []);
      setFilteredApplicants(data.applicants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allApplicants];

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.full_name?.toLowerCase().includes(query) ||
        app.email?.toLowerCase().includes(query) ||
        app.job_title?.toLowerCase().includes(query)
      );
    }

    setFilteredApplicants(filtered);
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
      fetchAllApplicants();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Applied": return "bg-blue-100 text-blue-800";
      case "Under Review": return "bg-yellow-100 text-yellow-800";
      case "Shortlisted": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Accepted": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStats = () => {
    return {
      total: allApplicants.length,
      applied: allApplicants.filter(a => a.status === "Applied").length,
      underReview: allApplicants.filter(a => a.status === "Under Review").length,
      shortlisted: allApplicants.filter(a => a.status === "Shortlisted").length,
      accepted: allApplicants.filter(a => a.status === "Accepted").length,
      rejected: allApplicants.filter(a => a.status === "Rejected").length
    };
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

  const stats = getStats();

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
        <h1 className="text-3xl font-bold mb-6">All Applicants</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-md">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm">Total</p>
          </div>
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-4 rounded-xl shadow-md">
            <p className="text-3xl font-bold">{stats.applied}</p>
            <p className="text-sm">Applied</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 rounded-xl shadow-md">
            <p className="text-3xl font-bold">{stats.underReview}</p>
            <p className="text-sm">Under Review</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl shadow-md">
            <p className="text-3xl font-bold">{stats.shortlisted}</p>
            <p className="text-sm">Shortlisted</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-md">
            <p className="text-3xl font-bold">{stats.accepted}</p>
            <p className="text-sm">Accepted</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-xl shadow-md">
            <p className="text-3xl font-bold">{stats.rejected}</p>
            <p className="text-sm">Rejected</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Search by name, email, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input flex-1"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-48"
            >
              <option value="All">All Status</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applicants Table */}
        {filteredApplicants.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-gray-600">
              {searchQuery || statusFilter !== "All" 
                ? "No applicants found matching your filters." 
                : "No applicants yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">Applicant</th>
                  <th className="text-left p-4 font-semibold">Job</th>
                  <th className="text-left p-4 font-semibold">Applied Date</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.map((app) => (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {app.profile_photo && (
                          <img
                            src={app.profile_photo}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{app.full_name || "Name Not Set"}</p>
                          <p className="text-sm text-gray-600">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{app.job_title}</p>
                      <p className="text-sm text-gray-600">{app.job_type}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(app.status)}`}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Accepted">Accepted</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => navigate(`/company/student-profile/${app.student_id}`)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllApplicants;