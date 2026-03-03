import { Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ChatBubbleBottomCenterTextIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import ProfileDrowpdown from "./ProfileDrowpdown";
import { useState } from "react";
import toast from "react-hot-toast";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const handleSearch = () => {};
  const auth = useAuth();
  return (
    <nav className="bg-[#111111] text-[#E5E5E5] px-6 py-3 flex items-center justify-between border-b border-[#2A2A2A]">
      <Link to="/listings" className="flex items-center">
        <img src="/logo.svg" alt="Feriyo Logo" className="h-10 w-20 mr-1" />
      </Link>
      <div className="flex items-center space-x-3"></div>

      <form onSubmit={handleSearch} className="mx-6 flex justify-center flex-1">
        <input
          type="text"
          placeholder="Search..."
          className="w-75 px-4 py-2 rounded-md bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] focus:outline-none focus:ring-2 focus:ring-[#2ACFCF] focus:border-[#2ACFCF]"
        />
        <button
          type="button"
          onClick={() => toast.success("Logged")}
          className="ml-2 px-3 py-2 rounded-md bg-[#2ACFCF] text-[#111111] hover:bg-[#26BABA] transition-colors duration-300 cursor-pointer"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </form>

      {auth.user ? (
        <>
          <div className="flex items-center space-x-4 ">
            <button className="relative p-2 rounded hover:bg-[#1A1A1A] cursor-pointer">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-[#FF9E67]"></span>
            </button>
            <button className="relative p-2 rounded hover:bg-[#1A1A1A] cursor-pointer">
              <ChatBubbleBottomCenterTextIcon className="w-6 h-6" />
              <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-[#FF9E67]"></span>
            </button>
            <div
              title={auth.user.username}
              className="w-9 h-9 rounded-full overflow-hidden cursor-pointer"
              onClick={() => {
                setShowDropdown(!showDropdown);
              }}
            >
              <img
                src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2F474x%2F9e%2F83%2F75%2F9e837528f01cf3f42119c5aeeed1b336.jpg%3Fnii%3Dt&f=1&nofb=1&ipt=2c20d3aa05ceab608416a76afd8dc6216bb751e9ffa1070903d355b82338b10d"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          {showDropdown && <ProfileDrowpdown />}
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="ml-2 px-3 py-2 rounded-md bg-[#2ACFCF] text-[#111111] hover:bg-[#26BABA]"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="ml-2 px-3 py-2 rounded-md bg-[#2ACFCF] text-[#111111] hover:bg-[#26BABA]"
          >
            Signup
          </Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
