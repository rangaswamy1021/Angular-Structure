export interface IEmailResponse {
    Type: string;
    EmailAddress: string;
    IsVerified: boolean;
    IsPreferred: boolean;
    FullName: string;
    SecondaryAddress: string;
    EmailPreference: string;
    RecordCount:number;
}