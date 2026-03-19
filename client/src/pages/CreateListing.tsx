import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  createListingSchema,
  type createListingInput,
} from "../validators/listings.validator.ts";
import { useRef, useState } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

function CreateListing() {
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createListingSchema),
  });

  const auth = useAuth();
  const navigate = useNavigate();

  if (!auth.isAuthLoading && !auth.user) {
    return <Navigate to="/login" replace />;
  }

  const handleFormSubmit: SubmitHandler<createListingInput> = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", String(data.price));
    formData.append("location", data.location);
    formData.append("category", data.category);
    formData.append("condition", data.condition);
    for (let image of data.listingImages) {
      formData.append("listingImages", image);
    }
    try {
      const response = await fetch("http://localhost:8080/api/listings", {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error) {
          Object.entries(result.error).forEach(([fieldName, messages]) => {
            setError(fieldName as keyof createListingInput, {
              message: (messages as string[])[0],
            });
          });
        } else {
          setError("root", {
            message: result.message || "An error occured",
          });
        }
        return;
      }
      toast.success("New Listing Created");
      navigate("/listings");
    } catch (error) {
      toast.error("Something went worng");
      setError("root", { message: "Something went wrong" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#E5E5E5]">
        Create Listing
      </h2>
      <form
        className="grid grid-cols-2 gap-6"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium mb-1  text-[#E5E5E5]"
            >
              Title
            </label>
            <input
              {...register("title")}
              type="text"
              id="title"
              placeholder="Enter title"
              className="w-full px-4 py-2 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] focus:outline-none focus:ring-0"
            />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
          </div>
          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1 text-[#E5E5E5]"
            >
              Description
            </label>
            <textarea
              {...register("description")}
              id="description"
              placeholder="Enter description"
              className="w-full h-40 px-4 py-2 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] resize-none focus:outline-none focus:ring-0"
              rows={4}
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>
          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium mb-1 text-[#E5E5E5]"
            >
              Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#A1A1A1]">
                NRP
              </span>
              <input
                {...register("price", { valueAsNumber: true })}
                type="number"
                id="price"
                placeholder="Enter price"
                className="w-full pl-12 pr-4 py-2 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] appearance-none focus:outline-none focus:ring-0"
              />

              {errors.price && (
                <p className="text-red-500">{errors.price.message}</p>
              )}
            </div>
          </div>
          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium mb-1 text-[#E5E5E5]"
            >
              Location
            </label>
            <input
              {...register("location")}
              type="text"
              id="location"
              placeholder="Enter Location"
              className="w-full px-4 py-2 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] focus:outline-none focus:ring-0"
            />

            {errors.location && (
              <p className="text-red-500">{errors.location.message}</p>
            )}
          </div>
          {/* Caetgory */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium mb-1 text-[#E5E5E5]"
            >
              Category
            </label>
            <select
              {...register("category")}
              id="category"
              defaultValue="Others"
              className="w-full px-4 py-2 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] appearance-none focus:outline-none focus:ring-0"
            >
              <option value="electronics">Electronics</option>
              <option value="education">Education</option>
              <option value="fashion">Fashion</option>
              <option value="furniture">Furniture</option>
              <option value="others">Others...</option>
            </select>

            {errors.category && (
              <p className="text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="condition"
              className="block text-sm font-medium mb-1 text-[#E5E5E5]"
            >
              Condition
            </label>
            <select
              {...register("condition")}
              id="condition"
              defaultValue="New"
              className="w-full px-4 py-2 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] appearance-none focus:outline-none focus:ring-0"
            >
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="old">Old</option>
            </select>
          </div>

          {errors.condition && (
            <p className="text-red-500">{errors.condition.message}</p>
          )}
        </div>

        {/*Images*/}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2 text-[#E5E5E5]">
            Images
          </label>
          <input
            className="hidden"
            multiple
            type="file"
            id="listingImages"
            ref={imageInputRef}
            accept="image/png, image/jpeg, image/webp"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              setValue("listingImages", files, { shouldValidate: true });
              const previewUrls = files.map((file) =>
                URL.createObjectURL(file),
              );
              setImagePreviewUrls(previewUrls);
            }}
          />
          <button
            className="w-full h-full border-2 border-[#2A2A2A] rounded-md border-dotted text-[#E5E5E5] cursor-pointer"
            type="button"
            onClick={() => imageInputRef.current?.click()}
          >
            <span className="flex flex-col justify-center items-center text-[#A1A1A1] hover:text-[#E5E5E5] h-full w-full">
              <ArrowUpTrayIcon className="w-20 h-20" />
              Click here to upload images
            </span>
          </button>

          {imagePreviewUrls.length !== 0 && imagePreviewUrls.length <= 5 ? (
            <div className="flex gap-3 flex-wrap w-full mt-4 border-2 border-[#2A2A2A] rounded-md border-dotted p-2">
              {imagePreviewUrls.map((imgUrl) => (
                <div
                  key={imgUrl}
                  className="relative w-24 h-24 rounded-md overflow-hidden border border-[#2A2A2A]"
                >
                  <img
                    src={imgUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white text-xs font-bold opacity-0 transition-opacity duration-200 hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {errors.listingImages && (
            <p className="text-red-500">{errors.listingImages.message}</p>
          )}
        </div>

        <div className="col-span-2 mt-4 flex gap-4">
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-md bg-[#2ACFCF] text-[#111111] hover:bg-[#26BABA] transition-colors duration-300 cursor-pointer"
            disabled={isSubmitting}
          >
            Create
          </button>
          <button className="w-full px-4 py-2 border rounded-md bg-[#1A1A1A] text-[#E5E5E5] border-[#E5E5E5] hover:border-[#A1A1A1] hover:text-[#A1A1A1]  transition-colors duration-300 cursor-pointer">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateListing;
