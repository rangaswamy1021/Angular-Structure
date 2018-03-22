import { ISystemActivities } from './../../shared/models/systemactivitiesrequest';
export class IAttachmentCourtResponse {
    AttachmentId:number;
    CourtCustId:number;
    CustomerId:number;
    UserName:string;
    Date:any;
    FileName:string;
    Path:string;
    DocumentType:string;
    Action:string;
    TripId:number;
    OldFileName:string;
    SystemActivity: ISystemActivities;
}


       