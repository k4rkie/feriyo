import { useEffect, useState } from "react";
import ListingCard from "../components/ListingCard";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type authorInfo = {
  userId: number;
  username: string;
  email: string;
};

type MyListingData = {
  listingId: number;
  title: string;
  description: string | null;
  price: number;
  category: string;
  condition: string;
  location: string;
  isSold: boolean;
  imageUrls: string[];
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
};

function MyListings() {
  const [listings, setListings] = useState<MyListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/listings/me", {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });
        const result = await response.json();
        setListings(result.data);
      } catch (error) {
        console.error("Failed to load listings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [auth.user?.userId]);

  if (!auth.isAuthLoading && !auth.user) {
    <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div className="p-8 text-[#A1A1A1]">Loading listing details...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5 text-[#E5E5E5]">All Listings</h1>
      {listings.length === 0 ? (
        <div className="text-[#A1A1A1]">No listings found.</div>
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
              authorName={"You"}
            />
          ))}
        </section>
      )}
    </div>
  );
}

export default MyListings;
