import { useState } from "react";
import { useAuth } from "../context/AuthProvider";

type Tab = "listings" | "sold";

function UserProfile() {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("listings");
  const user = auth.user;

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0f0f0f] p-4">
        <div className="rounded-2xl bg-[#161616] p-8 text-center w-full max-w-sm border border-[#2A2A2A]">
          <h1 className="text-xl font-semibold text-[#E5E5E5]">Not logged in</h1>
          <p className="mt-2 text-sm text-[#A1A1AA]">Please log in to view your profile.</p>
        </div>
      </main>
    );
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=4f46e5&color=fff&size=256`;

  return (
    <div className="max-w-3xl m-auto py-8 px-4">
      <header className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        <img
          src={avatarUrl}
          alt={user.username}
          className="h-28 w-28 rounded-full border-2 border-[#2A2A2A] object-cover"
        />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-[#E5E5E5]">{user.username}</h1>
          <p className="text-[#A1A1AA] text-sm mt-1">San Francisco, CA</p>
          <p className="mt-3 text-sm text-[#E5E5E5] leading-relaxed max-w-md">
            Passionate creator and explorer. Building modern web apps. 🚀
          </p>
          <div className="flex justify-center sm:justify-start gap-4 mt-4">
            <button className="px-4 py-1.5 bg-[#2A2A2A] hover:bg-[#333] text-[#E5E5E5] text-xs font-semibold rounded-full transition">
              Edit Profile
            </button>
            <button className="px-4 py-1.5 bg-[#2A2A2A] hover:bg-[#333] text-[#E5E5E5] text-xs font-semibold rounded-full transition">
              Settings
            </button>
          </div>
        </div>
      </header>

      {/* tabs */}
      <div className="border-b border-[#2A2A2A]">
        <nav className="flex gap-8 items-center justify-center">
          {(["listings", "sold"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition ${
                activeTab === tab
                  ? "text-[#2ACFCF] border-b-2 border-[#2ACFCF]"
                  : "text-[#A1A1AA] hover:text-[#E5E5E5]"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <section className="py-6">
        <p className="text-[#A1A1AA] text-sm text-center py-10">
          No {activeTab} yet.
        </p>
      </section>
    </div>
  );
}

export default UserProfile;
