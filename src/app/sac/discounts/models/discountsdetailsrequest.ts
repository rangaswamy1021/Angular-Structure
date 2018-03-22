import { FeesFactor } from "../../fees/constants";

export interface IDiscountDetailsRequest {
    MinRange: number;
    MaxRange: number;
    MinValue: number;
    MaxValue: number;
    Factor: FeesFactor;
    UpperLimit: number;
    DiscountValue: number;
}