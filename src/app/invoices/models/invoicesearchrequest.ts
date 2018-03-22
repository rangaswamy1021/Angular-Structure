import { IPaging } from '../../shared/models/paging';
import { ISystemActivities } from '../../shared/models/systemactivitiesrequest';

export interface IInvoiceSearchRequest {

InvoiceNumber: string;
CustomerId: number;
StartDate: Date;
EndDate: Date;
PlateNumber: string;
TripId: number;
firstName: string;
lastname: string;
IsCustomerInvoice: boolean;
InvoiceStatus: string;
Isviolator: boolean;
InvoiceBatchId: string;
SearchActivityIndicator: boolean;
PageSize: number;
PageNumber: number;
SortColumn: string;
SortDir: number;
SystemActivity: ISystemActivities;

}
