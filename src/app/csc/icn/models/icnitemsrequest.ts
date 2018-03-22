import { ICNDetails } from "./icndetails";
import { ICNItemActionGroup } from "../constants";

export interface ICNItemsRequest extends ICNDetails {

    ItemCount: number;
    ItemActionGroup: ICNItemActionGroup
    ItemType: string;
    ICN_ItemId: number;
} 