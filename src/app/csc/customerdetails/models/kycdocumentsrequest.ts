export interface IKYCDocumentRequest {
    DocumentCategory: string;
    DocumentCategoryDesc: string;
    DocumentNumber: string;
    DocumentPath: string;
    DocumentStatus: string;
    DocumentStatusDate: Date;
    Description: string;
    DocumentType: string;
    IsReceived: boolean;
    IsUploaded: boolean;
    ReceivedDate: Date;
    VerifiedDate: Date;
    UploadedDate: Date;
    IsDocumentProofChanged: boolean;
    LoginId: number;
    UpdatedUser: string;
    UploadedBy: number;
    User: string;
    UserId: number;
    ActivitySource: string;
    CreatedUser: string;
    SubSystem: string;
}