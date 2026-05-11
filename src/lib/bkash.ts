const BKASH_API_URL = process.env.BKASH_MODE === "production"
  ? "https://checkout.pay.bka.sh/v1.2.0-beta"
  : "https://checkout.sandbox.bka.sh/v1.2.0-beta";

const BKASH_USERNAME = process.env.BKASH_USERNAME || "";
const BKASH_PASSWORD = process.env.BKASH_PASSWORD || "";
const BKASH_APP_KEY = process.env.BKASH_APP_KEY || "";
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET || "";

export interface BKashTokenResponse {
  id_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface BKashCreateResponse {
  paymentID: string;
  createTime: string;
  updateTime: string;
  orgLogo: string;
  orgName: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  bkashURL: string;
  callbackURL: string;
  successCallbackURL: string;
  failureCallbackURL: string;
  cancelledCallbackURL: string;
}

export interface BKashExecuteResponse {
  paymentID: string;
  trxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  customerMsisdn: string;
  paymentExecuteTime: string;
}

export async function grantToken(): Promise<string> {
  const url = `${BKASH_API_URL}/checkout/token/grant`;
  console.log("[bKash] Grant Token URL:", url);
  console.log("[bKash] Username:", BKASH_USERNAME ? `SET (len=${BKASH_USERNAME.length})` : "EMPTY");
  console.log("[bKash] Password:", BKASH_PASSWORD ? `SET (len=${BKASH_PASSWORD.length})` : "EMPTY");
  console.log("[bKash] App Key:", BKASH_APP_KEY ? `SET (len=${BKASH_APP_KEY.length})` : "EMPTY");
  console.log("[bKash] App Secret:", BKASH_APP_SECRET ? `SET (len=${BKASH_APP_SECRET.length})` : "EMPTY");
  console.log("[bKash] Request body:", JSON.stringify({ app_key: BKASH_APP_KEY, app_secret: "***" }));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        username: BKASH_USERNAME,
        password: BKASH_PASSWORD,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_key: BKASH_APP_KEY,
        app_secret: BKASH_APP_SECRET,
      }),
    });

    const data = await response.json();
    console.log("[bKash] Grant Token Response Status:", response.status);
    console.log("[bKash] Grant Token Response:", JSON.stringify(data).substring(0, 200));

    if (!response.ok || !data.id_token) {
      const msg = data.errorMessage || data.message || data.statusMessage || "Grant token failed";
      throw new Error(msg);
    }

    console.log("[bKash] Token obtained, length:", data.id_token.length);
    return data.id_token;
  } catch (error: any) {
    console.error("[bKash Grant Token Error]", error.message);
    throw error;
  }
}

export async function createPayment(amount: number, invoiceNumber: string): Promise<BKashCreateResponse> {
  const token = await grantToken();
  const url = `${BKASH_API_URL}/checkout/payment/create`;

  console.log("[bKash] Create Payment URL:", url);
  console.log("[bKash] Amount:", amount, "Invoice:", invoiceNumber);
  console.log("[bKash] Token prefix:", token.substring(0, 30) + "...");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: token,
        "x-app-key": BKASH_APP_KEY,
      },
      body: JSON.stringify({
        amount: String(amount),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: invoiceNumber,
      }),
    });

    const data = await response.json();
    console.log("[bKash] Create Payment Response Status:", response.status);
    console.log("[bKash] Create Payment Response:", JSON.stringify(data).substring(0, 300));

    if (!response.ok || (data.statusCode && data.statusCode !== "0000")) {
      const msg = data.statusMessage || data.errorMessage || data.message || "Create payment failed";
      throw new Error(msg);
    }

    return data;
  } catch (error: any) {
    console.error("[bKash Create Payment Error]", error.message);
    throw error;
  }
}

export async function executePayment(paymentID: string): Promise<BKashExecuteResponse> {
  const token = await grantToken();
  const url = `${BKASH_API_URL}/checkout/payment/execute/${paymentID}`;

  console.log("[bKash] Execute Payment URL:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: token,
        "x-app-key": BKASH_APP_KEY,
      },
      body: JSON.stringify({ paymentID }),
    });

    const data = await response.json();
    console.log("[bKash] Execute Payment Response Status:", response.status);
    console.log("[bKash] Execute Payment Response:", JSON.stringify(data).substring(0, 300));

    if (!response.ok || (data.statusCode && data.statusCode !== "0000")) {
      const msg = data.statusMessage || data.errorMessage || data.message || "Execute payment failed";
      throw new Error(msg);
    }

    return data;
  } catch (error: any) {
    console.error("[bKash Execute Payment Error]", error.message);
    throw error;
  }
}
