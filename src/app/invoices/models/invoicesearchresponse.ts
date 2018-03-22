
import { IPaymentDetailsResponse } from "./paymentdetailsresponse";
import { ITripDetailsResponse } from "./tripdetailsresponse";
import { IFeeDetailsResponse } from "./feedetailsresponse";

export interface IInvoiceSearchResponse {

InvoiceNumber: string;
CustomerId: number;
StartDate: Date;
EndDate: Date;
InvoiceId: number;
PlateNumber: string;
TripId: number;
firstName: string;
lastname: string;
IsCustomerInvoice: boolean;
InvoiceStatus: string;
Isviolator: boolean;
InvoiceBatchId: string;
SearchActivityIndicator: string;
UserName: string;
DueDate: Date;
InvoiceDate: Date;
CreatedDate: Date;
Status: string;
TotalCount: number;
PreviousDue: number;
BilledAmount: number;
BalanceDue: number;
AmountPaid: number;
TotalAmount: number;
RecCount: number;
objPayments: IPaymentDetailsResponse;
objTrips: ITripDetailsResponse;
objFee: IFeeDetailsResponse;
StepDescription: string;
AgingHoldType: string;
HoldStatus: string;
TotalPmtAdjAmt: number;
OutstandingDue: number;
isInvoiceSelected: boolean;
isDisableInvoice: boolean;
DocumentPath: string;
IsAgingHold: boolean;
ProblemID: number;
ProblemStatus:string;

}
