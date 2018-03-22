import { ISystemActivities } from './../../../shared/models/systemactivitiesrequest';

export interface IDashBoardRequest {
    systemactivities: ISystemActivities;
    Date: any,
    CurrencySymbol: string,
    DashBoardTitle: string,
    RollUpLevel: string,
    UserId: number,
    LoginId: number,
    IsViewed: boolean,
    IsSearch: boolean,
    User: string,
    ActivitySource: string
}
