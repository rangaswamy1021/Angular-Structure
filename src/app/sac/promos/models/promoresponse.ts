export interface IPromosResponse {
    PROMOID: string
    PROMONAME: string
    PromoStatus: string
    PROMOCODE: string
    PROMODESCRIPTION: string
    FACEVALUE: number
    PROMOFACTOR: string
    PROMOFACTOR_CODE: string
    PROMOFACTOR_DESC: string
    MAXQUANTITY: number
    STATUS: string
    STARTEFFECTIVEDATE: Date
    ENDEFFECTIVEDATE: Date
    CREATEDDATE: Date
    CREATEDUSER: string
    UPDATEDDATE: Date
    UPDATEDUSER: string
    PageNumber:number
    PageSize:number
    SortColumn:string
    SortDir:number;
    ReCount:number;
}