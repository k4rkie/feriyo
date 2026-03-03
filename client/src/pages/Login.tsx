import { loginUserSchema, type loginDataInput } from "@feriyo/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<loginDataInput>({ resolver: zodResolver(loginUserSchema) });

  const auth = useAuth();

  const navigate = useNavigate();

  const handleLogin: SubmitHandler<loginDataInput> = async (data) => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error) {
          const [errMsg] = result.error.root;
          setError("root", { message: errMsg });
        } else {
          setError("root", {
            message: result.message || "An error occured",
          });
        }
        return;
      }
      auth.login(result.data.user, result.data.accessToken);
      navigate("/listings");
      toast.success("Logged in successfully");
    } catch (error) {
      setError("root", { message: "Something went wrong" });
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-[#E5E5E5] mb-6 text-center">
            Log In
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit(handleLogin)}>
            <input
              {...register("email")}
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 rounded-md bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] focus:outline-none focus:ring-2 focus:ring-[#2ACFCF] focus:border-[#2ACFCF]"
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}

            <input
              {...register("password")}
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 rounded-md bg-[#1A1A1A] text-[#E5E5E5] placeholder:text-[#A1A1A1] focus:outline-none focus:ring-2 focus:ring-[#2ACFCF] focus:border-[#2ACFCF]"
            />
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}

            {errors.root && (
              <p className="text-red-500">{errors.root.message}</p>
            )}
            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-[#2ACFCF] text-[#111111] px-4 py-2 rounded hover:bg-[#26BABA] transition-colors duration-300 cursor-pointer"
            >
              Log In
            </button>
          </form>
          <p className="text-center mt-4 text-[#A1A1A1]">
            Don't have an account?{" "}
            <a href="/signup" className="text-[#2ACFCF] hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
