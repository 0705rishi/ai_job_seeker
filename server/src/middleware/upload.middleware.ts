import multer from "multer";
import { Request } from "express";

// Memory storage to hold files in buffer before uploading/processing
const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "application/pdf",
    "text/plain",
    "application/x-tex",
    "text/x-tex",
  ];

  // Also accept .tex or .txt extension check as fallback
  const isAllowedExt =
    file.originalname.endsWith(".pdf") ||
    file.originalname.endsWith(".tex") ||
    file.originalname.endsWith(".txt");

  if (allowedMimeTypes.includes(file.mimetype) || isAllowedExt) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, TXT, and LaTeX (.tex) files are allowed."));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;
