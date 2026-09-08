import { z } from "zod";

export const inquirySchema = z.object({
  buyerName: z.string().min(2, "Name must be at least 2 characters"),
  buyerEmail: z.string().email("Please provide a valid business email address"),
  buyerCompany: z.string().min(2, "Company name is required"),
  buyerCountry: z.string().min(2, "Country is required"),
  orderQuantityTarget: z.number().min(1, "Order quantity target must be at least 1"),
  message: z.string().min(10, "Please provide detailed specifications (minimum 10 characters)"),
  enterpriseId: z.string().optional().nullable(),
  productId: z.string().optional().nullable(),
  honeypot: z.string().optional().nullable(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
