export interface ICustomerAttributeRequest {
    AccountId: number;
    ReferralCustomerId: number;
    RefIndicator: number;
    ReferalBalance: number;
    RequestDate: string;
    RequestStatus: string;
    UpdatedUser: string;
    SubSystem: string;
    ActivitySource: string;
    CheckBlockList: boolean;
    UserId: number
    LoginId: number
    isStatementChanged: boolean,
    isCycleChanged: boolean,
    IsPlanbased: boolean,
    isAmountChanged: boolean,
    isDayChanged: boolean,
    AccountType: string
    StatementDelivery: string,
    InvoiceIntervalID: number,
    InvoiceAmount: number,
    InvoiceDay: string,
    TranponderPurchasemethod: string,
    parentId: number;


    IsCreateAccountUserActivity: boolean,
    SourceOfChannel: string,
    RevenueCategory: string,
    PreferedLanguange: string
    IsHearingImpirement: boolean,
    ISFrequentCaller: boolean,
    IsSupervisor: boolean,
    ParentPaln: string,
    StatementCycle: string,
    ActionCode: string,
    AccountAdjustments: any[];
    AutoReplenishmentType: string;
    CalculatedReBillAmount: number;
    ThresholdAmount: number;
    Rebill_Hold_EndEffectiveDate: string;
    LowBalanceAmount: number;
    CapAmount: number;
    //IAccountAdjustmentsRequest;
}

export class IAccountAdjustmentsRequest {
    RefPkId: number;
    CustomerId: number
    ReferralCustomerId: number
    AccStatusCode: string
    AdjustmentCategory: string
    DrCr_Flag: string
    TxnType: string
    User: string
    IsPostpaidCustomer
    AppTxnTypeCode: string
    TxnTypeDesc: string
    Stmt_Literal: string
    Description: string
    ICNId: number;
    IsApproved: string
    AdjustmentDate: string;
    TxnCategory: string
    ActivityType: string
}