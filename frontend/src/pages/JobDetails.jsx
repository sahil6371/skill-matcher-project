import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${id}`);
      const data = await res.json();
      setJob(data.job);
      setSkills(data.required_skills || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5000/api/applications/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user}`
        },
        body: JSON.stringify({
          job_id: id,
          cover_letter: coverLetter
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      setSuccess("Application submitted successfully!");
      setCoverLetter("");
    } catch (err) {
      setError("Server error");
      console.error(err);
    } finally {
      setApplying(false);
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

  if (!job) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl">Job not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-10">
        <button
          onClick={() => navigate("/jobs")}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to Jobs
        </button>

        <div className="bg-white p-8 rounded-xl shadow-md">
          <div className="flex items-start gap-4 mb-6">
            {job.logo_url && (
              <img src={job.logo_url} alt="Logo" className="w-20 h-20 object-cover rounded" />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{job.job_title}</h1>
              <p className="text-xl text-gray-700 mt-1">{job.company_name}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{job.job_type}</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">{job.job_mode}</span>
                {job.company_size && (
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">{job.company_size} employees</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {job.location && (
              <div>
                <p className="text-gray-600 text-sm">Location</p>
                <p className="font-semibold">📍 {job.location}</p>
              </div>
            )}
            {job.salary_range && (
              <div>
                <p className="text-gray-600 text-sm">Salary</p>
                <p className="font-semibold">💰 {job.salary_range}</p>
              </div>
            )}
            {job.industry && (
              <div>
                <p className="text-gray-600 text-sm">Industry</p>
                <p className="font-semibold">{job.industry}</p>
              </div>
            )}
            {job.application_deadline && (
              <div>
                <p className="text-gray-600 text-sm">Application Deadline</p>
                <p className="font-semibold">{new Date(job.application_deadline).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          <div className="border-t pt-6 mb-6">
            <h2 className="text-xl font-bold mb-3">Job Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>

          {job.responsibilities && (
            <div className="border-t pt-6 mb-6">
              <h2 className="text-xl font-bold mb-3">Responsibilities</h2>
              <p className="text-gray-700 whitespace-pre-line">{job.responsibilities}</p>
            </div>
          )}

          {job.requirements && (
            <div className="border-t pt-6 mb-6">
              <h2 className="text-xl font-bold mb-3">Requirements</h2>
              <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
            </div>
          )}

          {skills.length > 0 && (
            <div className="border-t pt-6 mb-6">
              <h2 className="text-xl font-bold mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {skill.skill_name} ({skill.required_level})
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.about && (
            <div className="border-t pt-6 mb-6">
              <h2 className="text-xl font-bold mb-3">About {job.company_name}</h2>
              <p className="text-gray-700 whitespace-pre-line">{job.about}</p>
            </div>
          )}

          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-3">Apply for this Job</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            <textarea
              placeholder="Cover Letter (optional)"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows="5"
              className="input mb-4"
            />

            <div className="flex gap-4">
              <button
                onClick={handleApply}
                disabled={applying}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {applying ? "Applying..." : "Apply Now"}
              </button>

              {job.application_link && (
                <a
                  href={job.application_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
                >
                  Apply on Company Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;
