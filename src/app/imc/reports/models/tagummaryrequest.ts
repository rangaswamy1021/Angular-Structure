import { TagRequestType } from "../../constants";

export interface ITagSummaryRequest {
    IsSearch: boolean,
    UserName: string,
    LoginId: number,
    UserId: number,
    IsSearchEventFired: boolean,
    ActivitySource: string,
    SubSystem: string,
    ActivityType: string,
    TagReqDate: string,
    ICNId: number,
    LocationId: number,
    TagStatusId: number,
    AccountStatus: string,
    CustomerPlan: string,
    TagStatus: string,
    User: string,
    FeaturesCode: string
}