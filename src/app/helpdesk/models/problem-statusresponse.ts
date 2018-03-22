export interface IProblemStatusResponse {
    Status: string;
    Assigned: string;
    Inprogress: string;
    Rejected: string;
    Resolved: string;
    Opened: string;
    Merge: string;
    Closed: string;
    Onhold: string;
    Reassigned: string;
    Reopened: string;
    Transferred: string;
    TicketId: string;
    IsAllowed: boolean;
    secondReviewRequired: string;
    DesignationId: number;
}
