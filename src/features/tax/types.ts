export const VAT_RATE = 0.13;

export type TaxSummary = {
  month: string;
  taxableSales: number;
  saleCount: number;
  inputPurchases: number;
  purchaseCount: number;
  outputVat: number;
  inputVat: number;
  netVatPayable: number;
};
