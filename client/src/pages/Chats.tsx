import { Navigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import {
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
} from "@heroicons/react/24/solid";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { useSocket } from "../context/SocketProvider";
import MakeOfferModal from "../components/MakeOfferModal";
import toast from "react-hot-toast";

type ChatListItem = {
  listingId: string;
  sellerId: string;
  chatId: string;
  createdAt: Date;
  buyerId: string;
  listing: {
    listingId: string;
    title: string;
    price: number;
    imageUrls: string[];
  };
  buyer: {
    username: string;
    avatarUrl: string | null;
  };
  seller: {
    username: string;
    avatarUrl: string | null;
  };
};

type ChatData = {
  listingId: string;
  sellerId: string;
  chatId: string;
  createdAt: Date;
  buyerId: string;
  listing: {
    listingId: string;
    title: string;
    price: number;
    imageUrls: string[];
  };
  buyer: {
    userId: string;
    username: string;
    avatarUrl: string | null;
  };
  seller: {
    userId: string;
    username: string;
    avatarUrl: string | null;
  };
};

type Message = {
  messageId: string;
  chatId: string;
  senderId: string;
  content: string | null;
  createdAt: Date;
};

type newMessageObj = {
  message: string;
  userId: string;
  chatId: string;
};

type joinRoomData = {
  roomId: string;
  userId: string;
};

function Chats() {
  const { chatId } = useParams();
  const [chatList, setChatList] = useState<ChatListItem[]>([]);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { socket, isConnected } = useSocket();
  const messageInputRef = useRef<HTMLInputElement>(null);
  const auth = useAuth();
  const [isMakeModalOfferOpen, setIsMakeModalOfferOpen] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  if (!auth.isAuthLoading && !auth.user) {
    <Navigate to="/login" replace />;
  }

  const formatTime = (value: string | Date) => {
    if (!value) return "N/A";

    const date = new Date(value);

    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const BASE_URL: string = import.meta.env.VITE_BASE_BACKEND_URL;

  useEffect(() => {
    if (!auth.isAuthLoading && auth.accessToken) {
      async function fetchChatList() {
        setIsLoading(true);
        const endPoint = `api/chats`;
        const url = new URL(endPoint, BASE_URL);
        try {
          const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
            },
          });
          const result = await response.json();
          setChatList(result.data.chatList);
        } catch (error) {
          console.log(error);
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      }
      fetchChatList();
    }
  }, [auth.user]);

  useEffect(() => {
    if (auth.isAuthLoading || !auth.user || !chatId) return;
    async function fetchChatData() {
      setIsLoading(true);
      const endPoint = `api/chats/${chatId}`;
      const url = new URL(endPoint, BASE_URL);
      try {
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });
        const result = await response.json();
        setChatData(result.data.chatData);
        setMessages(result.data.messages);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchChatData();

    if (isConnected && socket) {
      const joinRoomData: joinRoomData = {
        roomId: chatId,
        userId: auth.user.userId,
      };
      socket.emit("joinRoom", joinRoomData);
    }
  }, [chatId, auth.accessToken, auth.isAuthLoading, isConnected, socket]);

  function handleSendMessage(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (messageInputRef.current) {
      const message = messageInputRef.current.value;
      if (message.trim()) {
        const newMessageData: newMessageObj = {
          message,
          userId: auth.user!.userId,
          chatId: chatId!,
        };
        socket?.emit("newMessage", newMessageData);
        messageInputRef.current.value = "";
      }
    }
  }

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }
    const handleNewMessage = (newMessageObj: Message) => {
      setMessages((prev) => [...prev, newMessageObj]);
    };
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, isConnected]);

  async function handleMakeOffer(
    e: React.SubmitEvent<HTMLFormElement>,
    price: number,
  ) {
    e.preventDefault();
    setIsLoading(true);
    setPriceError(null);

    if (price === undefined || isNaN(price)) {
      setPriceError("Please enter a valid price");
      setIsLoading(false);
      return;
    }
    if (price <= 0) {
      setPriceError("Price must be greater than 0");
      setIsLoading(false);
      return;
    }

    const BASE_URL: string = import.meta.env.VITE_BASE_BACKEND_URL;
    const endPoint = `api/listings/${chatData?.listingId}/offer`;
    const url = new URL(endPoint, BASE_URL);

    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          listingId: chatData!.listingId,
          proposedBy: auth.user?.userId,
          price,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 400 || response.status === 422) {
          const message = errorData.message || "Invalid offer details";
          setPriceError(message);
          toast.error(message);
          return;
        }

        if (response.status === 409) {
          toast.error(
            errorData.message || "You already made an offer on this listing",
          );
          return;
        }

        if (response.status === 401) {
          toast.error("Your session expired. Please log in again.");
          return;
        }

        if (response.status >= 500) {
          toast.error("Server error. Please try again later.");
          return;
        }

        toast.error(errorData.message || "Failed to make offer");
        return;
      }

      const result = await response.json();
      toast.success(result.message || "Offer made successfully");
      console.log("Offer created:", result);
    } catch (err) {
      if (err instanceof TypeError) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setPriceError(null);
      setIsMakeModalOfferOpen(false);
      setIsLoading(false);
    }
  }

  if (isLoading) {
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ACFCF]"></div>
      <span className="ml-3 text-[#6F767E]">Loading conversation...</span>
    </div>;
  }

  return (
    <div className="flex h-full w-full bg-[#111111] overflow-hidden text-[#E5E5E5]">
      {/* Sidebar - Chat List */}
      <div className="w-80 border-r border-[#2A2A2A] flex flex-col bg-[#111111]">
        <div className="p-4 border-b border-[#2A2A2A]">
          <h1 className="text-xl font-bold mb-4">Messages</h1>
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6F767E]" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full bg-[#181818] border border-[#2A2A2A] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#414141] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {chatList.map((chatListItem) => (
            <Link
              to={`/chats/${chatListItem.chatId}`}
              key={chatListItem.chatId}
              className="flex items-center gap-4 p-4 hover:bg-[#1A1A1A] cursor-pointer transition-all border-b border-[#222] group"
            >
              <div className="relative shrink-0">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    chatListItem.seller.username !== auth.user?.username
                      ? chatListItem.seller.username
                      : chatListItem.buyer.username,
                  )}&background=4f46e5&color=fff&size=128`}
                  alt="Profile"
                  className="w-12 h-12 bg-[#2A2A2A] rounded-full object-cover border border-[#3A3A3A] group-hover:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                  <h3 className="font-bold text-[#F5F5F5] truncate text-[15px]">
                    {chatListItem.seller.username !== auth.user?.username
                      ? chatListItem.seller.username
                      : chatListItem.buyer.username}
                  </h3>

                  <div className="flex items-center gap-2 ">
                    <span className="text-sm text-[#8A8A8A] truncate max-w-37.5">
                      {chatListItem.listing.title}
                    </span>
                  </div>

                  <p className="text-xs text-[#555] truncate italic">
                    Click to view...
                  </p>
                </div>
              </div>

              <div className="shrink-0 ml-2">
                <div className="relative">
                  <img
                    src={`http://localhost:8080${chatListItem.listing.imageUrls[0]}`}
                    alt="thumbnail"
                    className="w-14 h-14 rounded-lg object-cover border border-[#333] group-hover:brightness-110 transition-all"
                  />
                  {/* Price tag overlay - looks very pro for marketplaces */}
                  <div className="absolute -bottom-1 -right-1 bg-[#1A1A1A] border border-[#333] rounded px-1">
                    <span className="text-[10px] font-bold text-white">
                      Rs. {chatListItem.listing.price || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Chat Window */}
      {chatId ? (
        <div className="flex-1 flex flex-col bg-[#0D0D0D]">
          {chatData ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between bg-[#111111]">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      chatData.seller.avatarUrl || chatData.seller.username,
                    )}&background=4f46e5&color=fff&size=128`}
                    alt="Profile"
                    className="w-12 h-12 bg-[#2A2A2A] rounded-full flex items-center justify-center font-semibold text-lg border border-[#3A3A3A]"
                  />
                  <div>
                    <Link
                      to={`/user/${chatData.seller.userId}`}
                      className="font-semibold cursor-pointer"
                    >
                      {chatData.seller.username !== auth.user?.username
                        ? chatData.seller.username
                        : chatData.buyer.username}
                    </Link>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-500 font-medium">
                        Online
                      </span>
                    </div>
                  </div>
                </div>
                {/* link*/}
                <Link
                  to={`/listings/${chatData.listingId}`}
                  title="View Listing"
                  className="flex items-center gap-3 px-2 py-1 rounded-lg border border-[#333] hover:border-[#2ACFCF] transition-colors duration-200 group"
                >
                  {/* Price and Title Info */}
                  <div className="flex flex-col items-end min-w-0">
                    <span className="text-[10px] text-[#8A8A8A]">
                      {chatData.listing.title}
                    </span>
                    <span className="text-[11px] font-bold text-[#2ACFCF] leading-tight">
                      Rs. {chatData.listing.price?.toLocaleString() || "N/A"}
                    </span>
                  </div>

                  {/* Product Image */}
                  <div className="shrink-0">
                    <img
                      src={`http://localhost:8080${chatData.listing.imageUrls[0]}`}
                      alt="listing thumbnail"
                      className="w-10 h-10 rounded-md object-cover border border-[#333] group-hover:border-[#2ACFCF]/50 transition-colors"
                    />
                  </div>
                </Link>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-end gap-4 custom-scrollbar">
                {messages.map((msg) => (
                  <div
                    key={msg.messageId}
                    className={`flex ${msg.senderId === auth.user?.userId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-3 px-4 text-sm shadow-sm ${
                        msg.senderId === auth.user?.userId
                          ? "bg-[#2ACFCF] text-[#111111] rounded-tr-none font-medium"
                          : "bg-[#2A2A2A] text-[#E5E5E5] rounded-tl-none border border-[#3A3A3A]"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span
                        className={`text-[10px] block mt-1.5 ${
                          msg.senderId === auth.user?.userId
                            ? "text-[#111111]/70"
                            : "text-[#6F767E]"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSendMessage}
                className="flex gap-3 p-4 bg-[#111111] border-t border-[#2A2A2A]"
              >
                <button
                  type="button"
                  title="Make offer"
                  className="p-2 bg-[#2ACFCF] hover:bg-[#26BABA] rounded-lg transition-all active:scale-95 group cursor-pointer"
                  onClick={() => setIsMakeModalOfferOpen(true)}
                >
                  <BanknotesIcon className="w-5 h-5 text-[#111111]" />
                </button>
                <input
                  type="text"
                  placeholder="Write a message..."
                  ref={messageInputRef}
                  className="w-full bg-[#181818] border border-[#2A2A2A] 
                  rounded-xl px-4 py-2.5 focus-within:border-[#414141] transition-all placeholder:text-[#6F767E] focus:outline-none"
                />

                <button
                  type="submit"
                  title="Send"
                  className="p-2 bg-[#2ACFCF] hover:bg-[#26BABA] rounded-lg transition-all active:scale-95 group cursor-pointer"
                >
                  <PaperAirplaneIcon className="w-5 h-5 text-[#111111]" />
                </button>
              </form>
              <MakeOfferModal
                isModalOpen={isMakeModalOfferOpen}
                setIsModalOpen={setIsMakeModalOfferOpen}
                onConfirm={handleMakeOffer}
                isLoading={isLoading}
                priceError={priceError}
                setPriceError={setPriceError}
              />
            </>
          ) : (
            /* Loading State */
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ACFCF]"></div>
              <span className="ml-3 text-[#6F767E]">
                Loading conversation...
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Empty State (No Chat Selected) */
        <div className="flex-1 flex flex-col bg-[#0D0D0D]">
          <div className="flex flex-col h-full w-full items-center justify-center gap-3">
            <ChatBubbleLeftRightIcon className="w-20 h-20 text-[#2A2A2A]" />
            <h3 className="text-4xl font-bold">Messages</h3>
            <p className="text-xl text-[#6F767E]">Your messages appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chats;
