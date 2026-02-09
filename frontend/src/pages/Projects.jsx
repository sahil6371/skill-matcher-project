import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function Projects() {
  const { user } = useAuth();
  const [projectsList, setProjectsList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    project_title: "",
    project_type: "",
    description: "",
    technologies_used: "",
    start_date: "",
    end_date: "",
    project_url: ""
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${user}` }
      });
      const data = await res.json();
      setProjectsList(data.projects || []);
    } catch (err) {
      setError("Failed to load projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const url = editingId
        ? `http://localhost:5000/api/projects/${editingId}`
        : "http://localhost:5000/api/projects";

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
        setError(data.message || "Failed to save project");
        return;
      }

      handleCancel();
      fetchProjects();

    } catch (err) {
      setError("Server error");
      console.error(err);
    }
  };

  const handleEdit = (project) => {
    setForm({
      project_title: project.project_title || "",
      project_type: project.project_type || "",
      description: project.description || "",
      technologies_used: project.technologies_used || "",
      // Ensure date only contains YYYY-MM-DD for the input field
      start_date: project.start_date ? project.start_date.split('T')[0] : "",
      end_date: project.end_date ? project.end_date.split('T')[0] : "",
      project_url: project.project_url || ""
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user}` }
      });

      if (res.ok) fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setForm({
      project_title: "",
      project_type: "",
      description: "",
      technologies_used: "",
      start_date: "",
      end_date: "",
      project_url: ""
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
          <p className="text-xl font-semibold text-gray-600">Loading Projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Add Project
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-blue-100">
            <h2 className="text-xl font-bold mb-4 text-gray-700">
              {editingId ? "Edit Project" : "Add Project"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Title *</label>
                <input
                  name="project_title"
                  value={form.project_title}
                  onChange={handleChange}
                  placeholder="e.g., E-commerce Website"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Project Type *</label>
                <select
                  name="project_type"
                  value={form.project_type}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Type</option>
                  <option value="Academic">Academic</option>
                  <option value="Personal">Personal</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Open Source">Open Source</option>
                  <option value="Hackathon">Hackathon</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your project..."
                  rows="4"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Technologies Used</label>
                <input
                  name="technologies_used"
                  value={form.technologies_used}
                  onChange={handleChange}
                  placeholder="e.g., React, Node.js, MongoDB"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Project URL</label>
                <input
                  name="project_url"
                  value={form.project_url}
                  onChange={handleChange}
                  placeholder="GitHub/Live link"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  {editingId ? "Update Project" : "Add Project"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projectsList.length === 0 ? (
            <div className="col-span-full bg-white p-10 rounded-xl shadow-md text-center border border-dashed border-gray-300">
              <p className="text-gray-500">No projects added yet. Click "Add Project" to get started!</p>
            </div>
          ) : (
            projectsList.map((project) => (
              <div key={project.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {project.project_type}
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-yellow-600 hover:text-yellow-700 transition"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-700 transition"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2 text-gray-800">{project.project_title}</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed flex-grow">
                  {project.description}
                </p>

                {project.technologies_used && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Technologies</p>
                    <div className="flex flex-wrap gap-1">
                       <span className="text-sm text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                         {project.technologies_used}
                       </span>
                    </div>
                  </div>
                )}

                <div className="mt-auto border-t pt-4">
                  {(project.start_date || project.end_date) && (
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      📅 {formatDate(project.start_date) || "N/A"} — {formatDate(project.end_date) || "Ongoing"}
                    </p>
                  )}

                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-bold inline-flex items-center gap-1"
                    >
                      🔗 View Live Project
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Projects;