export interface IAffidavitResponse {
  ViolatorId: number;
  VehicleNumber: string;
  StartEffectiveDate: string;
  EndEffectiveDate: string;
  NonLiabilityReasonCode: string;
  Comments: string;
  DocumentPath: string;
  CitationCSV: string;
  AffidavitId: number;
  InvoiceIdCSV: string;
  LinkIds: string;
  LinkSourceName: string;
}
