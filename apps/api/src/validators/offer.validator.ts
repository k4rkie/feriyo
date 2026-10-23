import { z } from "zod";

const updateOfferStatusSchema = z.object({
  status: z.enum(["accepted", "rejected", "cancelled"]),
});

export { updateOfferStatusSchema };
