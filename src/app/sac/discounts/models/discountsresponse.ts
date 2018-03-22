import { DiscountType, Subsystem } from "../../constants";
import { ActivitySource } from "../../../shared/constants";
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
import { IPaging } from "../../../shared/models/paging";
import { IDiscountDetailsResponse } from "./discountsdetailsresponse";
import { IEligibilityDetailsRequest } from "./eligibilityDetailsrequest";

export interface IDiscountResponse {
    DiscountId: number;
    DiscountName: string;
    Description: string;
    StartEffectiveDate: Date;
    EndEffectiveDate: Date;
    DiscountType: DiscountType;
    Isactive: boolean;
    AccessLevel: number;
    DiscountCode: string;
    DiscountDetails: IDiscountDetailsResponse;
    EligibilityDetails: IEligibilityDetailsRequest;
    PerformBy: string;
    SubSystem: Subsystem;
    ActivitySource: ActivitySource;
    SystemActivity: ISystemActivities;
    Paging: IPaging;
    ListDiscountDetails: IDiscountDetailsResponse[];
    Fee: number;
    Duration: number;
    DiscountFactor:string
}