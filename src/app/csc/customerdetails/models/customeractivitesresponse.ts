

import { IPaging } from '../../../shared/models/paging';

export interface ICustomerActivitesResponse {

    Type: string;
    Activity: string;
    ActivityTypeDescription: string;
    ActivityDate: Date;
    PerformedBy: string;
    Linkid: number;
    LinkSourceName: string;
    CustomerId: number;
    ActivityId: number;
    User: string;
    ActivitySource: string;
    Subsystem: string;

    CCExpireDate: string;
    CCNumber: string;
    ISExpired: string;
    LowBalanceFlag: string;
    Paging: IPaging;
    Recount: number;
}


