import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

// Popular skills list
const SKILL_OPTIONS = [
  // Programming Languages
  "Python", "Java", "JavaScript", "TypeScript", "C", "C++", "C#", 
  "PHP", "Ruby", "Go", "Swift", "Kotlin", "Rust", "Scala", "R",
  
  // Web Development - Frontend
  "HTML", "CSS", "React", "Angular", "Vue.js", "Next.js", "Svelte",
  "jQuery", "Bootstrap", "Tailwind CSS", "Material UI", "SASS", "LESS",
  
  // Web Development - Backend
  "Node.js", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot",
  "ASP.NET", "Laravel", "Ruby on Rails", "GraphQL", "REST API",
  
  // Mobile Development
  "React Native", "Flutter", "Android Development", "iOS Development",
  "Xamarin", "Ionic",
  
  // Database
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle",
  "MS SQL Server", "SQLite", "Cassandra", "DynamoDB", "Firebase",
  
  // Cloud & DevOps
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins",
  "Git", "GitHub", "GitLab", "CI/CD", "Terraform", "Ansible",
  
  // Data Science & AI/ML
  "Machine Learning", "Deep Learning", "Data Analysis", "Data Science",
  "TensorFlow", "PyTorch", "Keras", "Pandas", "NumPy", "Scikit-learn",
  "Power BI", "Tableau", "Excel", "Statistics",
  
  // Design & UI/UX
  "UI/UX Design", "Figma", "Adobe XD", "Sketch", "Photoshop",
  "Illustrator", "InDesign", "Canva", "Wireframing", "Prototyping",
  
  // Software Development
  "Agile", "Scrum", "Jira", "Testing", "QA", "Unit Testing",
  "Integration Testing", "Test Automation", "Selenium", "Jest",
  
  // Soft Skills
  "Communication", "Leadership", "Team Management", "Problem Solving",
  "Time Management", "Public Speaking", "Critical Thinking",
  "Project Management", "Presentation Skills", "Teamwork",
  
  // Other Technical
  "Linux", "Windows Server", "Networking", "Cybersecurity",
  "Blockchain", "Solidity", "Ethical Hacking", "Penetration Testing",
  "SEO", "Digital Marketing", "Content Writing"
];

function Skills() {
  const { user } = useAuth();
  const [skillsList, setSkillsList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    skill_name: "",
    proficiency_level: ""
  });

  // For search/filter in dropdown
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSkills = SKILL_OPTIONS.filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/skills", {
        headers: { Authorization: `Bearer ${user}` }
      });

      const data = await res.json();
      setSkillsList(data.skills || []);
    } catch (err) {
      setError("Failed to load skills");
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
        ? `http://localhost:5000/api/skills/${editingId}`
        : "http://localhost:5000/api/skills";

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
        setError(data.message || "Failed to save skill");
        return;
      }

      setForm({ skill_name: "", proficiency_level: "" });
      setShowForm(false);
      setEditingId(null);
      setSearchTerm("");
      fetchSkills();

    } catch (err) {
      setError("Server error");
      console.error(err);
    }
  };

  const handleEdit = (skill) => {
    setForm(skill);
    setEditingId(skill.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this skill?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/skills/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user}` }
      });

      if (res.ok) {
        fetchSkills();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setForm({ skill_name: "", proficiency_level: "" });
    setShowForm(false);
    setEditingId(null);
    setSearchTerm("");
  };

  // Color coding for proficiency levels
  const getProficiencyColor = (level) => {
    switch(level) {
      case "Beginner": return "bg-gray-100 text-gray-800";
      case "Intermediate": return "bg-blue-100 text-blue-800";
      case "Advanced": return "bg-green-100 text-green-800";
      case "Expert": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
          <h1 className="text-3xl font-bold">Skills</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Skill
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
              {editingId ? "Edit Skill" : "Add Skill"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* SKILL NAME - Searchable Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">Skill Name *</label>
                
                {editingId ? (
                  // When editing, show as input
                  <input
                    name="skill_name"
                    value={form.skill_name}
                    onChange={handleChange}
                    required
                    className="input"
                    readOnly
                  />
                ) : (
                  // When adding, show dropdown with search
                  <>
                    <input
                      type="text"
                      placeholder="Search skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input mb-2"
                    />
                    <select
                      name="skill_name"
                      value={form.skill_name}
                      onChange={handleChange}
                      required
                      className="input"
                      size="5"
                    >
                      <option value="">Select a skill</option>
                      {filteredSkills.map((skill, index) => (
                        <option key={index} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Can't find your skill? Type it in the search box and select "Other"
                    </p>
                  </>
                )}
              </div>

              {/* PROFICIENCY LEVEL */}
              <div>
                <label className="block text-sm font-medium mb-1">Proficiency Level *</label>
                <select
                  name="proficiency_level"
                  value={form.proficiency_level}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select Level</option>
                  <option value="Beginner">Beginner - Just started learning</option>
                  <option value="Intermediate">Intermediate - Can work independently</option>
                  <option value="Advanced">Advanced - Deep knowledge & experience</option>
                  <option value="Expert">Expert - Can teach & mentor others</option>
                </select>
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

        {/* Skills Display - Card Grid */}
        <div>
          {skillsList.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <p className="text-gray-600">No skills added yet. Add your first skill!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skillsList.map((skill) => (
                <div key={skill.id} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-800">{skill.skill_name}</h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(skill)}
                        className="text-yellow-600 hover:text-yellow-700 text-sm"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getProficiencyColor(skill.proficiency_level)}`}>
                    {skill.proficiency_level}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {skillsList.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold mb-4">Skills Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{skillsList.length}</p>
                <p className="text-sm text-gray-600">Total Skills</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {skillsList.filter(s => s.proficiency_level === "Expert").length}
                </p>
                <p className="text-sm text-gray-600">Expert Level</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {skillsList.filter(s => s.proficiency_level === "Advanced").length}
                </p>
                <p className="text-sm text-gray-600">Advanced</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {skillsList.filter(s => s.proficiency_level === "Intermediate").length}
                </p>
                <p className="text-sm text-gray-600">Intermediate</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Skills;