import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { usersTable } from "../db/schema.js";
import { NotFoundError } from "../errors/index.js";
import { email } from "zod";

const getUserProfile = async (username: string, userId: string | undefined) => {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.username, username),
  });
  if (!user) {
    throw new NotFoundError("User with the given username doesn't exist");
  }
  const isUserOwner = user.userId === userId ? true : false;
  if (!isUserOwner || userId === undefined) {
    return {
      userId: user.userId,
      username,
      locationName: user.locationName,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  } else {
    return {
      userId: user.userId,
      username,
      locationName: user.locationName,
      latitude: user.latitude,
      longitude: user.longitude,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
};

export { getUserProfile };
