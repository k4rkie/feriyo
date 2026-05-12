import { z } from "zod";

const MAX_FILE_SIZE = 5_242_880;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const editProfileSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  locationName: z.string().min(1, "Please enter your location").nullable(),
  avatar: z
    .any()
    .refine((file) => {
      if (!file) return true;
      return file.size <= MAX_FILE_SIZE;
    }, "Max image size is 5MB")
    .refine((file) => {
      if (!file) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, "Only .jpg, .png, .webp allowed")
    .nullable()
    .optional(),
});

export type editProfileInput = z.infer<typeof editProfileSchema>;

export { editProfileSchema };
