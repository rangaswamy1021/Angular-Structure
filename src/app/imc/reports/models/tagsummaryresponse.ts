
export interface ITagSummaryResponse {
    TagStatus: string;
    Location: string;
    LocationId: number;
    TagStatusId: number;
    PlanType: string;
    PlanId: number;
    CustomerLocationCount: number;
    DestroyedObsoleteCount: number;
    DestroyedDisposalCount: number;
    VendorReturnLocationCount: number;
    MissingLocationCount: number;
    ShippedLocationCount: number;
    InventoryRetailerLocationCount: number;
    InventoryLocationCount: number;
    POId: number;
    ReturnPOId: number;
    ReturnPOName: string;
    ReturnPODate: Date;
    ReturnItemCount:number;

    // AccountStatus: string;
    // CustomerPlan: string;
    // UserId: number;
    // LoginId: number;
    // User: string;
    // FeaturesCode: string;
    // ActivitySource: string;
}