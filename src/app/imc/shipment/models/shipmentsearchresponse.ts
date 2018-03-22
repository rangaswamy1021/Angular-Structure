export interface IShipmentSearchResponse {

    OrderNumber:string,
	ShipmentStatus:string,
	StartDate:number,
	EndDate:number,
	PageNumber:number,
	PageSize:number,
	SortColumn:string,
	SortDirection:boolean,
	User:string,
	UserId:number,
	LoginId: number,
	ActivitySource: string,
	OnSearchClick: boolean,
	RecCount: number,
	OnPageLoad: boolean,
	OrderDate:Date,
	CompanyName:string,
	VendorId:number,
	ContractNumber:string,
	length:number,
	RecordCount:number

}