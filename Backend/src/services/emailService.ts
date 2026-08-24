import { Resend } from "resend";

let resendClient: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM || "Viśvam <onboarding@resend.dev>";
}

function subscriptionConfirmationHtml(): string {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html>
  <body style="margin:0; padding:0; background-color:#fdfaf5; font-family: Georgia, 'Times New Roman', serif; color:#241a12;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdfaf5; padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border:1px solid rgba(36,26,18,0.1); border-radius:16px; overflow:hidden; max-width:480px;">
            <tr>
              <td style="background-color:#f8f1e7; padding:32px; text-align:center;">
                <img src="https://visvam.in/Visvam-Logo.png" alt="" width="44" height="44" style="display:block; margin:0 auto 14px; width:44px; height:44px;" />
                <img src="https://visvam.in/Visvam-Wordmark.png" alt="Viśvam" width="140" style="display:block; margin:0 auto; width:140px; height:auto;" />
              </td>
            </tr>
            <tr>
              <td style="padding:40px 40px 24px;">
                <p style="font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:#6d5c4c; margin:0 0 16px;">Subscription Confirmed</p>
                <h1 style="font-size:26px; font-weight:400; margin:0 0 20px; line-height:1.3; color:#241a12;">You're on the list.</h1>
                <p style="font-size:15px; line-height:1.7; color:#6d5c4c; margin:0 0 16px;">
                  This is a confirmation mail from Viśvam. You are a subscriber now.
                </p>
                <p style="font-size:15px; line-height:1.7; color:#6d5c4c; margin:0 0 24px;">
                  You will get regular updates on new arrivals, seasonal releases, and first word on anything worth knowing.
                </p>
                <a href="https://visvam.in" style="display:inline-block; font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:#241a12; text-decoration:none; border-bottom:2px solid #8a4f27; padding-bottom:4px;">Visit Viśvam</a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 32px; border-top:1px solid rgba(36,26,18,0.1);">
                <p style="font-size:11px; color:#9c8c7c; margin:0;">© ${year} Viśvam. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Sends the "you're subscribed" confirmation email. Silently skips (with a
 * warning) if RESEND_API_KEY isn't configured, so local/dev environments
 * without email credentials don't crash the newsletter signup flow.
 */
export async function sendSubscriptionConfirmationEmail(
  toEmail: string
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  const client = getClient();
  if (!client) {
    console.warn("RESEND_API_KEY not configured — skipping subscription confirmation email.");
    return { success: false, skipped: true };
  }

  try {
    const { error } = await client.emails.send({
      from: getFromAddress(),
      to: toEmail,
      subject: "You're subscribed to Viśvam",
      html: subscriptionConfirmationHtml(),
      text: "This is a confirmation mail from Viśvam. You are a subscriber now. You will get regular updates on new arrivals, seasonal releases, and first word on anything worth knowing.",
    });

    if (error) {
      console.error("Resend subscription email error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("Failed to send subscription confirmation email:", err);
    return { success: false, error: err.message };
  }
}
