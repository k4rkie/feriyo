import { useEffect, useState } from "react";
import ListingCard from "../components/ListingCard";

type authorInfo = {
  userId: number;
  username: string;
  email: string;
};

type ListingData = {
  listingId: number;
  title: string;
  description: string | null;
  price: number;
  isSold: boolean;
  authorId: number;
  imageUrls: string[];
  authorInfo: authorInfo;
};

function Listings() {
  const [listings, setListings] = useState<ListingData[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/listings");
        const result = await response.json();
        console.log("Fetched listings:", result.data);
        setListings(result.data);
      } catch (error) {
        console.error("Failed to load listings", error);
      }
    };
    fetchListings();
  }, []);

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
              authorName={listing.authorInfo.username}
            />
          ))}
        </section>
      )}
    </div>
  );
}

export default Listings;
