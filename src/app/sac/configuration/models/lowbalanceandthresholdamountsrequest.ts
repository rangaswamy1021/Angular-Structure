export interface ILowBalanceandThresholdAmountsRequest {
    AmountSlabId: number;
    AmountType: string;
    MinSlab: number;
    MaxSlab: number;
    Amount: number;
    ReplenishType: string;
    IsDefault: boolean; 
}