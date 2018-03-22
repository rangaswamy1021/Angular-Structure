import { PaymentMode } from "../../../payment/constants";
import { ICNStatus } from "../constants";

export interface ICNDetails  {
ICNId:number;
// TollPlus.TBOS.Enums.ICNStatus 
ICNStatus:ICNStatus
UserId:number;
UserName:string;
CreatedUser:string;
CreatedDate:any;
UpdatedDate:any;
UpdatedUser:string;
RoleId:number;
RoleName:string;
LoginId:number;
CustomerID:number;
LinkSource:string
}