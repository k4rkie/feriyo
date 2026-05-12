import { useEffect, useState } from "react";
import ListingCard from "../components/ListingCard";
import { useNavigate, useSearchParams } from "react-router-dom";

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
  const [listings, setListings] = useState<ListingData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageHeading, setPageHeading] = useState("All listings");
  const [searchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const currentPage =
    searchParams.get("page") === null ? 1 : Number(searchParams.get("page"));

  const BASE_URL: string = import.meta.env.VITE_BASE_BACKEND_URL;
  const endPoint = `api/listings?page=${currentPage}`;
  const url = new URL(endPoint, BASE_URL);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const category = searchParams.get("category");
      const search = searchParams.get("search");

      if (category) {
        url.searchParams.append("category", category);
        setPageHeading(
          `${category.charAt(0).toUpperCase() + category.slice(1)}`,
        );
      }
      if (search) {
        url.searchParams.append("search", search);
        setPageHeading(`Results for: ${search}`);
      }
      if (!category && !search) {
        setPageHeading("All listings");
      }
      try {
        const response = await fetch(url.toString());
        const result = await response.json();
        setListings(result.data || null);
        setTotalPages(result.meta.totalPages);
      } catch (error) {
        console.error("Failed to load listings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [searchParams, currentPage]);

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
      {!listings ? (
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
              className="ml-2 px-3 py-2 rounded-md bg-[#2ACFCF] text-[#111111] hover:bg-[#26BABA] transition-colors duration-300 cursor-pointer"
              title="Prev"
              onClick={() => {
                if (currentPage === 1) {
                  return;
                }
                navigate(`/listings?page=${currentPage - 1}`);
                return currentPage - 1;
              }}
              disabled={currentPage === 1}
            >
              {" < "}
            </button>
            <span className="ml-2 px-3 py-2 rounded-md border-1 bg-[#1A1A1A] text-[#E5E5E5] border-[#919191]">
              {currentPage}
            </span>
            <button
              className="ml-2 px-3 py-2 rounded-md bg-[#2ACFCF] text-[#111111] hover:bg-[#26BABA] transition-colors duration-300 cursor-pointer"
              title="Next"
              onClick={() => {
                if (currentPage === totalPages) return;
                navigate(`/listings?page=${currentPage + 1}`);
                return currentPage + 1;
              }}
              disabled={totalPages === currentPage}
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
