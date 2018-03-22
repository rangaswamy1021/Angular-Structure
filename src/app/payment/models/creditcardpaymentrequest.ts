import { CreditCardType } from "../constants";

export interface ICreditcardpaymentrequest {
    CreditCardNumber: string,
    ExpiryDate: string,
    ExpiryMonth: string,
    ExpiryYear: string,
    CCSuffix4: string,
    CreditCardType: CreditCardType,
    NameOnCard: string,
    CVV: string,
    Line1: string,
    Line2: string,
    Line3: string,
    City: string,
    State: string,
    Country: string,
    Zip1: string,
    Zip2: string,
    CCID: number,
    DefaultFlag: boolean,
    CardMode: string,
    NewAddress: boolean
}
