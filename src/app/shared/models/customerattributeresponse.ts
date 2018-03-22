export interface ICustomerAttributeResponse {
    ReferralCustomerId: number
    RequestStatusString: string
    RequestDate: Date,
    StatementCycle: string,
    StatementDelivery: string
    TranponderPurchasemethod: string,
    InvoiceIntervalID: number,
    InvoiceAmount: number,
    InvoiceDay: number,
    SourceOfChannel: string,
    AutoReplenishmentType: string
    LanguagePreference: string,
    IsHearingImpairment: string,
    IsFrequentCaller: string,
    IsSuperVisor: string,
    IsTagInStatusFile: string,
    CalculatedReBillAmount: string,
    ThresholdAmount: string,
    RequestStatus: string,
    AccountId: number,
    RefPkId: number,
    AccountStatus: string;
    RecordCount: number;
    isReferralAccountSelected: boolean;
    Rebill_Hold_EndEffectiveDate: Date;
    IsManualHold: boolean;
    LowBalanceAmount: number;
    CapAmount:number;
}