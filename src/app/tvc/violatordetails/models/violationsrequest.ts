import { IInvoiceRequest } from "../../../invoices/models/invoicesrequest";

export interface IViolatorTransaction {
    ViolatorId: number;
    CustomerId: number;
    PaymentTxnId: number;
    AmountRecieved: number;
    PaymentTxnDate: Date;
    TripId: number;
    UserName: string;
    TripReceiptId: number;
    TripChargeId: number;
    PaymentStatus: string;
    OutstandingAmount: number;
    Citation_Stage: string;
    Citation_Status: string;
    Citation_Type: string;
    AmountClass: string;
    CitationCSV: string;
    CitationId: number;
    ActionType: string;
    // List<TollPlus.TBOS.ServiceDataContract.Communication.Request.Address> objListAddress { get; set; }
    //TollPlus.TBOS.Enums.CorrespondenceAddressAction AddressFlag { get; set; }
    SubSystem: string;
    Amount: number;
    FeeAmounts: number;
    TransferredViolatorId: number;
    LinkId: number;
    TripStatusDate: Date;
    TripStatusId: number;
    ICNId: number;
    UserId: number;
    LoginId: number;
    ActivitySource: string;
    LinkSourceName: string;
    TxnDate: Date;
    NonliabilityReasonCode: string;
    Comments: string;
    VehicleNumber: string;
    IsVehicleAdd: boolean;
    VehicleId: number;
    isSheduleInsert: boolean;
    NextScheduleDate: Date;
    objListInvoices: IInvoiceRequest[];
    IsPostpaidCustomer: boolean;
    IsOneTimeTollCustomer: boolean;
    TripStageId: number;
}
