import z from "zod";

const contactSellerSchema = z.object({
  listingId: z.string().uuid(),
});

export type contactSellerInput = z.infer<typeof contactSellerSchema>;

export { contactSellerSchema };
