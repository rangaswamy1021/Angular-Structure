
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
import { IPaging } from "../../../shared/models/paging";

export interface IDocumentsRequest {
    CustomerId : number;
    InterfaceId: number;
    BoundType:string;
    DocumentType:string;
    DocumentStatus:string;
    Keywords:string;
    InterfaceSource:string;
    NoticeNumber:string;
    CreatedUser: string;
    UpdatedUser: string;
    Notes: string;

    Status:string;
    Paging :IPaging;
    SystemActivities: ISystemActivities
    documentFolder:string;
    DocumentName:string;
    documentName: string;
    description:string;
    customerName:string;
    loginId:number;
    role:string;
    documentType:string;
    accountName:string;

    LoginId: number;
    UserId: number;
    ActivitySource: string;
    PerformedBy: string;

    GeneratedDate: Date;
    QueueId: number;
    SubSystem: string;
    DocumentPath: string;
    DocumentLocation: string;


}
