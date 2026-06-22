import dotenv from "dotenv";
import { z } from "zod";
import dns from "dns";

// Configure reliable DNS servers to bypass local DNS resolution timeouts/SRV query errors (e.g. ECONNREFUSED querySrv)
try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (e) {
  console.warn("⚠️ Custom DNS servers config failed:", e);
}

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/ai-job-seeker"),
  JWT_SECRET: z.string().default("development_secret_key_1234567890"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  GROQ_API_KEY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Environment validation error:", result.error.format());
    process.exit(1);
  }
  
  const env = result.data;
  
  // Log warnings for missing credentials
  if (!env.GROQ_API_KEY) {
    console.warn("⚠️ Warning: GROQ_API_KEY is not set. AI features will use mock fallbacks.");
  }
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    console.warn("⚠️ Warning: Cloudinary configuration is missing. Resume uploads will fallback to local storage.");
  }
  
  return env;
};

export const env = parseEnv();
export default env;
