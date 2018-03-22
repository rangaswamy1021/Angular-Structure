export interface IStatusupdateRequest {
    ProblemRCA: string;
    ProblemId: number;
    ProblemAbstract: string;
    Status: string;
    RecordedBy: number;
    UserName: string;
    OwnerId: number;
    SubSystem: string;
    WebDisplay: boolean;
    Priority: string;
    Severity: string;
    ProblemIdCSV: string;
    DateRCA: any;
    UserId: number;
    LoginId: number;
}
