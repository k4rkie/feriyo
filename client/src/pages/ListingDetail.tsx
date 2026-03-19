import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

type AuthorInfo = {
  userId: number;
  username: string;
  email: string;
};

type ListingDetailData = {
  listingId: number;
  title: string;
  description: string | null;
  price: number;
  location: string;
  isSold: boolean;
  category: string;
  condition: string;
  imageUrls: string[];
  authorInfo: AuthorInfo;
};

function ListingDetail() {
  const { listingId } = useParams();
  const [listing, setListing] = useState<ListingDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    if (!listingId) return;

    const fetchListing = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/listings/${listingId}`,
        );
        const result = await response.json();
        console.log(result.data);
        setListing(result.data || null);
      } catch (error) {
        console.error("Unable to load listing detail", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  if (loading) {
    return <div className="p-8 text-[#A1A1A1]">Loading listing details...</div>;
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
          <p className="text-[#A1A1A1] mt-2 text-sm md:text-base">
            {listing.location.charAt(0).toUpperCase() +
              listing.location.slice(1)}{" "}
            •{" "}
            {listing.category.charAt(0).toUpperCase() +
              listing.category.slice(1)}{" "}
            •{" "}
            {listing.condition.charAt(0).toUpperCase() +
              listing.condition.slice(1)}{" "}
          </p>
        </div>
        <span
          className={`inline-block px-4 py-1.5 rounded-xl text-sm font-semibold ${listing.isSold ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
        >
          {listing.isSold ? "Sold" : "Available"}
        </span>
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
            <p className="text-[#A1A1A1] text-sm">Listed by</p>
          </div>
          <Link
            to={`/profile/${listing.authorInfo.userId}`}
            className="flex items-center gap-3 p-3 bg-[#181818] rounded-md hover:bg-[#222222] transition-all"
          >
            <div className="h-12 w-12 rounded-full bg-[#2A2A2A] overflow-hidden border border-[#2A2A2A] flex items-center justify-center text-xs text-[#A1A1A1]">
              {listing.authorInfo.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[#E5E5E5] font-semibold">
                {listing.authorInfo.username}
              </p>
              <p className="text-[#2ACFCF] text-xs">View seller profile</p>
            </div>
          </Link>
          <button className="w-full px-4 py-2 rounded-md bg-[#2ACFCF] text-[#111111] hover:bg-[#26BABA] transition-colors duration-300">
            Contact Seller
          </button>
        </aside>
      </div>
    </div>
  );
}

export default ListingDetail;
