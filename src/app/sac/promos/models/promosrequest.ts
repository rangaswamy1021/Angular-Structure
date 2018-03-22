import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface IPromosRequest {
    PROMONAME: string
    PromoStatus: string
    PROMOCODE: string
    PROMODESCRIPTION: string
    FACEVALUE: number
    PROMOFACTOR: string
    MAXQUANTITY: number
    STATUS: number
    STARTEFFECTIVEDATE: any
    ENDEFFECTIVEDATE: any
    CREATEDDATE: Date
    CREATEDUSER: string
    UPDATEDDATE: Date
    UPDATEDUSER: string
    SystemActivity: ISystemActivities
    PageNumber:number
    PageSize:number
    SortColumn:string
    SortDir:number;
}