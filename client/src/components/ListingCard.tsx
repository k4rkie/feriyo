import { Link } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/outline";

type ListingCardProps = {
  listingId: number;
  title: string;
  description?: string | null;
  price: number;
  authorId: number;
  imageUrl: string[];
  authorName: string;
};

function ListingCard({
  listingId = -1,
  title = "Sample title",
  description = "No description available",
  price = 0.99,
  imageUrl = [
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2F474x%2F9e%2F83%2F75%2F9e837528f01cf3f42119c5aeeed1b336.jpg%3Fnii%3Dt&f=1&nofb=1&ipt=2c20d3aa05ceab608416a76afd8dc6216bb751e9ffa1070903d355b82338b10d",
  ],
  authorName = "Unknown Seller",
}: ListingCardProps) {
  return (
    <Link to={`/listings/${listingId}`} className="group">
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
        <img
          src={`http://localhost:8080${imageUrl[0]}`}
          alt={title}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h2 className="text-[#E5E5E5] text-lg font-semibold mb-1 truncate">
            {title}
          </h2>
          <div className="flex items-center justify-between">
            <p className="text-[#A1A1A1] text-sm mb-2 line-clamp-2">
              {description}
            </p>
            <p className="text-[#E5E5E5] font-bold mb-1">Rs.{price}</p>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-[#A1A1A1]">
            <span className="flex items-center gap-1 rounded-full border border-[#2A2A2A] px-2 py-1">
              <UserCircleIcon className="h-5 w-5" />
              {authorName}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ListingCard;
