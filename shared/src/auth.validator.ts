import { z } from "zod";

const signUpUserSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters long")
      .max(30, "Username too long"),
    email: z.string().trim().email("Please enter a valid email").toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      return data.confirmPassword === data.password;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    },
  );

export type signupDataInput = z.infer<typeof signUpUserSchema>;

const loginUserSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email")
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type loginDataInput = z.infer<typeof loginUserSchema>;

export { signUpUserSchema, loginUserSchema };
