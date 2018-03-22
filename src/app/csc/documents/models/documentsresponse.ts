import { IPaging } from "../../../shared/models/paging";

export interface IDocumentsResponse{
    DocumentType: string
    Description: string
    GeneratedDate: Date
    CommunicationDate: Date
    RecordCount: number

    CustomerId : number; 
    BoundType:string; 
    DocumentStatus:string;
    Keywords:string; 
    InterfaceSource:string; 
    NoticeNumber:string; 
    Status:string; 
    Paging :IPaging;
    DocumentId: number;
    DocumentName: string;
    DocumentLocation: string;
}