// import { FeesFactor } from "../../fees/constants";

export interface IEligibilityDetailsRequest {
    DiscountId: number,
    EligibilityId: number,
    Criteria: string,
    CriteriaType: string,
    DataType: string,
    MinRange: any,
    MaxRange: any,
    UpdateUser: string
}