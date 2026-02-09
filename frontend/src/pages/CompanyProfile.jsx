import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaHome, FaBriefcase, FaUsers, FaUser, FaSignOutAlt } from "react-icons/fa";

function CompanyProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/company/profile", {
        headers: { Authorization: `Bearer ${user}` }
      });
      const data = await res.json();
      setProfile(data.profile);
      if (data.profile) setForm(data.profile);
    } catch (err) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoto = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, logo_url: reader.result });
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/company/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      setEditing(false);
      fetchProfile();
    } catch (err) {
      setError("Server error");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="w-64 bg-gray-900 text-white p-6">
          <h2 className="text-2xl font-bold mb-8">Company Portal</h2>
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
        <h1 className="text-3xl font-bold mb-6">Company Profile</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-md">
          {!profile || editing ? (
            <div className="max-w-lg">
              <h2 className="text-2xl font-bold mb-6">Complete Company Profile</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Logo</label>
                  <input type="file" accept="image/*" onChange={handlePhoto} className="input" />
                  {form.logo_url && (
                    <img src={form.logo_url} alt="Logo" className="mt-2 w-24 h-24 object-cover rounded" />
                  )}
                </div>

                <input
                  name="company_name"
                  placeholder="Company Name *"
                  value={form.company_name || ""}
                  onChange={handleChange}
                  required
                  className="input"
                />

                <select name="industry" value={form.industry || ""} onChange={handleChange} required className="input">
                  <option value="">Select Industry *</option>
                  <option>IT/Software</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Education</option>
                  <option>Manufacturing</option>
                  <option>Retail</option>
                  <option>Other</option>
                </select>

                <input
                  name="website_url"
                  placeholder="Website URL"
                  value={form.website_url || ""}
                  onChange={handleChange}
                  className="input"
                />

                <input
                  name="location"
                  placeholder="Location *"
                  value={form.location || ""}
                  onChange={handleChange}
                  required
                  className="input"
                />

                <select name="company_size" value={form.company_size || ""} onChange={handleChange} required className="input">
                  <option value="">Company Size *</option>
                  <option>1-10</option>
                  <option>11-50</option>
                  <option>51-200</option>
                  <option>201-500</option>
                  <option>500+</option>
                </select>

                <textarea
                  name="about"
                  placeholder="About Company"
                  value={form.about || ""}
                  onChange={handleChange}
                  rows="4"
                  className="input"
                />

                <div className="flex gap-3">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Save Profile
                  </button>
                  {profile && (
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <div className="max-w-2xl">
              {profile.logo_url && (
                <img src={profile.logo_url} alt="Logo" className="w-32 h-32 object-cover rounded mb-4" />
              )}
              <h2 className="text-2xl font-bold">{profile.company_name}</h2>
              <p className="text-gray-600 mt-2">{profile.industry}</p>

              <div className="mt-6 space-y-2">
                <p><b>Location:</b> {profile.location}</p>
                <p><b>Company Size:</b> {profile.company_size}</p>
                {profile.website_url && <p><b>Website:</b> <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600">{profile.website_url}</a></p>}
                {profile.about && <p><b>About:</b> {profile.about}</p>}
              </div>

              <button
                onClick={() => setEditing(true)}
                className="mt-6 bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
              >
                Update Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;