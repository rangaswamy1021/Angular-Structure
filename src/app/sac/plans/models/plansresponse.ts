import { IPaging } from './../../../shared/models/paging';


export interface IPlanResponse {
    PlanId: number,
    Name: string,
    Code: string,
    Desc: string
    StartEffDate: Date,
    EndEffDate: Date,
    PlanChangedDate: Date,
    IsParent: boolean,
    ParentId: number,
    Fee: string,//List<TollPlus.TBOS.ServiceDataContract.Fee.Response.Fee>
    isFeeRequired: boolean
    ParentPlanName: string,
    TotalFee: string,
    StatementCycle: string,
    InvoiceCycle: string,
    RequestPlanId: number,
    CustRequestDate: Date,
    CustReqId: number,
    UpdateUser: string,
    InvoiceIntervalId: number,
    ParentPlanCode: string,
    FeeDesc: string,
    DiscountDesc: string,
    Paging: IPaging,
    IsTagRequired: boolean,
    IsSelected:boolean
}