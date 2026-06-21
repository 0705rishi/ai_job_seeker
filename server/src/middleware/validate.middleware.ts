import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.safeParseAsync(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            message: "Validation failed",
            details: parsed.error.format(),
          },
        });
        return;
      }
      req.body = parsed.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validate;
