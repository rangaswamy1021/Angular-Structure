import { IViolationFeesResponse } from "./violationfeeresponse";

export interface IVioAmountsResponse {
    TripId: number;
    CitationId: number;
    Tollfee: number;
    AdjTollfee: number;
    FineFee: number;
    AdjFineFee: number;
    AdjTotalFee: number;
    objViolationFees: IViolationFeesResponse[];
    TotalFee: number;
    checkedStatus: boolean;
    ViolatorID: number;
    AdjustedAmount: number;
    CitationStatus: string;
    CitationStage: string;
    CitationType: string;
    HoldType: string;
    Ishold: boolean;
    VehicleId: number;
    FeeToggle:boolean;
    TotalAdjustedTripsAmount:number;
    TotalAdjustedPenaltyAmount:number;
    TotalAdjustedTripsPenaltyAmount:number;
    boolShowFee:boolean;
    boolDisableFeeAll:boolean;   
    TotalTripsPenaltyAmount:number;
}