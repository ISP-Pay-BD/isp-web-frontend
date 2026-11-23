/** Public pay page (`/v1/public/payments/make-payment/{id}`). */

export interface PayGateway {
  /** Backend slug: bkash | nagad | sslcommerz | eps | shurjopay | paystation */
  gateway: string;
  label: string;
  chargePercent: number;
  amountBdt: number;
  chargeBdt: number;
  totalBdt: number;
}

export interface PublicInvoice {
  paymentId: string;
  amountBdt: number;
  companyName: string;
  gateways: PayGateway[];
}
