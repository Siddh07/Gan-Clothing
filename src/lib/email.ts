import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "trade-desk@ganepal.org";
const ARCHIVE_EMAIL = process.env.GAN_ARCHIVE_EMAIL || "leads@ganepal.org";

export interface SendRFQEmailsPayload {
  buyerName: string;
  buyerEmail: string;
  buyerCompany: string;
  buyerCountry: string;
  orderQuantityTarget: number;
  message: string;
  factoryName?: string;
  factoryEmail?: string;
  productTitle?: string;
  inquiryId: string;
}

export async function dispatchRFQEmails(payload: SendRFQEmailsPayload) {
  const {
    buyerName,
    buyerEmail,
    buyerCompany,
    buyerCountry,
    orderQuantityTarget,
    message,
    factoryName,
    factoryEmail,
    productTitle,
    inquiryId,
  } = payload;

  const targetRecipientDesc = factoryName
    ? `${factoryName} (${factoryEmail || "Direct"})`
    : "Garment Association of Nepal (General Trade Desk)";

  console.log(`\n======================================================`);
  console.log(`📬 [B2B RFQ DISPATCH] ID: ${inquiryId}`);
  console.log(`Buyer: ${buyerName} (${buyerCompany}, ${buyerCountry}) - ${buyerEmail}`);
  console.log(`Target: ${targetRecipientDesc}`);
  console.log(`Product: ${productTitle || "Custom Sourcing Requirement"}`);
  console.log(`Target Quantity: ${orderQuantityTarget.toLocaleString()} units`);
  console.log(`Message: ${message}`);
  console.log(`======================================================\n`);

  if (!resend) {
    console.log("ℹ️ RESEND_API_KEY not configured. Mocking 3 parallel email transmissions (Buyer Ack, Factory Lead, GAN Archive).");
    return {
      success: true,
      mode: "mocked",
      message: "Lead recorded and emails logged to dev console.",
    };
  }

  try {
    const results = await Promise.allSettled([
      // (a) Acknowledgement to buyer
      resend.emails.send({
        from: `Garment Association of Nepal <${FROM_EMAIL}>`,
        to: [buyerEmail],
        subject: `RFQ Received - Sourcing Inquiry: ${productTitle || factoryName || "Garment Association of Nepal"} [Ref: #${inquiryId.slice(-6)}]`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="text-align: center; border-bottom: 2px solid #047857; padding-bottom: 15px; margin-bottom: 20px;">
              <h2 style="color: #065f46; margin: 0;">Garment Association of Nepal (GAN)</h2>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">National Apex Body of Garment Manufacturers & Exporters</p>
            </div>
            <p>Dear <strong>${buyerName}</strong>,</p>
            <p>Thank you for submitting your trade inquiry through the official GAN B2B Export Directory. Your sourcing request has been authenticated and routed.</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #047857; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h4 style="margin-top: 0; color: #0f172a;">Inquiry Summary:</h4>
              <p style="margin: 4px 0;"><strong>Inquiry Ref:</strong> #${inquiryId}</p>
              <p style="margin: 4px 0;"><strong>Target Manufacturer:</strong> ${factoryName || "General Secretariat Routing"}</p>
              ${productTitle ? `<p style="margin: 4px 0;"><strong>Product:</strong> ${productTitle}</p>` : ""}
              <p style="margin: 4px 0;"><strong>Order Target:</strong> ${orderQuantityTarget.toLocaleString()} pcs</p>
              <p style="margin: 4px 0;"><strong>Company:</strong> ${buyerCompany} (${buyerCountry})</p>
            </div>

            <p>The designated trade officer / factory merchandising team will review your specifications and follow up within 24 to 48 business hours with FOB/CIF quotations and sampling details.</p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
            <p style="font-size: 12px; color: #64748b; text-align: center;">
              Garment Association of Nepal (GAN) • Sankhamul, Kathmandu, Nepal • <a href="https://ganepal.org" style="color: #047857;">ganepal.org</a>
            </p>
          </div>
        `,
      }),

      // (b) Trade lead alert to factory sales contact (if specific factory)
      factoryEmail
        ? resend.emails.send({
            from: `GAN Trade Portal <${FROM_EMAIL}>`,
            to: [factoryEmail],
            subject: `🚨 NEW B2B TRADE LEAD: ${orderQuantityTarget.toLocaleString()} pcs from ${buyerCompany} (${buyerCountry})`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <div style="border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px;">
                  <h3 style="color: #0369a1; margin: 0;">Verified Buyer Inquiry Alert</h3>
                  <p style="color: #64748b; margin: 5px 0 0 0; font-size: 13px;">Forwarded by Garment Association of Nepal (GAN) Portal</p>
                </div>
                <p>Attention: Export Merchandising Department,</p>
                <p>A new verified trade inquiry has been submitted for <strong>${factoryName}</strong>.</p>
                
                <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; margin: 15px 0; border-radius: 6px;">
                  <p style="margin: 4px 0;"><strong>Buyer Name:</strong> ${buyerName}</p>
                  <p style="margin: 4px 0;"><strong>Company:</strong> ${buyerCompany}</p>
                  <p style="margin: 4px 0;"><strong>Country:</strong> ${buyerCountry}</p>
                  <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${buyerEmail}">${buyerEmail}</a></p>
                  <p style="margin: 4px 0;"><strong>Quantity Target:</strong> ${orderQuantityTarget.toLocaleString()} pcs</p>
                  ${productTitle ? `<p style="margin: 4px 0;"><strong>Product Reference:</strong> ${productTitle}</p>` : ""}
                </div>

                <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 12px; margin-top: 15px; border-radius: 4px;">
                  <strong>Buyer Specifications & Notes:</strong>
                  <p style="margin: 8px 0 0 0; font-style: italic; color: #334155;">"${message}"</p>
                </div>

                <p style="margin-top: 20px;">Please reach out directly to the buyer to initiate tech-pack evaluations and commercial negotiations.</p>
              </div>
            `,
          })
        : Promise.resolve({ id: "skipped_no_factory_email" }),

      // (c) Archival copy to GAN trade desk
      resend.emails.send({
        from: `GAN Export Registry <${FROM_EMAIL}>`,
        to: [ARCHIVE_EMAIL],
        subject: `[GAN ARCHIVE] Trade Lead #${inquiryId.slice(-6)}: ${buyerCompany} -> ${factoryName || "General Inquiries"}`,
        html: `
          <p>A new buyer RFQ has been logged into the GAN Portal.</p>
          <ul>
            <li><strong>Ref ID:</strong> ${inquiryId}</li>
            <li><strong>Buyer:</strong> ${buyerName} (${buyerCompany} - ${buyerCountry})</li>
            <li><strong>Target Enterprise:</strong> ${factoryName || "Unassigned / General Secretariat"}</li>
            <li><strong>Units:</strong> ${orderQuantityTarget.toLocaleString()}</li>
            <li><strong>Message:</strong> ${message}</li>
          </ul>
        `,
      }),
    ]);

    return {
      success: true,
      mode: "live",
      results,
    };
  } catch (error) {
    console.error("Resend dispatch error:", error);
    return {
      success: false,
      error,
    };
  }
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const recipients = Array.isArray(to) ? to : [to];

  if (!resend) {
    console.log(`\n📧 [EMAIL MOCK DEV] To: ${recipients.join(", ")} | Subject: ${subject}`);
    return { success: true, mode: "mock" };
  }

  try {
    const result = await resend.emails.send({
      from: `Garment Association of Nepal <${FROM_EMAIL}>`,
      to: recipients,
      subject,
      html,
    });
    return { success: true, mode: "live", result };
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    return { success: false, error };
  }
}

