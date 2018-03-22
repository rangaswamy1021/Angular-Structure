import { IAddressRequest } from "./addressrequest";
import { CreditCardType } from "../constants";

export interface ICreditCardRequest extends IAddressRequest {
    CCNumber: string,
    ExpDate: number,
    CCType: CreditCardType,
    NameOnCard: string,
    CVV: string,
    prefixsuffix: number,
    DefaultFlag: boolean,
    CCID: number,
    CreditCardKey: number,
    AccountTypeId: number,
    User: string,
    IsDeletePreviousCard: boolean,
    IsCardChanging: boolean,
    ThresholdAmount: number,
    CalculatedReBillAmount: number,
    CustomerBalance: number,
    isLowBalance: boolean,
    AccountStatus: string,
    ICNId: number,
    TypeSuffix: string
}