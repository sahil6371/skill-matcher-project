import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${user}` }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      setProfile(data.profile);

      if (data.profile) {
        calculateCompletion(data.profile);
        setForm(data.profile); // Pre-fill form for editing
      }

    } catch (err) {
      setError("Could not load profile. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = (data) => {
    const fields = Object.values(data).slice(2, 10);
    const filled = fields.filter(Boolean).length;
    const percent = Math.round((filled / 8) * 100);
    setCompletion(percent);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, profile_photo: reader.result });
    };
    reader.readAsDataURL(file);
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  // Frontend validations
  if (form.full_name && form.full_name.trim().length < 2) {
    setError("Full name must be at least 2 characters");
    return;
  }

  if (form.mobile && !/^\d{10}$/.test(form.mobile)) {
    setError("Mobile must be exactly 10 digits");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user}`
      },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Failed to save profile");
      return;
    }

    setEditing(false);
    fetchProfile();

  } catch (err) {
    setError("Server error. Please try again.");
    console.error(err);
  }
};
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-md">
          {!profile || editing ? (
            <div className="max-w-lg">
              <h2 className="text-2xl font-bold mb-6">
                {profile ? "Update Profile" : "Complete Your Profile"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                    className="input"
                  />
                  {form.profile_photo && (
                    <img src={form.profile_photo} alt="Preview" className="mt-2 w-24 h-24 rounded-full object-cover" />
                  )}
                </div>

                <input
                  name="full_name"
                  placeholder="Full Name"
                  value={form.full_name || ""}
                  onChange={handleChange}
                  required
                  className="input"
                />

                <select
                  name="gender"
                  value={form.gender || ""}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>

                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth || ""}
                  onChange={handleChange}
                  required
                  className="input"
                />

                <input
                  name="mobile"
                  placeholder="Mobile (10 digits)"
                  value={form.mobile || ""}
                  onChange={handleChange}
                  required
                  className="input"
                />

                <input
                  name="current_location"
                  placeholder="Current Location"
                  value={form.current_location || ""}
                  onChange={handleChange}
                  required
                  className="input"
                />

                <input
                  name="country"
                  placeholder="Country"
                  value={form.country || ""}
                  onChange={handleChange}
                  required
                  className="input"
                />

                <input
                  name="hometown"
                  placeholder="Hometown"
                  value={form.hometown || ""}
                  onChange={handleChange}
                  required
                  className="input"
                />

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Save Profile
                  </button>

                  {profile && (
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <div className="max-w-2xl">
              <div className="text-center">
                <img
                  src={profile.profile_photo}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto object-cover mb-4 border-4 border-blue-500"
                />

                <h2 className="text-2xl font-bold">{profile.full_name}</h2>

                {/* Animated Progress */}
                <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-700"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <p className="mt-2 font-semibold">{completion}% Complete</p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Gender</p>
                  <p className="font-semibold">{profile.gender}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Date of Birth</p>
                  <p className="font-semibold">{profile.date_of_birth}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Mobile</p>
                  <p className="font-semibold">{profile.mobile}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Current Location</p>
                  <p className="font-semibold">{profile.current_location}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Country</p>
                  <p className="font-semibold">{profile.country}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Hometown</p>
                  <p className="font-semibold">{profile.hometown}</p>
                </div>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="mt-6 bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
              >
                Update Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
