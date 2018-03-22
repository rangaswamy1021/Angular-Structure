export interface IEMIDetailsRequest {
    EMIHeaderId: number;
    EMIDetailId: number;
    EMITermAmount: number;
    EMITermPaidAmount: number;
    EMITermDuedate: Date;
    EMITermStatus: string;
    EMITermStatusDesc: string;
    PaymentDate: Date;
    Username: string;
    EMITermNumber: number;
    EMITermDuedateWithGracePeriod: Date;
    IsDefault: boolean;
    CustomerId: number;
    ActualTermDueDate: Date;
}