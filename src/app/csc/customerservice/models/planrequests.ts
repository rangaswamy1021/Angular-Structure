import { ActivitySource, SubSystem, TollType } from "../../../shared/constants";
import { IAddressRequest } from "../../../payment/models/addressrequest";
import { ITagRequest } from "./tagrequest";
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";


export interface IPlanRequests {
    AccountId: number,
    OldPlanId: number,
    Code:string,
    NewPlanId: number,
    UpdateUser: string,
    OldPlanDesc: string,
    NewPlanDesc: string,
    ActivitySource: ActivitySource,
    Subsystem: SubSystem,
    IsTagRequired: boolean,
    TotalRequiredAmount: number,
    TollType: TollType,
    NewTollType: TollType,
    StatementCycle: string,
    InvoiceIntervalId: number,
    InvoiceAmount: number,
    InvoiceDay: number,
    TagDeliveryMethod: string,
    ShipmentAddress: IAddressRequest[],
    PlanId: number,
    ilTagRequest: ITagRequest[],
    SystemActivities:ISystemActivities,
    OtherPlanFee:number    
}