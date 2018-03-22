import { DiscountType, Subsystem } from "../../constants";
import { IDiscountDetailsRequest } from "./discountsdetailsrequest";
import { ActivitySource } from "../../../shared/constants";
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
import { IPaging } from "../../../shared/models/paging";
import { IEligibilityDetailsRequest } from "./eligibilityDetailsrequest";

export interface IDiscountRequest {
    DiscountId: number;
    DiscountName: string;
    Description: string;
    StartEffectiveDate;
    EndEffectiveDate;
    DiscountType: DiscountType;
    Isactive: boolean;
    AccessLevel: number;
    DiscountCode: string;
    DiscountDetails: IDiscountDetailsRequest[];
    EligibilityDetails: IEligibilityDetailsRequest[];
    PerformBy: string;
    SubSystem: Subsystem;
    ActivitySource: ActivitySource;
    SystemActivity: ISystemActivities;
    Paging: IPaging;
    Fee: number;
    Duration: number;
    DiscountFactor: string;
    IsSlab: boolean;
}