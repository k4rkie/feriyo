import { z } from "zod";

const MAX_FILE_SIZE = 5_242_880;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const createListingSchema = z.object({
  title: z.string().trim().min(1, "Please enter the title"),
  description: z.string().max(1024, "Description too long"),
  price: z.coerce.number("Price must be a number"),
  category: z.enum([
    "electronics",
    "education",
    "fashion",
    "furniture",
    "vehicle",
    "others",
  ]),
  condition: z.enum(["new", "good", "fair", "old"]),
  location: z.string().min(1, "Please enter the location"),
  listingImages: z
    .array(
      z.object({
        filename: z.string(),
        originalname: z.string(),
        mimetype: z
          .string()
          .refine(
            (type) => ACCEPTED_IMAGE_TYPES.includes(type),
            "Only .jpg, .png, .webp allowed",
          ),
        size: z
          .number()
          .refine((size) => size <= MAX_FILE_SIZE, "Max image size is 5MB"),
        path: z.string(),
      }),
    )
    .min(1, "At least one image required")
    .max(5, "Maximum 5 images allowed"),
});

export type createListingInput = z.infer<typeof createListingSchema>;

export { createListingSchema };
