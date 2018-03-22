import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface IManageTransactionTypeRequest {
    PageNumber: number,
    PageSize: number,
    SortColumn: string,
    SortDir: number,
    ReCount: number,
    TxnTypeId: number,
    TxnType: string,
    TxnDescription: string,
    TxnTypeCategoryId: number,
    TxnTypeCategoryName: string,
    StatementNote: string,
    CustomerNote: string
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
    SystemActivities: ISystemActivities,
    UpdateTxntypeFlag: boolean
}


