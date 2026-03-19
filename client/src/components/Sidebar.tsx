import { useState } from "react";
import {
  HomeIcon,
  QueueListIcon,
  UserIcon,
  BookmarkIcon,
  MapPinIcon,
  PlusIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [expandCategories, setExpandCategories] = useState(false);
  const navItems = [
    { name: "Home", icon: <HomeIcon className="w-5 h-5" />, path: "/listings" },
    {
      name: "Categories",
      icon: <QueueListIcon className="w-5 h-5" />,
      children: [
        { name: "Electronics", path: "/categories/electronics" },
        { name: "Books", path: "/categories/books" },
        { name: "Clothes", path: "/categories/clothes" },
        { name: "Furniture", path: "/categories/furniture" },
      ],
    },
    {
      name: "Nearby",
      icon: <MapPinIcon className="w-5 h-5" />,
      path: "/nearby",
    },
    {
      name: "Saved items",
      icon: <BookmarkIcon className="w-5 h-5" />,
      path: "/saved-items",
    },
    {
      name: "My Listings",
      icon: <UserIcon className="w-5 h-5" />,
      path: "/my-listings",
    },
  ];

  return (
    <aside className="bg-[#111111] text-[#E5E5E5] w-56 min-h-screen flex flex-col justify-between border-r border-[#2A2A2A]">
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) =>
          "children" in item ? (
            <button
              key={item.name}
              onClick={() => setExpandCategories(!expandCategories)}
            >
              <div
                className={`flex items-center px-4 py-2 rounded-md ${expandCategories ? "bg-[#1A1A1A]" : "hover:bg-[#1A1A1A]"} transition-colors w-full text-left`}
              >
                <span className="text-[#2ACFCF] mr-4">{item.icon}</span>
                <span>{item.name}</span>
                <span className="ml-10">
                  {expandCategories ? (
                    <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                </span>
              </div>
              <div>
                {expandCategories &&
                  item.children?.map((child) => (
                    <Link
                      key={child.name}
                      to={child.path}
                      className="flex items-center pl-12 pr-4 py-2 rounded-md hover:bg-[#1A1A1A] transition-colors w-full"
                    >
                      <span>{child.name}</span>
                    </Link>
                  ))}
              </div>
            </button>
          ) : (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center px-4 py-2 rounded-md hover:bg-[#1A1A1A] transition-colors"
            >
              <span className="text-[#2ACFCF] mr-4">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ),
        )}
        <Link
          to="/create"
          className="flex items-center px-4 py-2 rounded-md hover:bg-[#1A1A1A] transition-colors w-full text-left"
        >
          <span className="text-[#2ACFCF] mr-4">
            <PlusIcon className="w-5 h-5" />
          </span>
          <span>Sell items</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
