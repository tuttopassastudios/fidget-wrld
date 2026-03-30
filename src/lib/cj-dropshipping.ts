// CJ SDK - local copy for Vercel compatibility
// eslint-disable-next-line @typescript-eslint/no-require-imports
const CJDropshipping = require('./cj-sdk/index.js');

type CJClient = InstanceType<typeof CJDropshipping>;

let cjClient: CJClient | null = null;

export function getCJClient(): CJClient {
  if (!cjClient) {
    const apiKey = process.env.CJ_API_KEY;
    if (!apiKey) {
      throw new Error('CJ_API_KEY environment variable is not set');
    }
    cjClient = new CJDropshipping({ apiKey });
  }
  return cjClient;
}

export interface CJShippingAddress {
  name: string;
  phone: string;
  email: string;
  country: string;
  province: string;
  city: string;
  address: string;
  address2?: string;
  zip: string;
}

export interface CJOrderItem {
  vid: string;
  quantity: number;
}

export interface CJOrderRequest {
  shippingAddress: CJShippingAddress;
  items: CJOrderItem[];
  orderNumber: string;
}

export interface CJOrderResponse {
  orderId: string;
  orderNumber: string;
  status: string;
}
