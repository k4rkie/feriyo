import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  editListingSchema,
  type editListingInput,
} from "../validators/listings.validator.ts";
import { useEffect, useRef, useState } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/imageUrl";

type previewImage = {
  id: string;
  file?: File;
  imgUrl: string;
  isExisting: boolean;
};

function EditListing() {
  const { listingId } = useParams();
  const [previewImages, setPreviewImages] = useState<previewImage[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(editListingSchema),
    mode: "onSubmit",
    defaultValues: {
      isSold: false,
    },
  });

  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setValue(
      "newListingImages",
      previewImages.filter((img) => !img.isExisting).map((img) => img.file!),
      { shouldValidate: false },
    );
  }, [previewImages, setValue]);

  useEffect(() => {
    setValue("removedListingImages", removedImages, { shouldValidate: false });
  }, [removedImages, setValue]);

  useEffect(() => {
    async function getEditFormData() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_BACKEND_URL}/api/listings/${listingId}`,
          {
            method: "GET",
          },
        );
        const result = await response.json();
        if (!response.ok) {
          return toast.error(result.message || "Failed to load listing");
        }
        setValue("title", result.data.title);
        setValue("description", result.data.description);
        setValue("price", result.data.price);
        setValue("locationName", result.data.locationName);
        setValue("category", result.data.category);
        setValue("condition", result.data.condition);
        setValue("isSold", result.data.status === "sold" ? true : false);

        const existingImagesPreview: previewImage[] = result.data.imageUrls.map(
          (imgUrl: string) => {
            return {
              id: crypto.randomUUID(),
              imgUrl: imgUrl,
              isExisting: true,
            };
          },
        );
        setPreviewImages(existingImagesPreview);
      } catch {
        toast.error("Something went wrong");
      }
    }
    getEditFormData();
  }, [listingId, setValue]);

  const handleFormSubmit: SubmitHandler<editListingInput> = async (data) => {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", String(data.price));
    formData.append("locationName", data.locationName);
    formData.append("category", data.category);
    formData.append("condition", data.condition);
    formData.append("isSold", String(data.isSold));

    for (const image of data.newListingImages) {
      formData.append("newListingImages", image);
    }

    for (const url of data.removedListingImages) {
      formData.append("removedListingImages", url);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_BACKEND_URL}/api/listings/${listingId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        if (result.error) {
          Object.entries(result.error).forEach(([fieldName, messages]) => {
            setError(fieldName as keyof editListingInput, {
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
      toast.success(result.message);
      navigate(`/listings/${listingId}`);
    } catch {
      toast.error("Something went wrong");
      setError("root", { message: "Something went wrong" });
    }
  };

  if (!auth.isAuthLoading && !auth.user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#E5E5E5]">
        Edit Listing
      </h2>
      <form
        className="flex flex-col gap-6"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <div className="grid grid-cols-2 gap-6">
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
                Price (NRP)
              </label>
              <div className="relative">
                <input
                  {...register("price", { valueAsNumber: true })}
                  type="number"
                  id="price"
                  placeholder="Enter price"
                  className="price-input w-full pl-4 pr-4 py-2 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] appearance-none focus:outline-none focus:ring-0"
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
                {...register("locationName")}
                type="text"
                id="location"
                placeholder="Enter Location"
                className="w-full px-4 py-2 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] focus:outline-none focus:ring-0"
              />

              {errors.locationName && (
                <p className="text-red-500">{errors.locationName.message}</p>
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
                <option value="vehicle">Vehicle</option>
                <option value="others">Others...</option>
              </select>

              {errors.category && (
                <p className="text-red-500">{errors.category.message}</p>
              )}
            </div>

            {/*Condition*/}
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
          <div className="flex flex-col h-full">
            <label className="block text-sm font-medium mb-2 text-[#E5E5E5]">
              Images
            </label>
            <input
              className="hidden"
              multiple
              type="file"
              id="newListingImages"
              ref={imageInputRef}
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                let images: previewImage[] = [];
                images = files.map((file) => {
                  return {
                    id: crypto.randomUUID(),
                    file: file,
                    imgUrl: URL.createObjectURL(file),
                    isExisting: false,
                  };
                });
                setPreviewImages((prev) => [...prev, ...images]);
              }}
            />
            <button
              className="w-full h-full border-2 border-[#2A2A2A] hover:border-[#a1a1a1] rounded-md border-dotted text-[#E5E5E5] cursor-pointer"
              type="button"
              onClick={() => imageInputRef.current?.click()}
            >
              <span className="flex flex-col justify-center items-center text-[#A1A1A1] hover:text-[#E5E5E5] h-full w-full">
                <ArrowUpTrayIcon className="w-20 h-20" />
                Click here to upload images
              </span>
            </button>

            {previewImages.length !== 0 ? (
              <div className="flex justify-center gap-3 w-full mt-4 border-2 border-[#2A2A2A] rounded-md border-dotted p-2">
                {previewImages.map((previewImage) => (
                  <div
                    key={previewImage.id}
                    className="relative w-20 h-20 rounded-md overflow-hidden border border-[#2A2A2A]"
                  >
                    <img
                      src={
                        previewImage.isExisting
                          ? getImageUrl(previewImage.imgUrl)
                          : previewImage.imgUrl
                      }
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (previewImage.isExisting) {
                          setRemovedImages((prev) => [
                            ...prev,
                            previewImage.imgUrl,
                          ]);
                        }
                        setPreviewImages((prevImages) =>
                          prevImages.filter(
                            (image) => image.id !== previewImage.id,
                          ),
                        );
                      }}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white text-xs font-bold opacity-0 transition-opacity duration-200 hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {errors.newListingImages && (
              <p className="text-red-500">{errors.newListingImages.message}</p>
            )}
          </div>
        </div>

        {/*IsSold*/}
        <div className="flex items-center self-start">
          <input
            {...register("isSold")}
            type="checkbox"
            id="isSold"
            className="mr-2"
          />
          <label
            htmlFor="isSold"
            className="text-sm font-medium text-[#E5E5E5]"
          >
            Sold
          </label>

          {errors.isSold && (
            <p className="text-red-500">{errors.isSold.message}</p>
          )}
        </div>

        <div className="mt-4 flex gap-4">
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-md bg-[#2ACFCF] text-[#111111] hover:bg-[#26BABA] transition-colors duration-300 cursor-pointer"
            disabled={isSubmitting}
          >
            Save
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 border rounded-md bg-[#1A1A1A] text-[#E5E5E5] border-[#E5E5E5] hover:border-[#A1A1A1] hover:text-[#A1A1A1]  transition-colors duration-300 cursor-pointer"
            onClick={() => {
              navigate(`/listings/${listingId}`);
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditListing;
