

import { IcashDenominationRequest } from "./objcashdenominationrequest";
import { IcreatedUserRequest } from "./objchangefundRequest";
import { IPaging } from "../../../shared/models/paging";


export interface IaddCashDetailsRequest {
    objChangeFund: IcreatedUserRequest,
    objCashDenomination: IcashDenominationRequest,
    objPaging: IPaging,
    Date,
  
}