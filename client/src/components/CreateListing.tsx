import React, { useEffect, useState } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

interface CreateListingProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateListing({ isOpen, onClose }: CreateListingProps) {
  if (!isOpen) return null;
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleImageClick = () => {
    const input = document.getElementById("images") as HTMLInputElement;
    input?.click();
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setPreviewUrls([]);
      return;
    }

    // create object URLs for previews
    const urls: string[] = Array.from(files).map((f) => URL.createObjectURL(f));
    // revoke previous urls to avoid memory leaks handled in effect
    setPreviewUrls(urls);
  };

  useEffect(() => {
    return () => {
      // cleanup on unmount
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewUrls]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-4xl px-6 py-6 rounded-md bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1]">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create a Listing
        </h2>
        <form className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                placeholder="Enter title"
                required
                className="w-full px-4 py-2 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] focus:outline-none focus:ring-0"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                placeholder="Enter description"
                className="w-full h-40 px-4 py-2 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] resize-none focus:outline-none focus:ring-0"
                rows={4}
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#A1A1A1]">
                  NRP
                </span>
                <input
                  type="number"
                  id="price"
                  placeholder="Enter price"
                  min={0}
                  className="w-full pl-12 pr-4 py-2 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] appearance-none focus:outline-none focus:ring-0"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium mb-1"
              >
                Category
              </label>
              <select
                id="category"
                defaultValue="Others"
                className="w-full px-4 py-2 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] appearance-none focus:outline-none focus:ring-0"
              >
                <option>Electronics</option>
                <option>Education</option>
                <option>Fashion</option>
                <option>Furniture</option>
                <option>Others</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-2">Images</label>
            <input
              type="file"
              id="images"
              multiple
              className="hidden"
              onChange={handleFilesChange}
            />
            <div
              onClick={handleImageClick}
              className="flex-1 border-2 border-dashed border-[#2A2A2A] rounded-md bg-[#222222] hover:bg-[#2A2A2A] transition-colors duration-300 flex items-center justify-center cursor-pointer min-h-75 overflow-hidden"
            >
              {previewUrls.length > 0 ? (
                <div className="w-full h-full flex flex-wrap items-start gap-2 p-2">
                  {previewUrls.map((url, idx) => (
                    <img
                      key={url}
                      src={url}
                      alt={`preview-${idx}`}
                      className={`object-cover rounded-md ${previewUrls.length === 1 ? "w-full h-full" : "w-1/2 h-40"}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <ArrowUpTrayIcon className="w-10 h-10 mx-auto text-[#2ACFCF]" />
                  <p className="text-lg font-medium text-[#E5E5E5]">
                    Browse images
                  </p>
                  <p className="text-sm text-[#A1A1A1] mt-2">
                    Click to select files
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-2 flex gap-4 mt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-md bg-[#2ACFCF] text-[#111111] hover:bg-[#26BABA] transition-colors duration-300 cursor-pointer"
            >
              Create
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-md bg-[#2A2A2A] text-[#E5E5E5] hover:bg-[#333333] transition-colors duration-300 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateListing;
