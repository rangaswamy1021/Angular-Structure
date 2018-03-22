import { IPaging } from './../../../shared/models/paging';

export interface IUnIdentifiedRequest {
    AnonymousID: number,
    PaymentID: number,
    Name: string,
    Address: string,
    Amount: number,
    Status: string,
    ReferenceNumber: string,
    Date: Date,
    PaymentType: string,
    ReceivedDate: Date,
    UserName: string,
    ToCustomerID: number,
    IsAnonymousPayment: boolean,
    UserId: number,
    LoginId: number,
    ActivitySource: string,
    Paging: IPaging
}