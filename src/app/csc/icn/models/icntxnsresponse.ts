export interface IICNTxnsResponse {
    SerialNo: string;
    ItemType: string;
    HEXItemID: string;
    FacilityCode: string;
    ItemStatus: string;
    ReCount: number;
}

export interface ICNTxns
{
    ICNId:number;
    SerialNo:number;
    InventoryId:number;
    UserId:number;
    ItemType:string;
    HEXItemID:string;
    FacilityCode:string;
    ItemId:string;
    ItemStatus:string;
    ItemAssignedCount:number;
    ItemReturnedCount:number;
    ReCount:number;
}