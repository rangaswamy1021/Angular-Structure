import { ICreditcardpaymentrequest } from './../../../payment/models/creditcardpaymentrequest';
import { AddCreditcardComponent } from './../../../payment/add-creditcard.component';
import { BalanceTransfer } from './../split-payment.component';
import { ICustomerRequest } from './../../../shared/models/customerrequest';
import { IVehicleRequest } from './../../../vehicles/models/vehiclecrequest';
import { IMakePaymentrequest } from './../../../payment/models/makepaymentrequest';
import { IVehicleResponse } from "../../../vehicles/models/vehicleresponse";
import { ITagResponse } from "../../../shared/models/tagresponse";
import { ICustomerAttributesRequest } from "../../customerdetails/models/customerattributesrequest";
export interface ISplitRequest {
    Payment: IMakePaymentrequest;
    Vehicle: IVehicleResponse[];
    Tags: ITagResponse[];
    CustAttrib: ICustomerAttributesRequest;
    CustInfo: ICustomerRequest;
    TollBalance: number;
    TotalTagFee: number;
    OtherPlanFee: number;
    TagDeposit: number;
    ServiceTax: number;
    MinimumAmount: number;
    TotalShippingCharge: number;
    IsPostPaidCustomer: boolean;
    IsAddCreditCard:boolean;
    AddCreditcardInfo: ICreditcardpaymentrequest;

    //Email
    PrimaryEmail: string;
    SecondaryEmail: string;
    EmailPreferred: string
    EmailAlert: boolean;
    //Phone
    DayPhone: string;
    EveningPhone: string;
    MobileNo: string;
    WorkPhone: string;
    WorkPhoneExt: string;
    Fax: string;
    PhonePreferrred: string;
    //balTransfer
    isTotalBalanceTransfer: boolean;
    isBalTran: boolean;
    balTrans: BalanceTransfer;

    tranAmount: number;
    payingAmount: number;
    totAmount: number;
    currBal: number;
    payMethod: string;
    //Resp
    NewAccountId: number;
    TxnDateTime: Date;
    ReferenceNo: string;

    BankName: string,
    AccoutName: string,
    AccountNumber: string,
    BankRoutingNumber: string,
    IsAddNewBankDetails: boolean,
}