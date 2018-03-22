export interface IPaymentReversals
{
SubSystem: string;
PaymentMode: string;
CustomerId: number;
IntiatedBy: string;
TxnCategory: string;
TxnAmount: number;
AccountStatus: string;
PaymentId: number;
LoggedUserId: number;
UserName: string;
IsPostpaidCustomer: boolean;
VoucherNumber: string;
ParentPaymentId: number;
ParentPaymentMode: string;
ICNId: number;
LoginId: number;
PaymentStatus: string;
}