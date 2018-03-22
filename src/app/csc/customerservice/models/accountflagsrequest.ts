export interface IAccountFlagsRequest {
    ISFrequentCaller: boolean;
    IsHearingImpirement: boolean;
    IsSupervisor: boolean;
    IsTagInStatusFile: boolean;
    PreferedLanguange: string;
    CustomerId: number;
    SubSystem: string;
    ActivitySource: string;
    PerformBy: string;
    IsCreateAccountUserActivity: boolean;
}