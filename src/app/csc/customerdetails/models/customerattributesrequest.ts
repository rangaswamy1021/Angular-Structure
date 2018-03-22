
import { ActivitySource, SubSystem } from "../../../shared/constants";

export interface ICustomerAttributesRequest {
    AccountId: number,
    RevenueCategory: string,
    // UserType	:	TollPlus.TBOS.Enums.CustomerAttributes.UserType	,
    // CustomerStatus	:	TollPlus.TBOS.Enums.CustomerAttributes.CustomerStatus	,
    // MembershipType	:	TollPlus.TBOS.Enums.CustomerAttributes.MembershipType	,
    ParentId: number,
    AccountType: string,
    AutoReplenishmentType: string,
    IsNotificationsEnabled: boolean,
    DriverLicenceNumber: string,
    DriverLicenceApprovedState: string,
    DriverLicenceExpirationDate: Date,
    //PreferredShipment	:	TollPlus.TBOS.Enums.CustomerAttributes.PreferredShipment	,
    TranponderPurchasemethod: string,
    CalculatedReBillAmount: number,
    ThresholdAmount: number,
    IsManualHold: boolean,
    SourceOfChannel: string,
    Rebill_Hold_StartEffectiveDate: Date,
    Rebill_Hold_EndEffectiveDate: Date,
    StatementDelivery: string,
    UpdatedUser: string,
    StatementCycle: string,
    OrganizationName: string,
    Pin: string,
    PerformBy: string,
    ActivitySource: ActivitySource,
    SubSystem:SubSystem,
    //SecurityQuestionsAndAnswers	:	List<TollPlus.TBOS.ServiceDataContract.Security.Request.Security>	,
    TemplateType: string,
    IsCreateAccountUserActivity: boolean,
    IsSplitCustomer: boolean,
    ActionCode: string,
    FeaturesCode: string,
    LoginId: number,
    KeyValue: string,
    User: string,
    ActivityTypeDescription: string,
    RefPkId: number,
    ReferralCustomerId: number,
    RequestDate: Date,
    //RequestStatus	:	TollPlus.TBOS.Enums.AdjustmentApprovedStatus	,
    ReferalBalance: number,
    RefIndicator: number,
    //AccountAdjustments	:	List<TollPlus.TBOS.ServiceDataContract.Adjustments.AccountAdjustment.Request.AccountAdjustment>	,
    CheckBlockList: boolean,
    PreviousRunDate: Date,
    NextRunDate: Date,
    CycleUpdatedDate: Date,
    IsTagRequired: boolean,
    IsPostPaidCustomer: boolean,
    PlanId: number,
    PlanDescription: string,
    EnrollmentNumber: string,
    AutoReplenishmentTypeDesc: string,
    PreferedLanguange: string,
    IsHearingImpirement: boolean,
    ISFrequentCaller: boolean,
    IsSupervisor: boolean,
    IsTagInStatusFile: boolean,
    InvoiceIntervalID: number,
    InvoiceAmount: number,
    InvoiceDay: string,
    ParentPaln: string,
    InvoiceAmt: string,
    UserId:number,
    LowBalanceAmount:number;
}