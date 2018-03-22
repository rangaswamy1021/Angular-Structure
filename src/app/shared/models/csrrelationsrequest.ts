import { IPaging } from './paging';
export interface ICSRRelationsRequest {
   InternalUserId: number;
   CustomerIds: string;
   TagIds: string;
   VehicleNumbers: string;
   CreatedUser: string;
   UpdatedUser:string;
   UserName: string;
   UserId: number;
   LoginId: number;
   Paging:IPaging;
}