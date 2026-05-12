import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  editProfileSchema,
  type editProfileInput,
} from "../validators/user.validator.ts";
import toast from "react-hot-toast";

function EditProfile() {
  const navigate = useNavigate();
  const auth = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<editProfileInput>({
    resolver: zodResolver(editProfileSchema),
    mode: "onSubmit",
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    async function getProfileData() {
      if (!auth.user?.username) return;
      try {
        const response = await fetch(
          `http://localhost:8080/api/users/${auth.user.username}`,
          {
            method: "GET",
          },
        );
        const result = await response.json();
        if (!response.ok) {
          return console.error(result.error);
        }
        const profile = result.data.userProfileData;
        setValue("username", profile.username);
        setValue("locationName", profile.locationName);
        if (profile.avatarUrl) {
          setPreviewUrl(`http://localhost:8080${profile.avatarUrl}`);
        }
      } catch (error) {
        toast.error("Something went wrong while fetching profile");
      }
    }
    getProfileData();
  }, [auth.user?.username, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setValue("avatar", file, { shouldValidate: true });
    }
  };

  const handleFormSubmit: SubmitHandler<editProfileInput> = async (data) => {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("locationName", data.locationName || "");
    if (data.avatar) {
      formData.append("avatar", data.avatar);
    }

    try {
      const response = await fetch(`http://localhost:8080/api/users/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error) {
          Object.entries(result.error).forEach(([fieldName, messages]) => {
            setError(fieldName as keyof editProfileInput, {
              message: (messages as string[])[0],
            });
          });
        } else {
          toast.error(result.message || "An error occurred");
        }
        return;
      }

      toast.success(result.message);
      // Update local auth state to reflect changes globally (like in Navbar)
      auth.updateUser(result.data);
      navigate(`/users/${result.data.username}`);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  // Simple placeholder if no image is uploaded
  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    auth.user?.username || "User",
  )}&background=4f46e5&color=fff&size=128`;

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl text-center font-bold text-[#E5E5E5] mb-8">
        Edit Profile
      </h1>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6 bg-[#111111] p-6 rounded-lg border border-[#2A2A2A]"
      >
        <div className="flex flex-col items-center gap-4">
          <img
            src={previewUrl || defaultAvatarUrl}
            alt="Profile"
            className="h-24 w-24 rounded-full border-2 border-[#2ACFCF] object-cover"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-[#2ACFCF] hover:underline"
          >
            Change Image
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
          {errors.avatar && (
            <p className="text-red-500 text-xs">{errors.avatar.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#A1A1AA] mb-1">
            Username
          </label>
          <input
            {...register("username")}
            type="text"
            className="w-full px-4 py-2 rounded-md bg-[#1A1A1A] border border-[#2A2A2A] text-[#E5E5E5] focus:outline-none focus:border-[#2ACFCF]"
            placeholder="Username"
          />
          {errors.username && (
            <p className="text-red-500 text-xs mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#A1A1AA] mb-1">
            Location
          </label>
          <input
            {...register("locationName")}
            type="text"
            className="w-full px-4 py-2 rounded-md bg-[#1A1A1A] border border-[#2A2A2A] text-[#E5E5E5] focus:outline-none focus:border-[#2ACFCF]"
            placeholder="City, Country"
          />
          {errors.locationName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.locationName.message}
            </p>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-[#2ACFCF] text-[#111111] py-2 rounded-md font-bold hover:bg-[#26BABA] transition disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 border border-[#2A2A2A] text-[#E5E5E5] py-2 rounded-md hover:bg-[#2A2A2A] transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
