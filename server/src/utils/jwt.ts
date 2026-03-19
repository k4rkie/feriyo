import "dotenv/config";
import jwt from "jsonwebtoken";

const generateAccessToken = (userId: number) => {
  const accessToken = jwt.sign(
    { sub: String(userId) },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "1h" },
  );
  return accessToken;
};

const generateRefreshToken = (userId: number) => {
  const refreshToken = jwt.sign(
    { sub: String(userId) },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: "30d" },
  );
  return refreshToken;
};

export { generateAccessToken, generateRefreshToken };
