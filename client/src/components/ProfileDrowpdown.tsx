import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function ProfileDrowpdown() {
  const auth = useAuth();
  const handleLogout = () => {
    auth.logout();
    toast.success("Logged out successfully");
  };
  return (
    <div className="absolute right-4 top-15 mt-2 w-48 bg-[#111111] border border-[#2A2A2A] rounded-md shadow-lg py-1 z-20">
      <ul>
        <li>
          <Link to="/profile" className="block px-4 py-2 hover:bg-[#1A1A1A]">
            Profile
          </Link>
        </li>
        <li>
          <Link to="/settings" className="block px-4 py-2 hover:bg-[#1A1A1A]">
            Settings
          </Link>
        </li>
        <li>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 hover:bg-[#1A1A1A]"
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}

export default ProfileDrowpdown;
