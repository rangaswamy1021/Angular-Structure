export interface IFeeRequest {
    Id: number,
    FeeName: string,
    FeeCode: string,
    FeeFactor: string,
    Amount: string,
    Desc: string
    DtStartEffDate: Date,
    
    DtEndEffDate: any,
    Factor: string,
    IsActive: boolean,
    PlanName: string,
    IsSelected: boolean,
    StartDate: Date,
    EndDate: Date,
    IsUpdated: boolean
}
