export interface IPurchaseOrderLineItemRequest {
    ItemId: number,
    ItemName: string,
    ItemQuantity: number,
    ItemPrice: string,
    LineItemAmount: string,
    UpdatedDate: Date,
    UpdatedUser: string,
    ItemDesc: string
}