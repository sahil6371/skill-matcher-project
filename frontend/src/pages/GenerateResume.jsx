import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import jsPDF from "jspdf";

function GenerateResume() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState({
    profile: null,
    education: [],
    skills: [],
    languages: [],
    experience: [],
    projects: [],
    certifications: []
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [profile, education, skills, languages, experience, projects, certifications] = await Promise.all([
        fetch("http://localhost:5000/api/profile", { headers: { Authorization: `Bearer ${user}` } }).then(r => r.json()),
        fetch("http://localhost:5000/api/education", { headers: { Authorization: `Bearer ${user}` } }).then(r => r.json()),
        fetch("http://localhost:5000/api/skills", { headers: { Authorization: `Bearer ${user}` } }).then(r => r.json()),
        fetch("http://localhost:5000/api/languages", { headers: { Authorization: `Bearer ${user}` } }).then(r => r.json()),
        fetch("http://localhost:5000/api/experience", { headers: { Authorization: `Bearer ${user}` } }).then(r => r.json()),
        fetch("http://localhost:5000/api/projects", { headers: { Authorization: `Bearer ${user}` } }).then(r => r.json()),
        fetch("http://localhost:5000/api/certifications", { headers: { Authorization: `Bearer ${user}` } }).then(r => r.json())
      ]);

      setData({
        profile: profile.profile,
        education: education.education || [],
        skills: skills.skills || [],
        languages: languages.languages || [],
        experience: experience.experience || [],
        projects: projects.projects || [],
        certifications: certifications.certifications || []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!data.profile) {
      alert("Please complete your profile first!");
      return;
    }

    setGenerating(true);

    try {
      const doc = new jsPDF();
      let yPos = 20;
      const lineHeight = 7;
      const pageHeight = doc.internal.pageSize.height;

      // Helper function to check if we need a new page
      const checkPageBreak = (requiredSpace) => {
        if (yPos + requiredSpace > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }
      };

      // HEADER - Name and Contact
      doc.setFontSize(22);
      doc.setFont(undefined, "bold");
      doc.text(data.profile.full_name.toUpperCase(), 105, yPos, { align: "center" });
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      
      const contactLine = `Email: ${data.profile.email} | Contact: ${data.profile.mobile}`;
      doc.text(contactLine, 105, yPos, { align: "center" });
      
      yPos += 5;
      const locationLine = `${data.profile.current_location}, ${data.profile.country}`;
      doc.text(locationLine, 105, yPos, { align: "center" });
      
      yPos += 10;
      doc.setLineWidth(0.5);
      doc.line(15, yPos, 195, yPos);
      yPos += 8;

      // EDUCATION
      if (data.education.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("EDUCATION QUALIFICATIONS", 15, yPos);
        yPos += 8;

        data.education.forEach(edu => {
          checkPageBreak(20);
          
          doc.setFontSize(11);
          doc.setFont(undefined, "bold");
          doc.text(edu.institution_name, 15, yPos);
          
          doc.setFont(undefined, "normal");
          doc.setFontSize(10);
          yPos += 5;
          
          doc.text(`${edu.degree_type} in ${edu.field_of_study}`, 15, yPos);
          yPos += 5;
          
          const eduDetails = `${edu.start_year} - ${edu.currently_studying ? "Present" : edu.end_year || "N/A"}`;
          doc.text(eduDetails, 15, yPos);
          
          if (edu.grade_percentage) {
            doc.text(`${edu.grade_percentage}%`, 180, yPos);
          }
          
          yPos += 7;
        });
        
        yPos += 3;
      }

      // TECHNICAL SKILLS
      if (data.skills.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("TECHNICAL SKILLS", 15, yPos);
        yPos += 8;

        // Group skills by proficiency
        const skillsByLevel = {
          Expert: [],
          Advanced: [],
          Intermediate: [],
          Beginner: []
        };

        data.skills.forEach(skill => {
          skillsByLevel[skill.proficiency_level].push(skill.skill_name);
        });

        doc.setFontSize(10);
        doc.setFont(undefined, "normal");

        Object.entries(skillsByLevel).forEach(([level, skillList]) => {
          if (skillList.length > 0) {
            checkPageBreak(10);
            doc.setFont(undefined, "bold");
            doc.text(`${level}:`, 20, yPos);
            doc.setFont(undefined, "normal");
            doc.text(skillList.join(", "), 50, yPos, { maxWidth: 145 });
            yPos += 6;
          }
        });
        
        yPos += 3;
      }

      // LANGUAGES
      if (data.languages.length > 0) {
        checkPageBreak(20);
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("LANGUAGES", 15, yPos);
        yPos += 8;

        doc.setFontSize(10);
        data.languages.forEach(lang => {
          checkPageBreak(8);
          doc.setFont(undefined, "bold");
          doc.text(`• ${lang.language_name}`, 20, yPos);
          doc.setFont(undefined, "normal");
          
          const skills = [];
          if (lang.can_speak) skills.push("Speak");
          if (lang.can_read) skills.push("Read");
          if (lang.can_write) skills.push("Write");
          
          doc.text(`(${lang.proficiency_level} - ${skills.join(", ")})`, 60, yPos);
          yPos += 6;
        });
        
        yPos += 3;
      }

      // EXPERIENCE
      if (data.experience.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("EXPERIENCE", 15, yPos);
        yPos += 8;

        data.experience.forEach(exp => {
          checkPageBreak(25);
          
          doc.setFontSize(11);
          doc.setFont(undefined, "bold");
          doc.text(exp.job_title, 15, yPos);
          yPos += 5;
          
          doc.setFontSize(10);
          doc.setFont(undefined, "normal");
          doc.text(exp.company_name, 15, yPos);
          yPos += 5;
          
          const dates = `${new Date(exp.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })} - ${
            exp.currently_working ? "Present" : new Date(exp.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
          }`;
          doc.text(dates, 15, yPos);
          
          if (exp.location) {
            doc.text(`| ${exp.location}`, 80, yPos);
          }
          
          yPos += 5;
          
          if (exp.description) {
            const descLines = doc.splitTextToSize(exp.description, 175);
            descLines.forEach(line => {
              checkPageBreak(6);
              doc.text(line, 20, yPos);
              yPos += 5;
            });
          }
          
          yPos += 5;
        });
      }

      // PROJECTS
      if (data.projects.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("PROJECTS", 15, yPos);
        yPos += 8;

        data.projects.forEach(project => {
          checkPageBreak(25);
          
          doc.setFontSize(11);
          doc.setFont(undefined, "bold");
          doc.text(project.project_title, 15, yPos);
          yPos += 5;
          
          doc.setFontSize(10);
          doc.setFont(undefined, "normal");
          
          const descLines = doc.splitTextToSize(project.description, 175);
          descLines.forEach(line => {
            checkPageBreak(6);
            doc.text(line, 20, yPos);
            yPos += 5;
          });
          
          if (project.technologies_used) {
            checkPageBreak(6);
            doc.setFont(undefined, "bold");
            doc.text("Technologies Used:", 20, yPos);
            doc.setFont(undefined, "normal");
            doc.text(project.technologies_used, 65, yPos);
            yPos += 5;
          }
          
          yPos += 3;
        });
      }

      // CERTIFICATIONS
      if (data.certifications.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("ADDITIONAL CERTIFICATIONS", 15, yPos);
        yPos += 8;

        doc.setFontSize(10);
        data.certifications.forEach(cert => {
          checkPageBreak(10);
          doc.setFont(undefined, "bold");
          doc.text(`• ${cert.certification_name}`, 20, yPos);
          yPos += 5;
          
          doc.setFont(undefined, "normal");
          doc.text(`${cert.issuing_organization} | ${new Date(cert.issue_date).getFullYear()}`, 25, yPos);
          yPos += 6;
        });
      }

      // PERSONAL DETAILS
      checkPageBreak(30);
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("PERSONAL DETAILS", 15, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(`• Address: ${data.profile.hometown}, ${data.profile.country}`, 20, yPos);
      yPos += 6;
      
      if (data.profile.date_of_birth) {
        const dob = new Date(data.profile.date_of_birth).toLocaleDateString("en-IN", { 
          day: "numeric", 
          month: "long", 
          year: "numeric" 
        });
        doc.text(`• Date of Birth: ${dob}`, 20, yPos);
      }

      // Save PDF
      doc.save(`${data.profile.full_name.replace(/\s+/g, "_")}_Resume.pdf`);
      
      alert("Resume generated successfully! 🎉");

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating resume. Please try again.");
    } finally {
      setGenerating(false);
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

  const completionChecks = {
    profile: data.profile !== null,
    education: data.education.length > 0,
    skills: data.skills.length > 0,
    experience: data.experience.length > 0 || data.projects.length > 0
  };

  const isReadyToGenerate = Object.values(completionChecks).every(Boolean);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Generate Resume</h1>

        <div className="bg-white p-8 rounded-xl shadow-md max-w-3xl">
          <h2 className="text-2xl font-bold mb-6">Professional Resume Generator</h2>
          
          <p className="text-gray-600 mb-6">
            Generate a professional PDF resume based on your complete profile. Your resume will include:
          </p>

          {/* Checklist */}
          <div className="space-y-3 mb-8">
            <div className={`flex items-center gap-3 p-3 rounded ${completionChecks.profile ? 'bg-green-50' : 'bg-red-50'}`}>
              <span className="text-2xl">{completionChecks.profile ? '✅' : '❌'}</span>
              <div>
                <p className="font-semibold">Basic Profile Information</p>
                <p className="text-sm text-gray-600">Name, contact details, location</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded ${completionChecks.education ? 'bg-green-50' : 'bg-red-50'}`}>
              <span className="text-2xl">{completionChecks.education ? '✅' : '❌'}</span>
              <div>
                <p className="font-semibold">Education Qualifications</p>
                <p className="text-sm text-gray-600">Degrees, institutions, grades</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded ${completionChecks.skills ? 'bg-green-50' : 'bg-red-50'}`}>
              <span className="text-2xl">{completionChecks.skills ? '✅' : '❌'}</span>
              <div>
                <p className="font-semibold">Technical Skills</p>
                <p className="text-sm text-gray-600">Programming languages, tools, technologies</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded ${completionChecks.experience ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <span className="text-2xl">{completionChecks.experience ? '✅' : '⚠️'}</span>
              <div>
                <p className="font-semibold">Experience / Projects</p>
                <p className="text-sm text-gray-600">Work history or project portfolio (at least one)</p>
              </div>
            </div>

            {data.languages.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded bg-green-50">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold">Languages ({data.languages.length})</p>
                  <p className="text-sm text-gray-600">Will be included</p>
                </div>
              </div>
            )}

            {data.certifications.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded bg-green-50">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold">Certifications ({data.certifications.length})</p>
                  <p className="text-sm text-gray-600">Will be included</p>
                </div>
              </div>
            )}
          </div>

          {/* Preview Statistics */}
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="font-bold mb-3">Your Resume Will Include:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-blue-600">{data.education.length}</p>
                <p className="text-sm text-gray-600">Education Entries</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{data.skills.length}</p>
                <p className="text-sm text-gray-600">Skills</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{data.experience.length}</p>
                <p className="text-sm text-gray-600">Work Experience</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{data.projects.length}</p>
                <p className="text-sm text-gray-600">Projects</p>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex gap-4">
            <button
              onClick={generatePDF}
              disabled={!isReadyToGenerate || generating}
              className={`flex-1 py-3 rounded-lg font-bold ${
                isReadyToGenerate && !generating
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {generating ? "Generating PDF..." : "📄 Generate PDF Resume"}
            </button>
          </div>

          {!isReadyToGenerate && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 rounded">
              <p className="text-yellow-800 font-semibold">⚠️ Complete Required Sections</p>
              <p className="text-sm text-yellow-700 mt-1">
                Please fill in all required sections (Profile, Education, Skills, and at least Experience or Projects) before generating your resume.
              </p>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-4 text-center">
            Your resume will be formatted professionally similar to standard resume templates.
          </p>
        </div>
      </div>
    </div>
  );
}

export default GenerateResume;