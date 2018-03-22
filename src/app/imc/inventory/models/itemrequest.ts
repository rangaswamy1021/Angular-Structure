import { ActivitySource } from "../../../shared/constants";

export interface IItemRequest {
  ItemId: number,
  ItemCode: string,
  ItemName: string,
  ItemDesc: string,
  ItemTypeId: number,
  ItemPrice: string,
  CreatedUser: string,
  UpdatedDate: Date,
  UpdatedUser: string,
  VendorId: number,
  ThresholdCount: number,
  MinOrderLevel: number,
  MaxOrderLevel: number,
  MinDeliveryPeriod: number,
  MaxDeliveryPeriod: number,
  UserId: number,
  LoginId: number,
  User: string,
  SearchFlag: string,
  ActivitySource: string,
  Protocol: string,
  Mounting: string,
  TagDeposit: string,
  TagConfigId: number,
  PageNumber: number,
  PageSize: number,
  SortDirection: boolean,
  SortColumn: string,
  TagStatus: string,
  SerialNumber: number
  HexTagNumber: number
  TagLocation: string,
  ShipmentId: number,
  PurchaseOrderNumber: number,
  isSearch: boolean,

}


