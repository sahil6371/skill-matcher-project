import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function Jobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allJobs, setAllJobs] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [displayJobs, setDisplayJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("all");

  // Filters
  const [filters, setFilters] = useState({
    jobType: "",
    jobMode: "",
    location: "",
    search: ""
  });

  useEffect(() => {
    fetchJobs();
    fetchMatchedJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [view, filters, allJobs, matchedJobs]);

  const fetchJobs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/jobs");
      const data = await res.json();
      setAllJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchedJobs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/matching/jobs", {
        headers: { Authorization: `Bearer ${user}` }
      });
      const data = await res.json();
      setMatchedJobs(data.matched_jobs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const applyFilters = () => {
    let jobs = view === "matched" ? matchedJobs : allJobs;

    // Job Type filter
    if (filters.jobType) {
      jobs = jobs.filter(job => job.job_type === filters.jobType);
    }

    // Job Mode filter
    if (filters.jobMode) {
      jobs = jobs.filter(job => job.job_mode === filters.jobMode);
    }

    // Location filter
    if (filters.location.trim()) {
      const query = filters.location.toLowerCase();
      jobs = jobs.filter(job => 
        job.location?.toLowerCase().includes(query)
      );
    }

    // Search filter
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      jobs = jobs.filter(job =>
        job.job_title?.toLowerCase().includes(query) ||
        job.company_name?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query)
      );
    }

    setDisplayJobs(jobs);
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({
      jobType: "",
      jobMode: "",
      location: "",
      search: ""
    });
  };

  const viewJobDetails = (jobId) => {
    navigate(`/job/${jobId}`);
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
          <h1 className="text-3xl font-bold">Jobs</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView("all")}
              className={`px-4 py-2 rounded-lg ${
                view === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              All Jobs ({allJobs.length})
            </button>
            <button
              onClick={() => setView("matched")}
              className={`px-4 py-2 rounded-lg ${
                view === "matched" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Matched Jobs ({matchedJobs.length})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search jobs, companies..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="input"
            />

            <select
              value={filters.jobType}
              onChange={(e) => handleFilterChange("jobType", e.target.value)}
              className="input"
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
              <option value="Contract">Contract</option>
            </select>

            <select
              value={filters.jobMode}
              onChange={(e) => handleFilterChange("jobMode", e.target.value)}
              className="input"
            >
              <option value="">All Job Modes</option>
              <option value="Remote">Remote</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            <input
              type="text"
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="input"
            />
          </div>

          {(filters.search || filters.jobType || filters.jobMode || filters.location) && (
            <div className="mt-3 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {displayJobs.length} of {view === "matched" ? matchedJobs.length : allJobs.length} jobs
              </p>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Jobs Grid */}
        {displayJobs.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-gray-600">
              {filters.search || filters.jobType || filters.jobMode || filters.location
                ? "No jobs found matching your filters."
                : view === "matched"
                ? "No matched jobs found. Add more skills to your profile!"
                : "No jobs available."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayJobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  {job.logo_url && (
                    <img src={job.logo_url} alt="Logo" className="w-16 h-16 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{job.job_title}</h3>
                    <p className="text-gray-700 font-medium">{job.company_name}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{job.job_type}</span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">{job.job_mode}</span>
                      {job.match_percentage && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">
                          {job.match_percentage}% Match
                        </span>
                      )}
                    </div>
                    {job.location && <p className="text-gray-600 mt-2">📍 {job.location}</p>}
                    {job.salary_range && <p className="text-gray-600">💰 {job.salary_range}</p>}
                    
                    <button
                      onClick={() => viewJobDetails(job.id)}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      View Details
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

export default Jobs;