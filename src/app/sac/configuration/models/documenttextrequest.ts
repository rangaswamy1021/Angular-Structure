
export interface IDocumenttextRequest {
    DocumentType: string,
    DocumentsText: string,
    IncludeInDocument: boolean,
    CreatedUser: string,
    LoginId: number,
    UserId: number,
    PerformedBy: string,
    ActivitySource: string,
    ViewFlag: string,
    InvoiceTextID: number,
    SortColumn: string,
    SortDir: number,
    PageNumber: number,
    PageSize: number    
}