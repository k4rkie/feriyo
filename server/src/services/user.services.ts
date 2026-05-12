import { eq, sql } from "drizzle-orm";
import { db } from "../db/db.js";
import { usersTable } from "../db/schema.js";
import { NotFoundError } from "../errors/index.js";
import type { editProfileInput } from "../validators/user.validator.js";

const getUserProfile = async (username: string, userId: string | undefined) => {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.username, username),
    with: {
      listings: true,
    },
  });
  if (!user) {
    throw new NotFoundError("User with the given username doesn't exist");
  }
  const isUserOwner = user.userId === userId ? true : false;
  if (!isUserOwner || userId === undefined) {
    return {
      userProfileData: {
        userId: user.userId,
        username,
        locationName: user.locationName,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
      userListings: user.listings,
    };
  } else {
    return {
      userProfileData: {
        userId: user.userId,
        username,
        locationName: user.locationName,
        latitude: user.latitude,
        longitude: user.longitude,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
      userListings: user.listings,
    };
  }
};

const editProfile = async (
  editProfileData: editProfileInput,
  userId: string,
) => {
  const { username, locationName, avatar } = editProfileData;

  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.userId, userId))
    .limit(1);

  if (!existingUser) {
    throw new NotFoundError("User not found");
  }

  let avatarUrl = existingUser.avatarUrl;
  if (avatar) {
    avatarUrl = `/uploads/images/useravatars/${avatar.filename}`;
  }

  const [updatedUser] = await db
    .update(usersTable)
    .set({
      username,
      locationName,
      avatarUrl,
    })
    .where(eq(usersTable.userId, userId))
    .returning({
      userId: usersTable.userId,
      username: usersTable.username,
      email: usersTable.email,
      locationName: usersTable.locationName,
      avatarUrl: usersTable.avatarUrl,
    });

  return updatedUser;
};

export { getUserProfile, editProfile };
