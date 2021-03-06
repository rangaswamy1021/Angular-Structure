export interface IManageTransactionTypeResponse {

    DrCr_Flag: boolean,
    TxnTypeDesc: string,
    ReasonCode: number,
    Amount: number,
    AdjustmentDate: Date,
    CustomerId: number,
    AccStatusId: number,
    AdjustmentReason: string,
    IsManualEntry: boolean,
    IsApprovedUser: boolean,
    IsApproved: string,
    ApprovedStatusDate: Date,
    TxnSourceId: number,
    StartDate: Date,
    EndDate: Date,
    AccountStatusCode: number,
    SortColumn: number,
    SortDir: string,
    PageNumber: number,
    PageSize: number,
    ReCount: number,
    TxnTypeId: number,
    TxnType: string,
    TxnDescription: string,
    TxnTypeCategoryId: number,
    TxnTypeCategoryName: string,
    StatementNote: string,
    CustomerNote: string,
    ViolatorNote: string,
    IsAutomatic: number,
    LevelId: number,
    Status: string,
    CreatedDtae: Date,
    UpdatedDate: Date,
    User: string,
    LevelAliasName: string,
    AdjustmentCategoryId: number,
    AdjustmentCategory: string,
    IsPaging: boolean,
    ChartofAccountids: string,
    DRCRFlags: string,
    SpecialJournalTypeId: number,
    SpecialJournalType: string,
    LineItemsId: number,
    ChartAccountDesc: string,

}