import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChatBubbleBottomCenterTextIcon,
  BookmarkIcon as BookmarkOutline,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";
import ConfirmationModal from "../components/ConfirmationModal";
import { useSocket } from "../context/SocketProvider";

type AuthorInfo = {
  userId: string;
  username: string;
  email: string;
};

type ListingDetailData = {
  listingId: string;
  title: string;
  description: string | null;
  price: number;
  locationName: string;
  status: string;
  category: string;
  condition: string;
  imageUrls: string[];
  authorInfo: AuthorInfo;
  createdAt: Date;
  updatedAt: Date;
};

function ListingDetail() {
  const { listingId } = useParams();
  const [listing, setListing] = useState<ListingDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isUserAuthor, setIsUserAuthor] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();
  const { isConnected } = useSocket();

  useEffect(() => {
    if (auth.user && listingId) {
      const checkIsSaved = async () => {
        try {
          const response = await fetch("http://localhost:8080/api/saves", {
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
            },
          });
          const result = await response.json();
          const savedListings = result.data || [];
          const currentlySaved = savedListings.some(
            (item: any) => item.listingId === listingId,
          );
          setIsSaved(currentlySaved);
        } catch (error) {
          console.error("Failed to check saved status", error);
        }
      };
      checkIsSaved();
    }
  }, [auth.user, listingId, auth.accessToken]);

  async function handleToggleSave() {
    if (!auth.accessToken) {
      return navigate("/login");
    }
    try {
      const response = await fetch(
        `http://localhost:8080/api/saves/${listingId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        },
      );
      const result = await response.json();
      if (response.ok) {
        setIsSaved(result.data.saved);
        toast.success(result.message);
      }
    } catch (error) {
      toast.error("Failed to update saved status");
    }
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(listing?.authorInfo.username ?? "User")}&background=4f46e5&color=fff&size=128`;

  const formatDate = (value: string | Date) => {
    if (!value) return "N/A";

    const date = new Date(value);

    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

    const month = date.toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();

    return `${month} ${day}, ${year}, ${displayHours}:${displayMinutes} ${ampm}`;
  };

  useEffect(() => {
    if (!listingId) return;

    const fetchListing = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/listings/${listingId}`,
        );
        const result = await response.json();
        setListing(result.data || null);
      } catch (error) {
        console.error("Unable to load listing detail", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId, auth.user?.userId]);

  useEffect(() => {
    if (auth.user && listing) {
      setIsUserAuthor(auth.user.userId === listing.authorInfo.userId);
    }
  }, [auth.user, listing]);

  if (loading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ACFCF]"></div>
        <span className="ml-3 text-[#6F767E]">Loading...</span>
      </div>
    );
  }

  async function handleDelete() {
    try {
      const response = await fetch(
        `http://localhost:8080/api/listings/${listingId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        },
      );
      const result = await response.json();
      if (!response.ok) {
        return toast.error(`${result.error}`);
      }
      navigate("/listings");
      toast.success(`${result.message}`);
    } catch (error) {
      return toast.error("Something went wrong");
    }
  }

  async function handleContactSeller() {
    if (!auth.accessToken) {
      return navigate("/login");
    }
    if (isConnected) {
      const BASE_URL: string = import.meta.env.VITE_BASE_BACKEND_URL;
      const endPoint = `api/chats`;
      const url = new URL(endPoint, BASE_URL);
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          sellerId: listing?.authorInfo.userId,
        }),
      });
      if (!response.ok) {
        return toast.error("Something went wrong");
      }
      const result = await response.json();
      const chatId = result.data.chatId;
      navigate(`/chats/${chatId}`);
    }
  }

  if (!listing) {
    return (
      <div className="p-8 text-[#A1A1A1]">
        Listing not found.{" "}
        <Link to="/listings" className="text-[#2ACFCF] hover:text-[#26BABA]">
          Back to listings
        </Link>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#E5E5E5]">{listing.title}</h1>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {isUserAuthor ? (
            <div className="flex gap-2">
              <Link
                to={`/listings/edit/${listingId}`}
                className="px-4 py-1.5 rounded-md bg-[#2ACFCF] text-[#111111] text-sm font-medium hover:bg-[#26BABA] transition-colors"
              >
                Edit
              </Link>
              <button
                type="button"
                className="px-4 py-1.5 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                onClick={() => setIsDeleteModalOpen(!isDeleteModalOpen)}
              >
                Delete
              </button>
              <ConfirmationModal
                heading="Confirm Delete"
                message="Are you sure you want to delete this listing?"
                isModalOpen={isDeleteModalOpen}
                setIsModalOpen={setIsDeleteModalOpen}
                onConfirm={handleDelete}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-4">
          <div className="relative h-105 rounded-xl border border-[#2A2A2A] overflow-hidden">
            {listing.imageUrls.length > 0 ? (
              <div className="h-full w-full flex items-center justify-center bg-[#111111]">
                <img
                  src={`http://localhost:8080${listing.imageUrls[currentImageIdx]}`}
                  alt={`Listing image ${currentImageIdx + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-[#A1A1A1]">
                No image available
              </div>
            )}

            {listing.imageUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentImageIdx(
                      (prev) =>
                        (prev - 1 + listing.imageUrls.length) %
                        listing.imageUrls.length,
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white text-[18px] hover:bg-black/70 cursor-pointer"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentImageIdx(
                      (prev) => (prev + 1) % listing.imageUrls.length,
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white text-[18px] hover:bg-black/70 cursor-pointer"
                >
                  ›
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                  {currentImageIdx + 1} / {listing.imageUrls.length}
                </div>
              </>
            )}
          </div>
          <div className="p-4 bg-[#111111] border border-[#2A2A2A] rounded-lg">
            <h2 className="text-2xl font-semibold text-[#E5E5E5] mb-3">
              Description
            </h2>
            <p className="text-[#A1A1A1] leading-relaxed">
              {listing.description ??
                "No description provided for this listing yet."}
            </p>
          </div>
        </div>

        <aside className="p-4 bg-[#111111] border border-[#2A2A2A] rounded-lg space-y-4">
          <div>
            <p className="text-3xl font-bold text-[#E5E5E5]">
              Rs.{listing.price}
            </p>
            <p className="text-[#A1A1A1] text-sm mt-[0.6rem]">Listed by :</p>
          </div>
          <Link
            to={`/users/${listing.authorInfo.username}`}
            className="flex items-center gap-3 p-3 mt-0 bg-[#181818] rounded-md hover:bg-[#222222] transition-all"
          >
            <img
              src={avatarUrl}
              className="h-12 w-12 rounded-full bg-[#2A2A2A] overflow-hidden border border-[#2A2A2A] flex items-center justify-center text-xs text-[#A1A1A1]"
            />
            <div>
              <p className="text-[#E5E5E5] font-semibold">
                {listing.authorInfo.username}
              </p>
              <p className="text-[#2ACFCF] text-xs">View seller profile</p>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-[#181818] p-3">
              <p className="text-[#A1A1A1]">Category</p>
              <p className="text-[#E5E5E5] font-semibold">
                {listing.category.charAt(0).toUpperCase() +
                  listing.category.slice(1)}
              </p>
            </div>
            <div className="rounded-md bg-[#181818] p-3">
              <p className="text-[#A1A1A1]">Condition</p>
              <p className="text-[#E5E5E5] font-semibold">
                {listing.condition.charAt(0).toUpperCase() +
                  listing.condition.slice(1)}
              </p>
            </div>
            <div className="rounded-md bg-[#181818] p-3">
              <p className="text-[#A1A1A1]">Location</p>
              <p className="text-[#E5E5E5] font-semibold">
                {listing.locationName}
              </p>
            </div>
            <div className="rounded-md bg-[#181818] p-3">
              <p className="text-[#A1A1A1]">Status</p>
              <p className="text-[#E5E5E5] font-semibold flex items-center gap-1">
                {listing.status.charAt(0).toUpperCase() +
                  listing.status.slice(1)}{" "}
                {listing.status === "pending" && (
                  <button
                    title="There are pending offers on this listing.
Contact the seller for more details."
                  >
                    <InformationCircleIcon className="w-3 h-3" />
                  </button>
                )}
              </p>
            </div>
          </div>

          {isUserAuthor ? (
            <>
              <div className="rounded-md bg-[#181818] p-3 space-y-3 text-sm">
                <div>
                  <p className="text-[#A1A1A1]">Listed on</p>
                  <p className="text-[#E5E5E5] font-semibold">
                    {formatDate(listing.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[#A1A1A1]">Last updated</p>
                  <p className="text-[#E5E5E5] font-semibold">
                    {formatDate(listing.updatedAt)}
                  </p>
                </div>
                <p className="text-xs text-[#6F767E]">
                  You are the seller for this listing. Use Edit above to refresh
                  details or mark it sold.
                </p>
              </div>
            </>
          ) : (
            <>
              <button
                className="flex justify-center gap-2 w-full px-4 py-2 rounded-md bg-[#2ACFCF] text-[#111111] hover:bg-[#26BABA] transition-colors duration-300 cursor-pointer"
                onClick={handleContactSeller}
              >
                <ChatBubbleBottomCenterTextIcon className="w-6 h-6" />
                <span>Contact Seller</span>
              </button>

              <button
                className="flex justify-center gap-2 w-full px-4 py-2 border border-[#E5E5E5] rounded-md text-[#E5E5E5] hover:bg-[#E5E5E5] hover:text-[#111111] transition-colors duration-300 cursor-pointer"
                onClick={handleToggleSave}
              >
                {isSaved ? (
                  <BookmarkSolid className="w-6 h-6" />
                ) : (
                  <BookmarkOutline className="w-6 h-6" />
                )}
                <span>Save</span>
              </button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export default ListingDetail;
