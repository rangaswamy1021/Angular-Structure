import { ISystemActivities } from "./../../../shared/models/systemactivitiesrequest";
import { IPaging } from "./../../../shared/models/paging";

export interface ICostCenterCodeRequest {
    systemActivities: ISystemActivities;
    costCenterCodeId: string,
    costCenterCode: string,
    description: string,
    user: string,
    sortColumn: string,
    sortDir: number,
    pageNumber: number,
    pageSize: number,
    ReCount: number
}