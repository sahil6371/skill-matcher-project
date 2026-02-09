import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

// Field options based on degree type
const FIELD_OPTIONS = {
  "10th": ["CBSE", "ICSE", "State Board", "NIOS", "Other"],
  
  "12th": ["Science", "Commerce", "Arts", "Vocational"],
  
  "Diploma": [
    "Computer Science",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Electronics Engineering",
    "Information Technology",
    "Automobile Engineering",
    "Chemical Engineering",
    "Other"
  ],
  
  "Bachelor": [
    "Computer Science/IT",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Electronics Engineering",
    "Chemical Engineering",
    "Aerospace Engineering",
    "Biotechnology",
    "Commerce (B.Com)",
    "Business Administration (BBA)",
    "Arts (B.A.)",
    "Science (B.Sc.)",
    "Computer Applications (BCA)",
    "Design",
    "Architecture",
    "Medicine (MBBS)",
    "Pharmacy",
    "Law (LLB)",
    "Other"
  ],
  
  "Master": [
    "Computer Science (M.Tech/M.Sc)",
    "Mechanical Engineering (M.Tech)",
    "Civil Engineering (M.Tech)",
    "Electrical Engineering (M.Tech)",
    "MBA",
    "MCA",
    "M.Sc. (Science)",
    "M.A. (Arts)",
    "M.Com (Commerce)",
    "Data Science",
    "Artificial Intelligence",
    "Law (LLM)",
    "Other"
  ],
  
  "PhD": [
    "Computer Science",
    "Engineering",
    "Science",
    "Management",
    "Arts",
    "Commerce",
    "Medicine",
    "Law",
    "Other"
  ]
};

