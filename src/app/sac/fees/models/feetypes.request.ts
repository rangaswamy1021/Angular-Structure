import { IPaging } from "../../../shared/models/paging";

export interface IFeeTypesRequest {
    LoginId: number,
    UserId: number,
    FeeName: string,
    FeeDescription: string,
    Amount: string,
    FeeTypeId: number,
    StartDate,
    EndDate,
    CreatedDate: Date,
    UpdatedDate: Date,
    PerformedBy: string,
    ActivitySource: string,
    FeeCode: string,
    IsActive: boolean,
    Operation: string,
    FeeFactor: string,
    Paging: IPaging,
    Status: string,
    IsFeeAppliedatCreateAccount: boolean,
    IsSelected: string,
    FeeNamerow_no: Date,
    FeeCoderow_no: Date
}