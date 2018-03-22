export interface IInvoicesContextResponse {
  invoiceIDs: number[];
  referenceURL: string;
  successMessage: string;
  InvoiceId: number;
  InvoiceNumber: string;
  CustomerId: number;
  InvBatchId: string;
  PlateNumber: string;
  InvStatus: string;
  invoiceStatus: string;
  isBeforeSearch: boolean;
  AccountId: number;
  tripIDs: number[];
  PlateNumbersForDispute: string[];
  selectedInvoiceNumbers: string[];
}
