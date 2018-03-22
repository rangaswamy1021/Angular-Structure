import { ISubCycles } from "./SubCycles";

export interface ILoadBalanceTypes {
    LoadBalTypeId: number
    StatementType: string
    CycleType: string
    CriteriaType: string
    SubCycles: number
    SubCyclesList: ISubCycles[]
    CreatedUser: string
}