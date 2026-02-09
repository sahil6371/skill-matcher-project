import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function Certifications() {
  const { user } = useAuth();
  const [certificationsList, setCertificationsList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    certification_name: "",
    issuing_organization: "",
    issue_date: "",
    expiry_date: "",
    credential_id: "",
    credential_url: ""
  });

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/certifications", {
        headers: { Authorization: `Bearer ${user}` }
      });
      const data = await res.json();
      setCertificationsList(data.certifications || []);
    } catch (err) {
      setError("Failed to load certifications");
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
        ? `http://localhost:5000/api/certifications/${editingId}`
        : "http://localhost:5000/api/certifications";

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
        setError(data.message || "Failed to save certification");
        return;
      }

      handleCancel(); // Reset form and close
      fetchCertifications();

    } catch (err) {
      setError("Server error");
      console.error(err);
    }
  };

  const handleEdit = (cert) => {
    // Ensure dates are in YYYY-MM-DD format for the date input
    setForm({
      certification_name: cert.certification_name || "",
      issuing_organization: cert.issuing_organization || "",
      issue_date: cert.issue_date ? cert.issue_date.split('T')[0] : "",
      expiry_date: cert.expiry_date ? cert.expiry_date.split('T')[0] : "",
      credential_id: cert.credential_id || "",
      credential_url: cert.credential_url || ""
    });
    setEditingId(cert.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this certification?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/certifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user}` }
      });

      if (res.ok) fetchCertifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setForm({
      certification_name: "",
      issuing_organization: "",
      issue_date: "",
      expiry_date: "",
      credential_id: "",
      credential_url: ""
    });
    setShowForm(false);
    setEditingId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
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
          <h1 className="text-3xl font-bold">Certifications</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Add Certification
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Certification" : "Add Certification"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Certification Name *</label>
                <input
                  name="certification_name"
                  value={form.certification_name}
                  onChange={handleChange}
                  placeholder="e.g., AWS Certified Developer"
                  required
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Issuing Organization *</label>
                <input
                  name="issuing_organization"
                  value={form.issuing_organization}
                  onChange={handleChange}
                  placeholder="e.g., Amazon Web Services"
                  required
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Issue Date *</label>
                  <input
                    type="date"
                    name="issue_date"
                    value={form.issue_date}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input
                    type="date"
                    name="expiry_date"
                    value={form.expiry_date}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Credential ID</label>
                <input
                  name="credential_id"
                  value={form.credential_id}
                  onChange={handleChange}
                  placeholder="Certificate ID or Code"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Credential URL</label>
                <input
                  name="credential_url"
                  value={form.credential_url}
                  onChange={handleChange}
                  placeholder="Verification link"
                  className="w-full p-2 border rounded-lg"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificationsList.length === 0 ? (
            <div className="col-span-full bg-white p-6 rounded-xl shadow-md text-center">
              <p className="text-gray-600">No certifications added yet.</p>
            </div>
          ) : (
            certificationsList.map((cert) => (
              <div key={cert.id} className="bg-white p-6 rounded-xl shadow-md border border-transparent hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">🏆</span>
                    {cert.expiry_date && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isExpired(cert.expiry_date) ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                        {isExpired(cert.expiry_date) ? "Expired" : "Active"}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(cert)}
                      className="text-yellow-600 hover:text-yellow-700 transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(cert.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-1">{cert.certification_name}</h3>
                <p className="text-gray-700 font-medium mb-3">{cert.issuing_organization}</p>

                <div className="space-y-1 text-sm text-gray-600">
                  <p>📅 Issued: {formatDate(cert.issue_date)}</p>
                  {cert.expiry_date && (
                    <p>⏰ Expires: {formatDate(cert.expiry_date)}</p>
                  )}
                  {cert.credential_id && (
                    <p>🆔 ID: {cert.credential_id}</p>
                  )}
                </div>

                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-blue-600 hover:underline text-sm font-medium"
                  >
                    🔗 Verify Credential
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Certifications;