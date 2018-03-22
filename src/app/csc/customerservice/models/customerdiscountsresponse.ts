
import { SubSystem, ActivitySource } from "../../../shared/constants";
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
import { IPaging } from "../../../shared/models/paging";

export interface ICustomerDiscountResponse {
    DiscountId: number;
    AvailedDiscountId: number;
    DiscountName: string;
    Description: string;
    StartEffectiveDate: Date;
    EndEffectiveDate: Date;
    Isactive: boolean;
    AccessLevel: number;
    DiscountCode: string;
    MinRange: string;
    MaxRange: string;
    Factor: string
    UpperLimit: string
    PlanId: number;
    DiscountValue: string;
    DiscountType: string;
    PerformBy: string;
    SubSystem: SubSystem;
    ActivitySource: ActivitySource;
    SystemActivity: ISystemActivities;
    Paging: IPaging;
    IsSelected: boolean;
    StartDate: Date;
    EndDate: Date;
    DiscountDetails: DiscountDetail;
    
}

export class DiscountDetail{
    MaxRange: number;
}