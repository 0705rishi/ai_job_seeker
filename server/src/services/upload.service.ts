import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import env from "../config/env";

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured =
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export const uploadResumeFile = async (
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<string> => {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "resumes",
          resource_type: "auto",
          public_id: path.parse(originalName).name + "_" + Date.now(),
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary upload error:", error);
            reject(new Error("Failed to upload file to cloud storage."));
          } else {
            resolve(result?.secure_url || "");
          }
        }
      );
      uploadStream.end(fileBuffer);
    });
  } else {
    // Local workspace storage fallback
    // Note: Working directory must be in workspace.
    const uploadDir = path.join(__dirname, "../../../uploads/resumes");
    fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `${Date.now()}_${originalName.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, fileBuffer);
    console.log(`📁 File saved locally: ${filePath}`);

    // Return the local serving URL path (e.g. /uploads/resumes/filename)
    return `/uploads/resumes/${fileName}`;
  }
};
