export interface IAssignStatusRequest {
    ProblemId: number;
    TransformationProblemId: number;
    TransformationEventTypeId: string;
    RecordedBy: number;
    UserName: string;
    Status: string;
    Priority: string;
    Severity: string;
    TicketIdCSV: string;
    ProblemType: string;
    UserId: number;
    LoginId: number;
    SubSystem: string;
    IsSelected: boolean;
}