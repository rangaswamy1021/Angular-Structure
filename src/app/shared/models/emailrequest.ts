import { IPaging } from "./paging";

export interface IEmailRequest {
    CustomerId: number;
    EmailAddress: string;
    UserName: string;
    EmailInterface: string;
    EmailSubject: string;
    CreatedUser: string;
    CreatedDate: Date;
    Attachement: string;
    ActivitySource: string;
    SubSystem: string;
    Type: string;
    IsPreferred: boolean;
    IsValid: boolean;
    IsActivityRequired: boolean;
    Paging: IPaging;
    CheckBlockList:boolean;  
}