import { useEffect, useState } from "react";
import { PencilIcon } from "@heroicons/react/24/solid";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import ListingCard from "../components/ListingCard";

type Tab = "listings" | "sold";

type UserProfileData = {
  userId: string;
  username: string;
  locationName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: Date;
} & (
  | {
      latitude?: undefined;
      longitude?: undefined;
      email?: undefined;
    }
  | {
      latitude: string | null;
      longitude: string | null;
      email: string;
    }
);

type UserListings = {
  category:
    | "electronics"
    | "education"
    | "fashion"
    | "furniture"
    | "vehicle"
    | "others";
  condition: "new" | "good" | "fair" | "old";
  status: "available" | "pending" | "sold";
  listingId: string;
  title: string;
  description: string | null;
  price: number;
  locationName: string;
  latitude: string | null;
  longitude: string | null;
  imageUrls: string[];
  createdAt: Date;
  authorId: string;
  updatedAt: Date;
};

function UserProfile() {
  const [activeTab, setActiveTab] = useState<Tab>("listings");
  const [isLoading, setIsLoading] = useState(false);
  const BASE_URL: string = import.meta.env.VITE_BASE_BACKEND_URL;
  const { username } = useParams();
  const auth = useAuth();
  const [userProfileData, setUserProfileData] =
    useState<UserProfileData | null>(null);
  const [userListings, setUserListings] = useState<UserListings[]>([]);

  useEffect(() => {
    if (!auth.isAuthLoading && auth.accessToken) {
      async function fetchUserProfileData() {
        const endPoint = `api/users/${username}`;
        const url = new URL(endPoint, BASE_URL);
        setIsLoading(true);
        try {
          const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
            },
          });
          const result = await response.json();
          if (!response.ok) {
            toast.error(result.message);
            return;
          }
          console.log("Profile Data:", result.data.userProfileData);
          console.log("User listings:", result.data.userListings);
          setUserProfileData(result.data.userProfileData);
          setUserListings(result.data.userListings);
        } catch (error) {
          toast.error("Something went wrong");
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      }
      fetchUserProfileData();
    }
  }, [BASE_URL, username, auth.accessToken, auth.isAuthLoading]);

  if (isLoading || auth.isAuthLoading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ACFCF]"></div>
        <span className="ml-3 text-[#6F767E]">Loading...</span>
      </div>
    );
  }

  if (!userProfileData) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <p className="text-[#A1A1AA]">User not found</p>
      </div>
    );
  }

  console.log(activeTab);
  const isOwner = auth.user?.userId === userProfileData.userId;
  const avatarUrl =
    `${BASE_URL}${userProfileData.avatarUrl}` ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userProfileData.username,
    )}&background=4f46e5&color=fff&size=256`;

  return (
    <div className="max-w-6xl m-auto py-8 px-4">
      <header className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-8">
        <img
          src={avatarUrl}
          alt={userProfileData.username}
          className="h-28 w-28 rounded-full border-2 border-[#2A2A2A] object-cover"
        />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl font-bold text-[#E5E5E5]">
              {userProfileData.username}
            </h1>
            {userProfileData.isVerified ? (
              <span className="bg-[#2ACFCF]/10 text-[#2ACFCF] text-[10px] px-1.5 py-0.5 rounded-full font-medium border border-[#2ACFCF]/20">
                Verified
              </span>
            ) : (
              <span className="bg-[#FF4D4D]/10 text-[#FF4D4D] text-[10px] px-1.5 py-0.5 rounded-full font-medium border border-[#FF4D4D]/20">
                Not Verified
              </span>
            )}
          </div>

          <div className="flex flex-col mt-1 space-y-0.5 text-sm">
            <p className="text-[#A1A1AA]">
              <span className="text-[#6F767E]">Location:</span>{" "}
              {userProfileData.locationName || "No location set"}
            </p>
            {userProfileData.email && (
              <p className="text-[#A1A1AA]">
                <span className="text-[#6F767E]">Email:</span>{" "}
                {userProfileData.email}
              </p>
            )}
            {(userProfileData.latitude || userProfileData.longitude) && (
              <p className="text-[#6F767E] text-xs">
                Coordinates: {userProfileData.latitude || "N/A"},{" "}
                {userProfileData.longitude || "N/A"}
              </p>
            )}
          </div>

          <p className="mt-1.5 text-xs text-[#6F767E]">
            Joined {new Date(userProfileData.createdAt).toLocaleDateString()}
          </p>
        </div>
        {isOwner && (
          <div className="flex justify-center sm:justify-start">
            <Link
              to={`/users/${username}/edit`}
              className="flex justify-center items-center gap-1 px-4 py-1.5 
            bg-[#2A2A2A] hover:bg-[#333] text-[#E5E5E5] text-xs font-semibold rounded-full transition"
            >
              Edit Profile <PencilIcon className="w-3 h-3" />
            </Link>
          </div>
        )}
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
        {(() => {
          const filtered = userListings.filter((l) =>
            activeTab === "listings"
              ? l.status !== "sold"
              : l.status === "sold",
          );

          if (filtered.length === 0) {
            return (
              <p className="text-[#A1A1AA] text-sm text-center py-10">
                No {activeTab} yet.
              </p>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((listing) => (
                <ListingCard
                  key={listing.listingId}
                  listingId={listing.listingId}
                  title={listing.title}
                  description={listing.description}
                  price={listing.price}
                  authorId={listing.authorId}
                  imageUrl={listing.imageUrls}
                  authorName={userProfileData.username}
                />
              ))}
            </div>
          );
        })()}
      </section>
    </div>
  );
}

export default UserProfile;
