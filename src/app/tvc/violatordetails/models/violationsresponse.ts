export interface ICitationInfo {
  AuditStatus: string;
  Citation_Stage: string;
  Citation_Status: string;
  Citation_Type: string;
  CreatedDate: Date;
  TripStatusDate: Date;
  UserName: string;
  CustomerId: number
  TripId: number;
  PaymentStatus: string;
  OutstandingAmount: number;
  CitationId: number;
  VehicleNumber: string;
  VehicleId: number;
  StageModifiedDate: Date;
  TripStatusId: number;
  VehicleState: string;
  TollAmount: number;
  FeeAmounts: number;
  EntryTripDateTime: Date;
  ReasonDesc: string;
  TemplateName: string;
  //IList<TollPlus.TBOS.ServiceDataContract.VehicleContract.Response.Vehicle> objVehicleDetails { get; set; }
  //IList<TollPlus.TBOS.ServiceDataContract.TVC.Response.ImageDetails> objImageDetails { get; set; }
  Make: string;
  Model: string;
  Color: string;
  Year: number;
  ProblemId: number;
  PlazaName: string;
  LaneName: string;
  VioBalance: number;
  Location_Name: string;
  Location: string;
  LocationName: string;
  IsHold: boolean;
  HoldType: string;
  ExitPlazaName: string;
  ExitLaneName
  ExitTripDateTime
}