
import { ISystemActivities } from '../../shared/models/systemactivitiesrequest';

export interface IInvoiceRequest {
InvoiceId: number;
InvoiceNumber: string;
AccountId: number;
InvoiceOption: string;
StartPeriod: Date;
EndPeriod: Date;
PlateNumber: string;
CitationId: number;
VehicleId: number;
CustomerStatus: string;
IsCustomerInvoice: boolean;
InvoiceStatus: string;
Isviolator: boolean;
InvBatchId: string;
SystemUserActivityInd: boolean;
PageSize: number;
PageNumber: number;
SortColumn: string;
SortDirection: number;
InvOutstading: number;
InvStatus: string;
InvoicePaymentAmount: number;
BalanceDue: number;
SystemActivity: ISystemActivities;
isBeforeSearch: boolean;
InvoiceDueDate: string;
InvoiceScheduleDate : string;
UserName: string;
SubSystem: string;
OldInvoiceDueDate : string;
}
