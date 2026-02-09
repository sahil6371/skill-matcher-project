import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    profile: null,
    education: [],
    skills: [],
    languages: [],
    experience: [],
    projects: [],
    certifications: [],
    applications: [],
    matchedJobs: []
  });

  const [skillGapAnalysis, setSkillGapAnalysis] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [profile, education, skills, languages, experience, projects, certifications, applications, matchedJobs] = await Promise.all([
        fetch("http://localhost:5000/api/profile", { headers: { Authorization: `Bearer ${user}` } }).then(r => r.json()),
        fetch("http://localhost:5000/api/education", { headers: { Authorization: `Bearer ${user}` } }).then(r => r.json()),
        fetch("http://localhost:5000/api/skills", { headers: { Authorization: `Bearer ${user}` } }).then(r => r.json()),
        fetch("http://localhost:5000/api/languages", { headers: { Authorization: `Bearer ${user}` } }).then(r => r.json()),
        fetch("http://localhost:5000/api/experience", { headers: { Authorization: `Bearer ${user}` } }).then(r => r.json()),
        fetch("http://localhost:5000/api/projects", { headers: { Authorization: `Bearer ${user}` } }).then(r => r.json()),
        fetch("http://localhost:5000/api/certifications", { headers: { Authorization: `Bearer ${user}` } }).then(r => r.json()),
        fetch("http://localhost:5000/api/applications/my-applications", { headers: { Authorization: `Bearer ${user}` } }).then(r => r.json()),
        fetch("http://localhost:5000/api/matching/jobs", { headers: { Authorization: `Bearer ${user}` } }).then(r => r.json())
      ]);

      setData({
        profile: profile.profile,
        education: education.education || [],
        skills: skills.skills || [],
        languages: languages.languages || [],
        experience: experience.experience || [],
        projects: projects.projects || [],
        certifications: certifications.certifications || [],
        applications: applications.applications || [],
        matchedJobs: matchedJobs.matched_jobs || []
      });

      analyzeSkillGaps(skills.skills || [], matchedJobs.matched_jobs || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSkillGaps = (studentSkills, jobs) => {
    const skillSet = new Set(studentSkills.map(s => s.skill_name.toLowerCase()));
    const missingSkills = new Map();

    jobs.forEach(job => {
      if (job.missing_skills_list) {
        job.missing_skills_list.forEach(skill => {
          const skillLower = skill.toLowerCase();
          if (!skillSet.has(skillLower)) {
            if (missingSkills.has(skillLower)) {
              missingSkills.set(skillLower, {
                skill: skill,
                count: missingSkills.get(skillLower).count + 1,
                jobs: [...missingSkills.get(skillLower).jobs, job.job_title]
              });
            } else {
              missingSkills.set(skillLower, {
                skill: skill,
                count: 1,
                jobs: [job.job_title]
              });
            }
          }
        });
      }
    });

    const sorted = Array.from(missingSkills.values()).sort((a, b) => b.count - a.count);
    setSkillGapAnalysis(sorted);
    generateRecommendations(sorted);
  };

  const generateRecommendations = (gaps) => {
    const skillResources = {
      "python": {
        online: ["Python for Everybody (Coursera)", "Automate the Boring Stuff with Python (Udemy)", "Python.org Official Docs"],
        offline: ["Python Crash Course by Eric Matthes", "Learning Python by Mark Lutz"],
        platforms: ["Codecademy", "DataCamp", "Real Python"]
      },
      "javascript": {
        online: ["JavaScript: Understanding the Weird Parts (Udemy)", "The Complete JavaScript Course (Udemy)", "JavaScript.info"],
        offline: ["Eloquent JavaScript by Marijn Haverbeke", "You Don't Know JS series"],
        platforms: ["freeCodeCamp", "JavaScript30", "Frontend Masters"]
      },
      "react": {
        online: ["React - The Complete Guide (Udemy)", "Epic React by Kent C. Dodds", "Official React Docs"],
        offline: ["Learning React by Alex Banks & Eve Porcello", "Road to React by Robin Wieruch"],
        platforms: ["Scrimba", "React Training", "Egghead.io"]
      },
      "java": {
        online: ["Java Programming Masterclass (Udemy)", "Java Tutorials (Oracle)", "Java MOOC (University of Helsinki)"],
        offline: ["Head First Java by Kathy Sierra", "Effective Java by Joshua Bloch"],
        platforms: ["Codecademy", "JetBrains Academy", "Hyperskill"]
      },
      "node.js": {
        online: ["Node.js - The Complete Guide (Udemy)", "NodeSchool.io", "Official Node.js Docs"],
        offline: ["Node.js Design Patterns by Mario Casciaro"],
        platforms: ["freeCodeCamp", "Pluralsight", "LinkedIn Learning"]
      },
      "sql": {
        online: ["SQL for Data Science (Coursera)", "The Complete SQL Bootcamp (Udemy)", "SQLBolt"],
        offline: ["SQL Queries for Mere Mortals by John Viescas"],
        platforms: ["Mode Analytics SQL Tutorial", "W3Schools", "Khan Academy"]
      },
      "aws": {
        online: ["AWS Certified Solutions Architect (Udemy)", "AWS Training and Certification", "A Cloud Guru"],
        offline: ["AWS Certified Solutions Architect Study Guide"],
        platforms: ["AWS Free Tier", "Cloud Academy", "Linux Academy"]
      },
      "docker": {
        online: ["Docker Mastery (Udemy)", "Docker Official Docs", "Play with Docker"],
        offline: ["Docker Deep Dive by Nigel Poulton"],
        platforms: ["Docker Labs", "Katacoda", "KodeKloud"]
      },
      "machine learning": {
        online: ["Machine Learning by Andrew Ng (Coursera)", "Fast.ai Courses", "Google's ML Crash Course"],
        offline: ["Hands-On Machine Learning by Aurélien Géron"],
        platforms: ["Kaggle Learn", "DataCamp", "DeepLearning.AI"]
      },
      "git": {
        online: ["Git & GitHub Crash Course (YouTube)", "Git Documentation", "Learn Git Branching"],
        offline: ["Pro Git by Scott Chacon (Free online)"],
        platforms: ["GitHub Learning Lab", "GitKraken Learn Git", "Atlassian Git Tutorials"]
      },
      "angular": {
        online: ["Angular - The Complete Guide (Udemy)", "Angular Official Docs", "Angular University"],
        offline: ["ng-book: The Complete Guide to Angular"],
        platforms: ["Pluralsight", "egghead.io", "Frontend Masters"]
      },
      "vue.js": {
        online: ["Vue - The Complete Guide (Udemy)", "Vue Mastery", "Official Vue Docs"],
        offline: ["The Majesty of Vue.js by Alex Kyriakidis"],
        platforms: ["Vue School", "Laracasts", "Scrimba"]
      },
      "typescript": {
        online: ["Understanding TypeScript (Udemy)", "TypeScript Official Docs", "Execute Program"],
        offline: ["Programming TypeScript by Boris Cherny"],
        platforms: ["TypeScript Playground", "Total TypeScript", "Frontend Masters"]
      },
      "mongodb": {
        online: ["MongoDB University", "The Complete MongoDB Course (Udemy)", "MongoDB Docs"],
        offline: ["MongoDB: The Definitive Guide"],
        platforms: ["MongoDB Atlas Free Tier", "freeCodeCamp", "Traversy Media"]
      },
      "express.js": {
        online: ["Node.js, Express & MongoDB Dev to Deployment (Udemy)", "Express.js Official Docs"],
        offline: ["Express in Action by Evan Hahn"],
        platforms: ["freeCodeCamp", "The Net Ninja", "Academind"]
      },
      "spring boot": {
        online: ["Spring & Spring Boot (Udemy)", "Spring Official Guides", "Baeldung Tutorials"],
        offline: ["Spring in Action by Craig Walls"],
        platforms: ["Spring Academy", "Java Brains", "in28minutes"]
      }
    };

    const recs = gaps.slice(0, 5).map(gap => {
      const skillLower = gap.skill.toLowerCase();
      const resources = skillResources[skillLower] || {
        online: [`Search "${gap.skill} tutorial" on YouTube`, `${gap.skill} Documentation`, `Udemy courses for ${gap.skill}`],
        offline: [`Books on ${gap.skill} from Amazon/Flipkart`],
        platforms: ["Coursera", "Udemy", "freeCodeCamp"]
      };

      return {
        skill: gap.skill,
        priority: gap.count > 3 ? "High" : gap.count > 1 ? "Medium" : "Low",
        requiredFor: `${gap.count} job(s)`,
        ...resources
      };
    });

    setRecommendations(recs);
  };

  const calculateProfileCompletion = () => {
    let total = 0;
    let completed = 0;

    total += 20;
    if (data.profile) completed += 20;

    total += 15;
    if (data.education.length > 0) completed += 15;

    total += 20;
    if (data.skills.length >= 3) completed += 20;
    else if (data.skills.length > 0) completed += (data.skills.length / 3) * 20;

    total += 10;
    if (data.languages.length > 0) completed += 10;

    total += 15;
    if (data.experience.length > 0) completed += 15;

    total += 10;
    if (data.projects.length > 0) completed += 10;

    total += 10;
    if (data.certifications.length > 0) completed += 10;

    return Math.round((completed / total) * 100);
  };

  const getApplicationStats = () => {
    const stats = {
      Applied: 0,
      "Under Review": 0,
      Shortlisted: 0,
      Rejected: 0,
      Accepted: 0
    };

    data.applications.forEach(app => {
      if (stats[app.status] !== undefined) {
        stats[app.status]++;
      }
    });

    return stats;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion();
  const appStats = getApplicationStats();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

        {/* Profile Completion */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Profile Completion</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-8">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-8 rounded-full flex items-center justify-center text-white font-bold"
                style={{ width: `${profileCompletion}%` }}
              >
                {profileCompletion}%
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{data.skills.length}</p>
              <p className="text-sm text-gray-600">Skills</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{data.education.length}</p>
              <p className="text-sm text-gray-600">Education</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{data.projects.length}</p>
              <p className="text-sm text-gray-600">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{data.certifications.length}</p>
              <p className="text-sm text-gray-600">Certifications</p>
            </div>
          </div>
        </div>

        {/* Application Statistics */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Application Statistics</h2>
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600">{appStats.Applied}</p>
              <p className="text-sm text-gray-600">Applied</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-yellow-600">{appStats["Under Review"]}</p>
              <p className="text-sm text-gray-600">Under Review</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600">{appStats.Shortlisted}</p>
              <p className="text-sm text-gray-600">Shortlisted</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-red-600">{appStats.Rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-purple-600">{appStats.Accepted}</p>
              <p className="text-sm text-gray-600">Accepted</p>
            </div>
          </div>
        </div>

        {/* Matched Jobs Overview */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Job Matching Overview</h2>
          <p className="text-3xl font-bold text-green-600 mb-2">{data.matchedJobs.length}</p>
          <p className="text-gray-600">Jobs matched based on your skills</p>
          {data.matchedJobs.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Top Matches:</p>
              {data.matchedJobs.slice(0, 3).map((job, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{job.job_title}</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                    {job.match_percentage}% Match
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SKILL GAP ANALYSIS */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">🎯 Skill Gap Analysis</h2>
          
          {skillGapAnalysis.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Great! No skill gaps found. You're well-prepared for available jobs! 🎉</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Based on {data.matchedJobs.length} matched jobs, you're missing these high-demand skills:
              </p>
              
              <div className="space-y-3">
                {skillGapAnalysis.slice(0, 10).map((gap, idx) => (
                  <div key={idx} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{gap.skill}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Required by <span className="font-semibold">{gap.count}</span> job{gap.count > 1 ? 's' : ''}
                        </p>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Jobs requiring this skill:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {gap.jobs.slice(0, 3).map((job, i) => (
                              <span key={i} className="bg-white px-2 py-1 rounded text-xs text-gray-700">
                                {job}
                              </span>
                            ))}
                            {gap.jobs.length > 3 && (
                              <span className="bg-white px-2 py-1 rounded text-xs text-gray-700">
                                +{gap.jobs.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        gap.count > 3 ? 'bg-red-200 text-red-800' :
                        gap.count > 1 ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {gap.count > 3 ? 'Critical' : gap.count > 1 ? 'Important' : 'Nice to Have'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RECOMMENDATIONS */}
        {recommendations.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">📚 Learning Recommendations</h2>
            <p className="text-gray-600 mb-6">
              Start with these resources to close your skill gaps and improve your job matches:
            </p>

            <div className="space-y-6">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="border-2 border-green-200 rounded-lg p-5 bg-green-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-green-800">{rec.skill}</h3>
                      <p className="text-sm text-gray-600">{rec.requiredFor}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      rec.priority === 'High' ? 'bg-red-200 text-red-800' :
                      rec.priority === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {rec.priority} Priority
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Online Courses */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        💻 Online Courses
                      </h4>
                      <ul className="space-y-1">
                        {rec.online.map((course, i) => (
                          <li key={i} className="text-sm text-gray-700 pl-4 border-l-2 border-green-300">
                            • {course}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Books */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        📖 Books (Offline)
                      </h4>
                      <ul className="space-y-1">
                        {rec.offline.map((book, i) => (
                          <li key={i} className="text-sm text-gray-700 pl-4 border-l-2 border-blue-300">
                            • {book}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Learning Platforms */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">🎓 Recommended Platforms:</h4>
                    <div className="flex flex-wrap gap-2">
                      {rec.platforms.map((platform, i) => (
                        <span key={i} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-300">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">🚀 Next Steps</h2>
          <ul className="space-y-2">
            {profileCompletion < 100 && (
              <li className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                <span>Complete your profile ({100 - profileCompletion}% remaining)</span>
              </li>
            )}
            {data.skills.length < 5 && (
              <li className="flex items-center gap-2">
                <span className="text-2xl">🛠️</span>
                <span>Add more skills (at least {5 - data.skills.length} more recommended)</span>
              </li>
            )}
            {skillGapAnalysis.length > 0 && (
              <li className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <span>Start learning {skillGapAnalysis[0].skill} (most in-demand)</span>
              </li>
            )}
            {data.applications.length === 0 && (
              <li className="flex items-center gap-2">
                <span className="text-2xl">💼</span>
                <span>Apply to your first job!</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Analytics;