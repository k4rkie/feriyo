import { z } from "zod";

const MAX_FILE_SIZE = 5_242_880;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const listingCategories = [
  "electronics",
  "education",
  "fashion",
  "furniture",
  "vehicle",
  "others",
] as const;

const getListingsQuerySchema = z.object({
  category: z.enum(listingCategories).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

const createListingSchema = z.object({
  title: z.string().trim().min(1, "Please enter the title"),
  description: z.string().max(1024, "Description too long"),
  price: z.coerce
    .number("Price must be a number")
    .int("Price must be a whole number")
    .min(1, "Please enter a price"),
  category: z.enum(listingCategories),
  condition: z.enum(["new", "good", "fair", "old"]),
  locationName: z.string().trim().min(1, "Please enter the location"),
  listingImages: z
    .array(
      z.object({
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
        buffer: z.instanceof(Buffer),
      }),
    )
    .min(1, "At least one image required")
    .max(5, "Maximum 5 images allowed"),
});

const editListingSchema = z.object({
  title: z.string().trim().min(1, "Please enter the title"),
  description: z.string().max(1024, "Description too long"),
  price: z.coerce
    .number("Price must be a number")
    .min(1, "Please enter a price"),
  category: z.enum(
    ["electronics", "education", "fashion", "furniture", "vehicle", "others"],
    "Invalid option",
  ),
  condition: z.enum(["new", "good", "fair", "old"], "Invalid option"),
  locationName: z.string().min(1, "Please enter the location"),
  isSold: z.boolean("Value must be a boolean"),
  newListingImages: z
    .array(
      z.object({
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
        buffer: z.instanceof(Buffer),
      }),
    )
    .max(5, "Maximum 5 images allowed")
    .default([]),
  removedListingImages: z.array(z.string()).default([]),
});

const makeOfferSchema = z.object({
  chatId: z.string().uuid("Invalid chat id"),
  price: z.coerce
    .number("Price must be a number")
    .int("Price must be a whole number")
    .positive("Price must be greater than 0"),
});

export type createListingInput = z.infer<typeof createListingSchema>;
export type editListingInput = z.infer<typeof editListingSchema>;
export type makeOfferDetail = z.infer<typeof makeOfferSchema>;
export type getListingsQuery = z.infer<typeof getListingsQuerySchema>;

export {
  createListingSchema,
  editListingSchema,
  makeOfferSchema,
  getListingsQuerySchema,
};
