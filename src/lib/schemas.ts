/**
 * src/lib/schemas.ts
 *
 * Central Zod schema registry for all public and authenticated payloads.
 * Import 'server-only' is intentionally NOT added here because these schemas
 * are shared between client-side form validation (type inference) and server
 * actions. The schemas themselves contain no secrets.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** CUID / UUID style ID — prevents injection via ID fields */
const idSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid ID format");

const emailSchema = z
  .string()
  .email("Must be a valid email address")
  .max(100, "Email must be at most 100 characters")
  .transform((v) => v.toLowerCase().trim());

const phoneSchema = z
  .string()
  .min(7, "Phone number too short")
  .max(30, "Phone number too long")
  .regex(/^[+\d\s\-(). ext]+$/i, "Invalid phone number format");

// ---------------------------------------------------------------------------
// §1 — RFQ Submission (public, unauthenticated)
// ---------------------------------------------------------------------------

export const RFQItemSchema = z.object({
  enterpriseId: idSchema,
  enterpriseName: z.string().min(1).max(200).trim(),
  productId: z.string().max(128).optional(),
  productTitle: z.string().max(300).trim().optional(),
  requestedQuantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be positive")
    .max(1_000_000, "Quantity cannot exceed 1,000,000 pcs"),
  customSpecifications: z
    .string()
    .max(2000, "Specifications must be at most 2,000 characters")
    .trim()
    .optional(),
});

export const rfqSubmissionSchema = z.object({
  buyerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name must be at most 150 characters")
    .trim(),
  buyerEmail: emailSchema,
  buyerCompany: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must be at most 200 characters")
    .trim(),
  buyerCountry: z
    .string()
    .min(2, "Country is required")
    .max(100)
    .trim(),
  targetFobPort: z.string().max(200).trim().optional(),
  targetDeliveryDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Invalid delivery date format"
    ),
  generalMessage: z
    .string()
    .max(5000, "Message must be at most 5,000 characters")
    .trim()
    .optional()
    .default(""),
  honeypot: z.string().max(0, "Bot detected").optional().default(""),
  turnstileToken: z.string().optional(),
  items: z
    .array(RFQItemSchema)
    .min(1, "At least one factory or product is required")
    .max(20, "Maximum 20 line items per RFQ"),
});

export type RFQSubmissionInput = z.infer<typeof rfqSubmissionSchema>;

// ---------------------------------------------------------------------------
// §2 — Factory Application (public self-registration)
// ---------------------------------------------------------------------------

export const factoryApplicationSchema = z.object({
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(200)
    .trim(),
  panNumber: z
    .string()
    .min(6, "PAN number must be at least 6 characters")
    .max(20)
    .trim()
    .toUpperCase(),
  registrationNumber: z
    .string()
    .min(3)
    .max(50)
    .trim(),
  address: z.string().min(5).max(300).trim(),
  city: z.string().min(2).max(100).trim(),
  monthlyCapacityPcs: z
    .number()
    .int()
    .positive()
    .max(10_000_000),
  employeeCount: z
    .number()
    .int()
    .positive()
    .max(100_000),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(3000)
    .trim(),
  yearEstablished: z
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear())
    .optional(),
  exportMarkets: z.string().max(300).trim(),
  contactName: z.string().min(2).max(150).trim(),
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  honeypot: z.string().max(0, "Bot detected").optional().default(""),
});

export type FactoryApplicationInput = z.infer<typeof factoryApplicationSchema>;

// ---------------------------------------------------------------------------
// §3 — Enterprise Profile Update (authenticated FACTORY_REP / SUPER_ADMIN)
// ---------------------------------------------------------------------------

export const enterpriseProfileUpdateSchema = z.object({
  enterpriseId: idSchema,
  name: z.string().min(2).max(200).trim(),
  description: z.string().min(20).max(3000).trim(),
  monthlyCapacityPcs: z.number().int().positive().max(10_000_000),
  employeeCount: z.number().int().positive().max(100_000),
  address: z.string().min(5).max(300).trim(),
  city: z.string().min(2).max(100).trim(),
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
  websiteUrl: z
    .string()
    .url("Invalid website URL")
    .max(500)
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v ?? undefined)),
  coverImageUrl: z
    .string()
    .url()
    .max(1000)
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v ?? undefined)),
  exportMarkets: z.string().max(300).trim(),
});

export type EnterpriseProfileUpdateInput = z.infer<
  typeof enterpriseProfileUpdateSchema
>;

// ---------------------------------------------------------------------------
// §4 — Certification (authenticated FACTORY_REP)
// ---------------------------------------------------------------------------

export const certificationSchema = z.object({
  name: z
    .string()
    .min(1, "Certification name is required")
    .max(100)
    .trim(),
  issuer: z.string().min(1).max(200).trim(),
  certificateNumber: z.string().max(100).trim().optional(),
  issueDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid issue date"),
  expiryDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid expiry date"),
  certificateFileUrl: z
    .string()
    .url()
    .max(1000)
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v ?? undefined)),
});

export type CertificationInput = z.infer<typeof certificationSchema>;

// ---------------------------------------------------------------------------
// §5 — Inquiry note (authenticated)
// ---------------------------------------------------------------------------

export const inquiryNoteSchema = z.object({
  inquiryId: idSchema,
  content: z
    .string()
    .min(1, "Note cannot be empty")
    .max(5000, "Note must be at most 5,000 characters")
    .trim(),
});
