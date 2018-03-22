export interface IEmailResponse {
    CustomerId: number;
    EmailAddress: string;
    EmailMessage: string;
    EmailSubject: string;
    EmailInterface: string;
    SuccessStatus: number;
    AttemptCount: number;
    FromEmailAddress: string;
    CreatedUser: string;
    CreatedDate: Date;
    UpdatedUser: string;
    UpdatedDate: Date;
    Email_Queue_Id: number;
    ComplaintId: string;
    UserName: string;
    Password: string;
}