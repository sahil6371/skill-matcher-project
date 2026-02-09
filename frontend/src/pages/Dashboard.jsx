import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-lg">Welcome to your dashboard! 🚀</p>
          <p className="text-gray-600 mt-2">Start building your profile and explore opportunities.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;