import { IAddressRequest } from "./addressrequest";

export interface IBankRequest extends IAddressRequest {
    PaymentId: number,
    PaymentDate: Date,
    Accnumber: string,
    BankName: string,
    MICRCode: string,
    AccName: string,
    IsDefault: boolean,
    CustomerBankAccountId: number,
    TxnAmount: number,
    AccountTypeId: number,
    User: string,
    prefixsuffix: number,
    AccountStatus: string,
    ICNId: number,
    CustomerBalance: number,
    ThresholdAmount: number,
    CalculatedReBillAmount: number
    isLowBalance: boolean,
    ReplenishmentType: string
}
