import { IFeeRequest } from './feerequest';
import { ISystemActivities } from './../../../shared/models/systemactivitiesrequest';
import { IPaging } from './../../../shared/models/paging';
import { IFeeTypesRequest } from "../../fees/models/feetypes.request";
import { IDiscountRequest } from "./discountrequest";

export interface IPlanRequest {
    PlanId: number,
    Name: string,
    Code: string,
    Desc: string
    StartEffDate,
    EndEffDate,
    isFeeRequired: boolean
    UpdateUser: string
    AccountId: number
    OldPlanId: number
    NewPlanId: number
    OldPlanDesc: string
    NewPlanDesc: string
    ActivitySource: string, //ActivitySource,
    Subsystem: string,
    TollType: string
    NewTollType: string
    FeeTypeId: number,
    SystemActivities: ISystemActivities,
    FeeTypes: IFeeRequest[],//List<TollPlus.TBOS.ServiceDataContract.Fee.Request.Fee>
    IsTagRequired: boolean,
    Discounts: IDiscountRequest[],//List<TollPlus.TBOS.ServiceDataContract.Customer.Request.CustomerDiscount> Discounts
    Paging: IPaging,
    TotalRequiredAmount: string,
    TagDeliveryMethod: string,
    StatementCycle: string,
    CustRequestPlanId: number,
    InvoiceIntervalId: number,
    InvoiceAmount: string,
    InvoiceDay: string,
    chkDate: boolean
}