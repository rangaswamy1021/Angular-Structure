import { TagRequestType } from "../constants";
import { ActivitySource, SubSystem } from "../../../shared/constants";

export interface ITagRequest {
    TagName: string,
    ReqCount: number,
    CustomerId: number,
    TagReqDate: Date,
    TagReqType: TagRequestType,
    TagPurchaseMethod: number,
    TagDeliveryMethod: number,
    TagPurchaseMethodCode: String,
    UserName: string,
    ActivitySource: ActivitySource,
    SubSystem: SubSystem,
    Mounting: string,
    Protocol: string
}