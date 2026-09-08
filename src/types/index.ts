export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN_EDITOR = "ADMIN_EDITOR",
  FACTORY_REP = "FACTORY_REP",
}

export enum EnterpriseStatus {
  PENDING_REVIEW = "PENDING_REVIEW",
  APPROVED = "APPROVED",
  SUSPENDED = "SUSPENDED",
  REJECTED = "REJECTED",
}

export enum InquiryStatus {
  NEW = "NEW",
  VIEWED = "VIEWED",
  FORWARDED = "FORWARDED",
  RESPONDED = "RESPONDED",
  CLOSED = "CLOSED",
}

export interface QuoteCartItem {
  productId?: string;
  productTitle?: string;
  productImage?: string;
  fabricType?: string;
  enterpriseId: string;
  enterpriseName: string;
  requestedQuantity: number;
  customSpecifications?: string;
}
