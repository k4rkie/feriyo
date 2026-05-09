import { useEffect, useState } from "react";
import ListingCard from "../components/ListingCard";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

type MyListingData = {
  listingId: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  condition: string;
  locationName: string;
  status: string;
  imageUrls: string[];
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  authorInfo?: {
    username: string;
  }
};

function SavedListings() {
  const [listings, setListings] = useState<MyListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

  useEffect(() => {
    if (!auth.accessToken) return;
    
    const fetchListings = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/saves", {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });
        const result = await response.json();
        setListings(result.data || []);
      } catch (error) {
        console.error("Failed to load saved listings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [auth.accessToken]);

  if (!auth.isAuthLoading && !auth.user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ACFCF]"></div>
        <span className="ml-3 text-[#6F767E]">Loading saved items...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-5 text-[#E5E5E5]">Saved Items</h1>
      {listings.length === 0 ? (
        <div className="text-[#A1A1A1]">You haven't saved any items yet.</div>
      ) : (
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
              authorName={listing.authorInfo?.username || "Seller"}
            />
          ))}
        </section>
      )}
    </div>
  );
}

export default SavedListings;
