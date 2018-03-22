
export interface IDiscountResponse {
    DiscountId: number;
    AvailedDiscountId: number;
    DiscountName: string;
    Description: string;
    StartEffectiveDate: Date;
    
    EndEffectiveDate: any;
    Isactive: boolean;
    AccessLevel: number;
    DiscountCode: string;
    MinRange: string;
    MaxRange: string;
    Factor: string
    UpperLimit: string
    PlanId: number;
    DiscountValue: string;
    IsSelected: boolean;
    DisNamerow_no: Date;
    DisCoderow_no: Date;
}