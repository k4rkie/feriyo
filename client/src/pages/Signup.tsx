import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { signUpUserSchema, type signupDataInput } from "@feriyo/shared";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<signupDataInput>({ resolver: zodResolver(signUpUserSchema) });
  const navigate = useNavigate();

  const auth = useAuth();

  const handleFormSubmit: SubmitHandler<signupDataInput> = async (data) => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error) {
          Object.entries(result.error).forEach(([fieldName, messages]) => {
            setError(fieldName as keyof signupDataInput, {
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
      auth.login(result.data.user, result.data.accessToken);
      navigate("/listings");
    } catch (error) {
      setError("root", { message: "Something went wrong" });
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-[#E5E5E5] mb-6 text-center">
            Sign Up
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
            <div>
              <input
                {...register("username")}
                id="username"
                name="username"
                type="text"
                placeholder="Username"
                className="w-full px-4 py-2 rounded-md  bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1]  focus:outline-none focus:ring-2 focus:ring-[#2ACFCF] focus:border-[#2ACFCF] border-[#2A2A2A]"
              />
              {errors.username && (
                <p className="text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div>
              <input
                {...register("email")}
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 rounded-md bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] focus:outline-none focus:ring-2 focus:ring-[#2ACFCF] focus:border-[#2ACFCF]"
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <input
                {...register("password")}
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 rounded-md bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] focus:outline-none focus:ring-2 focus:ring-[#2ACFCF] focus:border-[#2ACFCF]"
              />
              {errors.password && (
                <p className="text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <input
                {...register("confirmPassword")}
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                className="w-full px-4 py-2 rounded-md bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] focus:outline-none focus:ring-2 focus:ring-[#2ACFCF] focus:border-[#2ACFCF]"
              />
              {errors.confirmPassword && (
                <p className="text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-[#2ACFCF] text-[#111111] px-4 py-2 rounded hover:bg-[#26BABA] transition-colors duration-300 cursor-pointer"
              disabled={isSubmitting}
            >
              Sign Up
            </button>
          </form>
          <p className="text-center mt-4 text-[#A1A1A1]">
            Already have an account?{" "}
            <a href="/login" className="text-[#2ACFCF] hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

export default Signup;
