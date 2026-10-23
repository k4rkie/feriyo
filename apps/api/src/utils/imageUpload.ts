import multer from "multer";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const createImageUpload = () =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
  });