function Education() {
  const { user } = useAuth();
  const [educationList, setEducationList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    degree_type: "",
    field_of_study: "",
    institution_name: "",
    university_name: "",
    start_year: "",
    end_year: "",
    grade_percentage: "",
    currently_studying: false
  });

  // Get field options based on selected degree
  const fieldOptions = form.degree_type ? FIELD_OPTIONS[form.degree_type] : [];

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/education", {
        headers: { Authorization: `Bearer ${user}` }
      });

      const data = await res.json();
      setEducationList(data.education || []);
    } catch (err) {
      setError("Failed to load education");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If degree type changes, reset field_of_study
    if (name === "degree_type") {
      setForm({
        ...form,
        degree_type: value,
        field_of_study: "" // Reset field when degree changes
      });
    } else {
      setForm({
        ...form,
        [name]: type === "checkbox" ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  // Validate years
  const currentYear = new Date().getFullYear();
  
  if (form.start_year < 1980 || form.start_year > currentYear + 1) {
    setError("Invalid start year");
    return;
  }

  if (!form.currently_studying && form.end_year) {
    if (form.end_year < form.start_year) {
      setError("End year cannot be before start year");
      return;
    }
    if (form.end_year > currentYear + 10) {
      setError("Invalid end year");
      return;
    }
  }

  if (form.grade_percentage && (form.grade_percentage < 0 || form.grade_percentage > 100)) {
    setError("Grade must be between 0 and 100");
    return;
  }

  // Rest of the code...

    try {
      const url = editingId
        ? `http://localhost:5000/api/education/${editingId}`
        : "http://localhost:5000/api/education";

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
        setError(data.message || "Failed to save education");
        return;
      }

      // Reset form
      setForm({
        degree_type: "",
        field_of_study: "",
        institution_name: "",
        university_name: "",
        start_year: "",
        end_year: "",
        grade_percentage: "",
        currently_studying: false
      });

      setShowForm(false);
      setEditingId(null);
      fetchEducation();

    } catch (err) {
      setError("Server error");
      console.error(err);
    }
  };

  const handleEdit = (edu) => {
    setForm(edu);
    setEditingId(edu.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this education entry?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/education/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user}` }
      });

      if (res.ok) {
        fetchEducation();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setForm({
      degree_type: "",
      field_of_study: "",
      institution_name: "",
      university_name: "",
      start_year: "",
      end_year: "",
      grade_percentage: "",
      currently_studying: false
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
          <h1 className="text-3xl font-bold">Education</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Education
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Education" : "Add Education"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* DEGREE TYPE */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Education Level *
                </label>
                <select
                  name="degree_type"
                  value={form.degree_type}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select Level</option>
                  <option value="10th">10th Standard</option>
                  <option value="12th">12th Standard</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor">Bachelor's Degree</option>
                  <option value="Master">Master's Degree</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              {/* FIELD OF STUDY - Dynamic based on degree */}
              {form.degree_type && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {form.degree_type === "10th" ? "Board" : 
                     form.degree_type === "12th" ? "Stream" : 
                     "Field of Study"} *
                  </label>
                  <select
                    name="field_of_study"
                    value={form.field_of_study}
                    onChange={handleChange}
                    required
                    className="input"
                  >
                    <option value="">
                      Select {form.degree_type === "10th" ? "Board" : 
                              form.degree_type === "12th" ? "Stream" : 
                              "Field"}
                    </option>
                    {fieldOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* INSTITUTION NAME */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {form.degree_type === "10th" || form.degree_type === "12th" 
                    ? "School Name *" 
                    : "Institution/College Name *"}
                </label>
                <input
                  name="institution_name"
                  value={form.institution_name}
                  onChange={handleChange}
                  placeholder={
                    form.degree_type === "10th" || form.degree_type === "12th"
                      ? "e.g., Delhi Public School"
                      : "e.g., IIT Bombay, VIT University"
                  }
                  required
                  className="input"
                />
              </div>

              {/* UNIVERSITY NAME - Only for higher education */}
              {form.degree_type && 
               !["10th", "12th"].includes(form.degree_type) && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    University Name
                  </label>
                  <input
                    name="university_name"
                    value={form.university_name}
                    onChange={handleChange}
                    placeholder="e.g., Mumbai University, Anna University"
                    className="input"
                  />
                </div>
              )}

              {/* YEARS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Year *</label>
                  <input
                    type="number"
                    name="start_year"
                    value={form.start_year}
                    onChange={handleChange}
                    placeholder="2020"
                    min="1980"
                    max="2030"
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {form.currently_studying ? "End Year (Expected)" : "End Year"}
                  </label>
                  <input
                    type="number"
                    name="end_year"
                    value={form.end_year}
                    onChange={handleChange}
                    placeholder="2024"
                    min="1980"
                    max="2030"
                    disabled={form.currently_studying}
                    className="input"
                  />
                </div>
              </div>

              {/* GRADE/PERCENTAGE */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Grade/Percentage {form.currently_studying ? "(Current/Expected)" : ""}
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="grade_percentage"
                  value={form.grade_percentage}
                  onChange={handleChange}
                  placeholder="85.5"
                  min="0"
                  max="100"
                  className="input"
                />
              </div>

              {/* CURRENTLY STUDYING */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="currently_studying"
                  checked={form.currently_studying}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <label className="text-sm">Currently Studying Here</label>
              </div>

              {/* BUTTONS */}
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

        {/* Education List */}
        <div className="space-y-4">
          {educationList.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <p className="text-gray-600">No education added yet. Add your first one!</p>
            </div>
          ) : (
            educationList.map((edu) => (
              <div key={edu.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {edu.degree_type}
                      </span>
                      {edu.currently_studying && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          Currently Studying
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold mt-2">{edu.field_of_study}</h3>
                    <p className="text-gray-700 font-medium">{edu.institution_name}</p>
                    
                    {edu.university_name && (
                      <p className="text-gray-500 text-sm">{edu.university_name}</p>
                    )}
                    
                    <div className="flex gap-6 mt-3 text-sm text-gray-600">
                      <p>
                        📅 {edu.start_year} - {edu.currently_studying ? "Present" : edu.end_year || "N/A"}
                      </p>
                      {edu.grade_percentage && (
                        <p>📊 Grade: {edu.grade_percentage}%</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(edu)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(edu.id)}
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

export default Education;