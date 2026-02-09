import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function Experience() {
  const { user } = useAuth();
  const [experienceList, setExperienceList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    job_title: "",
    company_name: "",
    employment_type: "",
    location: "",
    start_date: "",
    end_date: "",
    currently_working: false,
    description: ""
  });

  useEffect(() => {
    fetchExperience();
  }, []);

  const fetchExperience = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/experience", {
        headers: { Authorization: `Bearer ${user}` }
      });
      const data = await res.json();
      setExperienceList(data.experience || []);
    } catch (err) {
      setError("Failed to load experience");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const url = editingId
        ? `http://localhost:5000/api/experience/${editingId}`
        : "http://localhost:5000/api/experience";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to save experience");
        return;
      }

      setForm({
        job_title: "",
        company_name: "",
        employment_type: "",
        location: "",
        start_date: "",
        end_date: "",
        currently_working: false,
        description: ""
      });
      setShowForm(false);
      setEditingId(null);
      fetchExperience();

    } catch (err) {
      setError("Server error");
      console.error(err);
    }
  };

  const handleEdit = (exp) => {
    setForm(exp);
    setEditingId(exp.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this experience?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/experience/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user}` }
      });

      if (res.ok) fetchExperience();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setForm({
      job_title: "",
      company_name: "",
      employment_type: "",
      location: "",
      start_date: "",
      end_date: "",
      currently_working: false,
      description: ""
    });
    setShowForm(false);
    setEditingId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Experience</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Experience
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Experience" : "Add Experience"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Title *</label>
                <input
                  name="job_title"
                  value={form.job_title}
                  onChange={handleChange}
                  placeholder="e.g., Software Intern"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  placeholder="e.g., Google"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Employment Type *</label>
                <select
                  name="employment_type"
                  value={form.employment_type}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g., Mumbai, India"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    disabled={form.currently_working}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="currently_working"
                  checked={form.currently_working}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <label className="text-sm">Currently Working Here</label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your role and achievements..."
                  rows="4"
                  className="input"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {experienceList.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <p className="text-gray-600">No experience added yet.</p>
            </div>
          ) : (
            experienceList.map((exp) => (
              <div key={exp.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {exp.employment_type}
                      </span>
                      {exp.currently_working && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          Current
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold">{exp.job_title}</h3>
                    <p className="text-gray-700 font-medium">{exp.company_name}</p>
                    
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <p>📅 {formatDate(exp.start_date)} - {exp.currently_working ? "Present" : formatDate(exp.end_date)}</p>
                      {exp.location && <p>📍 {exp.location}</p>}
                    </div>

                    {exp.description && (
                      <p className="mt-3 text-gray-700 whitespace-pre-line">{exp.description}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(exp)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Experience;