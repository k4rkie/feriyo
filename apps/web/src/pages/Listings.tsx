import { useEffect, useState } from "react";
import ListingCard from "../components/ListingCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

type authorInfo = {
  userId: string;
  username: string;
  email: string;
  avatarUrl: string | null;
};

type ListingData = {
  listingId: string;
  title: string;
  description: string | null;
  price: number;
  status: string;
  authorId: string;
  imageUrls: string[];
  authorInfo: authorInfo;
};

function Listings() {
  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentPage = Math.max(
    1,
    Number(searchParams.get("page") ?? 1) || 1,
  );
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const pageHeading = search
    ? `Results for: ${search}`
    : category
      ? category.charAt(0).toUpperCase() + category.slice(1)
      : "All listings";

  const BASE_URL: string = import.meta.env.VITE_BASE_BACKEND_URL;

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      if (category) params.set("category", category);
      if (search) params.set("search", search);

      try {
        const response = await fetch(
          `${BASE_URL}/api/listings?${params.toString()}`,
        );
        const result = await response.json();

        if (!response.ok) {
          toast.error(result.message || "Failed to load listings");
          return;
        }

        setListings(result.data ?? []);
        setTotalPages(result.meta?.totalPages ?? 1);
      } catch {
        toast.error("Failed to load listings");
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [BASE_URL, category, currentPage, search]);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    navigate(`/listings?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ACFCF]"></div>
        <span className="ml-3 text-[#6F767E]">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-5 text-[#E5E5E5]">{pageHeading}</h1>
      {listings.length === 0 ? (
        <div className="text-[#A1A1A1]">No listings found.</div>
      ) : (
        <>
          <section className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.listingId}
                listingId={listing.listingId}
                title={listing.title}
                description={listing.description}
                price={listing.price}
                authorId={listing.authorId}
                imageUrl={listing.imageUrls}
                authorName={listing.authorInfo.username}
                authorAvatarUrl={listing.authorInfo.avatarUrl}
              />
            ))}
          </section>
          <footer className="flex w-full justify-center">
            <button
              className="ml-2 px-3 py-2 rounded-md bg-[#2ACFCF] text-[#111111] hover:bg-[#26BABA] transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Prev"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {" < "}
            </button>
            <span className="ml-2 px-3 py-2 rounded-md border-1 bg-[#1A1A1A] text-[#E5E5E5] border-[#919191]">
              {currentPage} / {totalPages}
            </span>
            <button
              className="ml-2 px-3 py-2 rounded-md bg-[#2ACFCF] text-[#111111] hover:bg-[#26BABA] transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              {" > "}
            </button>
          </footer>
        </>
      )}
    </div>
  );
}

export default Listings;
