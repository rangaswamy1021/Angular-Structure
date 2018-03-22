import { FeesFactor } from "../constants";
export interface IFeeTypesResponse
{
    	FeeName :string,
		FeeDescription :string,
		Amount :string,
		FeeTypeId :number,
		StartDate :Date,
		EndDate :Date,
		CreatedDate :Date,
		UpdatedDate :Date,
		FeeCode:string,
		IsActive :boolean,
		FeeFactor :FeesFactor,
		RecordCount :number,
		IsFeeAppliedatCreateAccount :boolean,
		IsSelected:boolean		
}