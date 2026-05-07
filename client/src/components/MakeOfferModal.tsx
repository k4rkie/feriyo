import { useRef } from "react";

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: (
    e: React.SubmitEvent<HTMLFormElement>,
    price: number,
  ) => Promise<void>;
  isLoading: boolean;
  priceError: string | null;
  setPriceError: React.Dispatch<React.SetStateAction<string | null>>;
};

function MakeOfferModal({
  isModalOpen,
  setIsModalOpen,
  onConfirm,
  isLoading,
  priceError,
  setPriceError,
}: Props) {
  const offerPriceRef = useRef<HTMLInputElement>(null);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-[#111111] border border-[#2A2A2A] rounded-xl shadow-2xl p-6 flex flex-col gap-3 animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-semibold text-white text-center">
          Make Offer
        </h2>
        <p className="text-[#A1A1A1] leading-relaxed">
          Enter the price you want to make an offer with:
        </p>
        <form
          onSubmit={(e) => onConfirm(e, offerPriceRef.current!.valueAsNumber)}
        >
          <input
            type="number"
            ref={offerPriceRef}
            placeholder="Enter the price"
            className="price-input w-full pl-4 pr-4 py-2 rounded-md 
            border border-[#2A2A2A] bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] appearance-none focus:outline-none focus:ring-0"
          />
          {priceError && <p className="text-red-500">{priceError}</p>}
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className={`flex-1 px-4 py-2.5 rounded-lg active:scale-[0.98] 
              transition-all duration-200 font-semibold
              ${isLoading ? "bg-[#2ACFCF] cursor-not-allowed text-[#0A0A0A]" : "bg-[#2ACFCF] text-[#0A0A0A] hover:bg-[#26BABA] cursor-pointer"}`}
              disabled={isLoading}
            >
              <span className="flex items-center justify-center">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#0A0A0A]"></div>
                ) : (
                  "Confirm"
                )}
              </span>
            </button>
            <button
              onClick={() => {
                setPriceError(null);
                setIsModalOpen(false);
              }}
              className={`flex-1 px-4 py-2.5 border rounded-lg bg-[#1A1A1A] 
            text-[#E5E5E5] border-[#2A2A2A] hover:bg-[#222222] hover:border-[#3A3A3A] active:scale-[0.98]
            transition-all duration-200 font-medium ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MakeOfferModal;
