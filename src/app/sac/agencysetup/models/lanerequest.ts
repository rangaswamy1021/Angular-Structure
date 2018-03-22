import { IPaging } from '../../../shared/models/paging';

export interface ILaneRequest {
    LocationCode: string;
    PlazaCode: string;
    LaneId: number;
    LaneCode: string;
    LaneName: string;
    LaneType: string;
    Direction: string;
    LaneStatus: string;
    Description: string;
    Flag: number;
    viewFlag: string;
    UserId: number;
    LoginId: number;
    PerformedBy: string;
    ActivitySource: string;
    Paging: IPaging;
}