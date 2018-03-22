

//import { Subsystem } from "../../../payment/constants";
import { ActivitySource } from "../../../shared/constants";
import { IPaging } from "../../../shared/models/paging";

export class IInOrOutBoundResponse {
    InboundCommunicationId: number;
    OutboundCommunicationId: number;
    CommunicationId: number;
    CustomerId: number;
    DocumentTypeId: number;
    DocumentTypeName: string;
    DocumentType: string;
    TotalCount: number;
    LoggedInUserId: number;
    CommunicationDate: Date;
    GeneratedDate: Date;
    Description: string;
    DocumentPath: string;
    FileType: string;
    InitiatedBy: string;
    CreatedUser: string;
    PerformedBy: string;
    BoundType: string;
    DocParametersList: string;
    SearchKeyword: string;
    QueueId: number;
    RecordCount: number;
    Subsystem: string;
    ActivitySource: string;
    IsActivityRequired: boolean;
    UserId: number;
    LoginId: number;
    SearchFlag: string;
    ViewFlag: string;
    StartDate: Date;
    EndDate: Date;
    DocumentStatus: string;
    Paging: IPaging;
}