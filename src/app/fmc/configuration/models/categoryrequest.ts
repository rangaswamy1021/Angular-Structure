import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface ICategoryTypesRequest {
    pageSize: number,
    pageNumber: number,
    sortDir: number,
    sortColumn: string,
    reCount: number,
    categoryId: number,
    categoryName: string,
    categoryDesc: string,
    status: string,
    systemActivity: ISystemActivities
}
