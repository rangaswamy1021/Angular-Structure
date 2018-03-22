import { ICNStatus } from './../constants';
import { PaymentMode } from "../../../payment/constants";
import { ICNDetails } from "./icndetails";

export interface ICNDetailsRequest extends ICNDetails {
BatchId :number,
RevenueDate:Date,
CashAmount :number,  
CheckAmount :number,
CreditAmount :number,
MOAmount :number,
FloatAmount :number,
ItemReplacementCount :number,
ItemAssignCount :number,
ItemReturnedCount :number,
ItemAllotedCount :number,
ItemRemainingCount :number,
ICNNotes :string,
TotalVarianceAmount :number,
TotalVarianceItemCount :number,
TotalCount :number,
VoucherNo :string,
TxnType :PaymentMode,
TxnId :number,
TxnAmount :number,
ICNStatus:ICNStatus
}