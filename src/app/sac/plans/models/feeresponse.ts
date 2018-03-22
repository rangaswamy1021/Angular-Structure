export interface IFeeResponse {
    FeeName: string,
    FeeDescription: string,
    Amount: string,
    FeeTypeId: number,
    StartDate: Date,
    EndDate: Date,
    CreatedDate: Date,
    UpdatedDate: Date,
    FeeCode: string,
    IsActive: boolean,
    FeeFactor: string,
    RecordCount: number,
    IsFeeAppliedatCreateAccount: boolean,
    IsSelected: boolean
}