import { Link, useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ChatBubbleBottomCenterTextIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthProvider";
import ProfileDrowpdown from "./ProfileDrowpdown";
import { useRef, useState } from "react";
import Notifications from "./Notifications";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchInputRef.current) {
      const query = searchInputRef.current.value;
      searchInputRef.current.blur();
      if (query.trim()) {
        navigate(`/listings?search=${encodeURIComponent(query)}`);
      }
    }
  };
  const auth = useAuth();
  const avatarUrl = auth.user?.avatarUrl
    ? `http://localhost:8080${auth.user.avatarUrl}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user?.username || "User")}&background=4f46e5&color=fff&size=128`;

  return (
    <nav className="bg-[#111111] text-[#E5E5E5] px-6 py-3 flex items-center justify-between border-b border-[#2A2A2A]">
      <Link to="/listings" className="flex items-center">
        <img src="/feriyo.svg" alt="Feriyo Logo" className="h-10 w-20 mr-1" />
      </Link>
      <div className="flex items-center space-x-3"></div>
      <form onSubmit={handleSearch} className="mx-6 flex justify-center flex-1">
        <input
          type="text"
          placeholder="Search..."
          ref={searchInputRef}
          className="w-75 px-4 py-2 rounded-md bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] focus:outline-none focus:ring-2 focus:ring-[#2ACFCF] focus:border-[#2ACFCF]"
        />
        <button
          type="submit"
          className="ml-2 px-3 py-2 rounded-md bg-[#2ACFCF] text-[#111111] hover:bg-[#26BABA] transition-colors duration-300 cursor-pointer"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </form>
      {!auth.isAuthLoading && auth.user ? (
        <>
          <div className="flex items-center space-x-4 ">
            <button
              className="relative p-2 rounded hover:bg-[#1A1A1A] cursor-pointer"
              onClick={() => setIsNotiOpen(!isNotiOpen)}
            >
              <BellIcon className="w-6 h-6" />
              {/* <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-[#FF9E67]"></span> */}
            </button>
            <button
              className="relative p-2 rounded hover:bg-[#1A1A1A] cursor-pointer"
              onClick={() => {
                navigate("/chats");
              }}
            >
              <ChatBubbleBottomCenterTextIcon className="w-6 h-6" />
              {/* <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-[#FF9E67]"></span> */}
            </button>
            <div
              title={auth.user.username}
              className="w-9 h-9 rounded-full overflow-hidden cursor-pointer"
              onClick={() => {
                setShowDropdown(!showDropdown);
              }}
            >
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          {showDropdown && (
            <ProfileDrowpdown setShowDropdown={setShowDropdown} />
          )}
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
      <Notifications isNotiOpen={isNotiOpen} setIsNotiOpen={setIsNotiOpen} />
    </nav>
  );
};

export default Navbar;
