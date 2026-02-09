import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

const LANGUAGE_OPTIONS = [
  "English", "Hindi", "Marathi", "Tamil", "Telugu", "Kannada", 
  "Malayalam", "Bengali", "Gujarati", "Punjabi", "Urdu", 
  "Odia", "Assamese", "Sanskrit", "French", "German", 
  "Spanish", "Chinese", "Japanese", "Arabic", "Other"
];

function Languages() {
  const { user } = useAuth();
  const [languagesList, setLanguagesList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    language_name: "",
    proficiency_level: "",
    can_speak: false,
    can_read: false,
    can_write: false
  });

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/languages", {
        headers: { Authorization: `Bearer ${user}` }
      });
      const data = await res.json();
      setLanguagesList(data.languages || []);
    } catch (err) {
      setError("Failed to load languages");
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

    // At least one skill required
    if (!form.can_speak && !form.can_read && !form.can_write) {
      setError("Select at least one: Speak, Read, or Write");
      return;
    }

    try {
      const url = editingId
        ? `http://localhost:5000/api/languages/${editingId}`
        : "http://localhost:5000/api/languages";

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
        setError(data.message || "Failed to save language");
        return;
      }

      setForm({ 
        language_name: "", 
        proficiency_level: "",
        can_speak: false, 
        can_read: false, 
        can_write: false 
      });
      setShowForm(false);
      setEditingId(null);
      fetchLanguages();

    } catch (err) {
      setError("Server error");
      console.error(err);
    }
  };

  const handleEdit = (lang) => {
    setForm(lang);
    setEditingId(lang.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this language?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/languages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user}` }
      });

      if (res.ok) fetchLanguages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setForm({ 
      language_name: "", 
      proficiency_level: "",
      can_speak: false, 
      can_read: false, 
      can_write: false 
    });
    setShowForm(false);
    setEditingId(null);
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
          <h1 className="text-3xl font-bold">Languages</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Language
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
              {editingId ? "Edit Language" : "Add Language"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Language *</label>
                <select
                  name="language_name"
                  value={form.language_name}
                  onChange={handleChange}
                  required
                  className="input"
                  disabled={editingId}
                >
                  <option value="">Select Language</option>
                  {LANGUAGE_OPTIONS.map((lang, index) => (
                    <option key={index} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Overall Proficiency *</label>
                <select
                  name="proficiency_level"
                  value={form.proficiency_level}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select Proficiency</option>
                  <option value="Native">Native - First language</option>
                  <option value="Fluent">Fluent - Professional working proficiency</option>
                  <option value="Basic">Basic - Elementary proficiency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Specific Skills *</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="can_speak"
                      checked={form.can_speak}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>Can Speak 🗣️</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="can_read"
                      checked={form.can_read}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>Can Read 📖</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="can_write"
                      checked={form.can_write}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>Can Write ✍️</span>
                  </label>
                </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {languagesList.length === 0 ? (
            <div className="col-span-full bg-white p-6 rounded-xl shadow-md text-center">
              <p className="text-gray-600">No languages added yet.</p>
            </div>
          ) : (
            languagesList.map((lang) => (
              <div key={lang.id} className="bg-white p-5 rounded-xl shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{lang.language_name}</h3>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                      lang.proficiency_level === 'Native' ? 'bg-purple-100 text-purple-800' :
                      lang.proficiency_level === 'Fluent' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lang.proficiency_level}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(lang)} className="text-yellow-600 hover:text-yellow-700">✏️</button>
                    <button onClick={() => handleDelete(lang.id)} className="text-red-600 hover:text-red-700">🗑️</button>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap mt-3">
                  {lang.can_speak && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">🗣️ Speak</span>}
                  {lang.can_read && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">📖 Read</span>}
                  {lang.can_write && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">✍️ Write</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Languages;