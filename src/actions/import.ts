"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logAuditAction } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface RowError {
  row: number;
  field: string;
  message: string;
}

export interface ParsedRow {
  rowNumber: number;
  name: string;
  registrationNumber: string;
  panNumber: string;
  description: string;
  yearEstablished: number;
  employeeCount: number;
  monthlyCapacityPcs: number;
  address: string;
  city: string;
  websiteUrl?: string;
  contactEmail: string;
  contactPhone: string;
  exportMarkets: string;
  isVerified: boolean;
  isValid: boolean;
  errors: string[];
}

export interface ImportValidationResult {
  success: boolean;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  errors: RowError[];
  parsedData: ParsedRow[];
  insertedCount?: number;
}

// Simple RFC 4180 compliant CSV parser
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentValue = "";

  const cleanText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentValue += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentValue += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(currentValue.trim());
        currentValue = "";
      } else if (char === "\n") {
        row.push(currentValue.trim());
        // Only push row if it contains at least one non-empty value
        if (row.some((val) => val.length > 0)) {
          lines.push(row);
        }
        row = [];
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
  }

  if (currentValue.length > 0 || row.length > 0) {
    row.push(currentValue.trim());
    if (row.some((val) => val.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

export async function processEnterpriseCSV(
  csvContent: string,
  executeInsert: boolean = false
): Promise<ImportValidationResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "ADMIN_EDITOR"].includes(session.user.role)) {
    throw new Error("Unauthorized: Super Admin or Admin Editor required.");
  }

  const rawRows = parseCSV(csvContent);
  if (rawRows.length < 2) {
    return {
      success: false,
      totalRows: 0,
      validCount: 0,
      invalidCount: 0,
      errors: [{ row: 0, field: "file", message: "CSV file is empty or missing data rows." }],
      parsedData: [],
    };
  }

  // Header mapping
  const headers = rawRows[0].map((h) => h.toLowerCase().trim().replace(/[\s_-]+/g, ""));
  const headerMap: Record<string, number> = {};
  headers.forEach((h, idx) => {
    headerMap[h] = idx;
  });

  const getCol = (row: string[], ...aliases: string[]): string => {
    for (const alias of aliases) {
      const cleanAlias = alias.toLowerCase().replace(/[\s_-]+/g, "");
      if (headerMap[cleanAlias] !== undefined) {
        return row[headerMap[cleanAlias]] || "";
      }
    }
    return "";
  };

  const existingEnterprises = await prisma.enterprise.findMany({
    select: { panNumber: true, name: true },
  });
  const existingPANs = new Set(existingEnterprises.map((e) => e.panNumber.trim()));
  const seenPANsInBatch = new Set<string>();

  const errors: RowError[] = [];
  const parsedData: ParsedRow[] = [];

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    const rowNumber = i + 1;
    const rowErrors: string[] = [];

    const name = getCol(row, "name", "companyname", "factoryname");
    const registrationNumber = getCol(row, "registrationnumber", "regno", "registrationno") || "REG-PENDING";
    const panNumber = getCol(row, "pannumber", "pan", "taxid");
    const description = getCol(row, "description", "about", "profile") || "Export garment manufacturer in Nepal.";
    const yearEstStr = getCol(row, "yearestablished", "year", "estyear");
    const employeeCountStr = getCol(row, "employeecount", "employees", "workforce");
    const monthlyCapacityStr = getCol(row, "monthlycapacitypcs", "capacity", "monthlycapacity");
    const address = getCol(row, "address", "factoryaddress", "location");
    const city = getCol(row, "city", "district");
    const websiteUrl = getCol(row, "websiteurl", "website", "url");
    const contactEmail = getCol(row, "contactemail", "email");
    const contactPhone = getCol(row, "contactphone", "phone", "contactno");
    const exportMarkets = getCol(row, "exportmarkets", "markets") || "USA, EU, UK";
    const isVerifiedStr = getCol(row, "isverified", "verified");

    // Validation rules
    if (!name || name.length < 2) {
      const msg = "Factory name is required (min 2 chars).";
      rowErrors.push(msg);
      errors.push({ row: rowNumber, field: "name", message: msg });
    }

    if (!panNumber || panNumber.length < 6) {
      const msg = "Valid PAN number is required.";
      rowErrors.push(msg);
      errors.push({ row: rowNumber, field: "panNumber", message: msg });
    } else if (existingPANs.has(panNumber)) {
      const msg = `PAN "${panNumber}" already registered in database.`;
      rowErrors.push(msg);
      errors.push({ row: rowNumber, field: "panNumber", message: msg });
    } else if (seenPANsInBatch.has(panNumber)) {
      const msg = `Duplicate PAN "${panNumber}" found in this CSV batch.`;
      rowErrors.push(msg);
      errors.push({ row: rowNumber, field: "panNumber", message: msg });
    } else {
      seenPANsInBatch.add(panNumber);
    }

    if (!contactEmail || !/^\S+@\S+\.\S+$/.test(contactEmail)) {
      const msg = "Valid contact email is required.";
      rowErrors.push(msg);
      errors.push({ row: rowNumber, field: "contactEmail", message: msg });
    }

    if (!city) {
      const msg = "City/District location is required.";
      rowErrors.push(msg);
      errors.push({ row: rowNumber, field: "city", message: msg });
    }

    const monthlyCapacity = parseInt(monthlyCapacityStr, 10);
    if (isNaN(monthlyCapacity) || monthlyCapacity <= 0) {
      const msg = "Monthly capacity must be a positive integer.";
      rowErrors.push(msg);
      errors.push({ row: rowNumber, field: "monthlyCapacityPcs", message: msg });
    }

    const yearEstablished = parseInt(yearEstStr, 10) || 2010;
    const employeeCount = parseInt(employeeCountStr, 10) || 100;
    const isVerified = isVerifiedStr.toLowerCase() === "true" || isVerifiedStr === "1";

    parsedData.push({
      rowNumber,
      name,
      registrationNumber,
      panNumber,
      description,
      yearEstablished,
      employeeCount,
      monthlyCapacityPcs: isNaN(monthlyCapacity) ? 10000 : monthlyCapacity,
      address: address || `${city}, Nepal`,
      city: city || "Kathmandu",
      websiteUrl: websiteUrl ? (websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`) : undefined,
      contactEmail,
      contactPhone: contactPhone || "+977-1-4000000",
      exportMarkets,
      isVerified,
      isValid: rowErrors.length === 0,
      errors: rowErrors,
    });
  }

  const validRows = parsedData.filter((r) => r.isValid);
  let insertedCount = 0;

  if (executeInsert && validRows.length > 0) {
    // Perform database insertion
    for (const item of validRows) {
      const baseSlug = slugify(item.name);
      const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

      await prisma.enterprise.create({
        data: {
          name: item.name,
          slug,
          status: "APPROVED",
          registrationNumber: item.registrationNumber,
          panNumber: item.panNumber,
          description: item.description,
          yearEstablished: item.yearEstablished,
          employeeCount: item.employeeCount,
          monthlyCapacityPcs: item.monthlyCapacityPcs,
          address: item.address,
          city: item.city,
          websiteUrl: item.websiteUrl || null,
          contactEmail: item.contactEmail,
          contactPhone: item.contactPhone,
          exportMarkets: item.exportMarkets,
          isVerified: item.isVerified,
        },
      });
      insertedCount++;
    }

    await logAuditAction({
      userId: session.user.id,
      action: "BULK_IMPORT_ENTERPRISES",
      entityType: "Enterprise",
      entityId: "BULK_BATCH",
      metadata: {
        totalRows: rawRows.length - 1,
        importedCount: insertedCount,
      },
    });

    revalidatePath("/admin/enterprises");
    revalidatePath("/admin");
    revalidatePath("/directory");
  }

  return {
    success: errors.length === 0,
    totalRows: rawRows.length - 1,
    validCount: validRows.length,
    invalidCount: parsedData.filter((r) => !r.isValid).length,
    errors,
    parsedData,
    insertedCount: executeInsert ? insertedCount : undefined,
  };
}
