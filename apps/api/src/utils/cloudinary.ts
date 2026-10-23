import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ secure: true });

export const uploadImage = async (buffer: Buffer, folder: string) => {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error("CLOUDINARY_URL is not configured");
  }

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Image upload failed"));
          return;
        }
        resolve(result.secure_url);
      },
    );

    uploadStream.end(buffer);
  });
};
