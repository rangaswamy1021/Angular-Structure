import { FeesFactor } from "../../fees/constants";

export interface IDiscountDetailsResponse {
    MinRange: number;
    MaxRange: number;
    MinValue: number;
    MaxValue: number;
    Factor: FeesFactor;
    UpperLimit: number;
    DiscountValue: number;
    DiscountType: string;
    Id: number;
}