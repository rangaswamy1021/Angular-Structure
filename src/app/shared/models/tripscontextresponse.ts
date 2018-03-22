export interface ITripsContextResponse {
  tripIDs: number[];
  invoiceIDs: number[];
  tagId: number;
  tripStatusCode: string;
  tripProblemId: number;
  referenceURL: string;
  successMessage: string;
  tripNumber: number;
  vehicleNumber: string;
  startDate: Date;
  endDate: Date;
  dateRange: any;
  tollTransactionType: string;
  billingStatus: string;
  aferCitationIds: number[];
  beforeCitationIds: number[];
  vehicleNumberForDispute: string[];
  selectedTripsOutstandingAmount: number;
  errorMessage: string;
  accountId: number;
  isFromInvoiceSearch: boolean;
  isBeforeSearch: boolean;
  PostedDate: string
}
