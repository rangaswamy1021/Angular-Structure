export interface IDiscountResponse{
    DiscountCode: string;
    DiscountName: string;
    Description: string;
    DiscountType: string;
    StartEffectiveDate: Date;
    EndEffectiveDate: Date;
    ReCount: number;
}