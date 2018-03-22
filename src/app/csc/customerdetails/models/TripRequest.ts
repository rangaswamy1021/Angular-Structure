export interface ITripRequest
{
    
   CustomerTripId :number, 

    
       TripId  :number, 
       ViolatorId:number;
     
     NValue  :number, 

     

     StartDate:Date;
    
       AccountId:number,  
       

       EndDate:Date;
       TransactiontypeCode:number;
    
       Entry_TolltxnId  :number, 

   
    
       Exit_TolltxnId  :number, 

    
   Entry_TripDateTime  : Date,

   
  Exit_TripDateTime   : Date,
 
    
       TripMethod : string, 
 
    
       TripType : string, 
 
   EntryLaneId  : number,

 
    EntryPlazaId  : number,

 
    
   ExitLaneId   : number,

    
    
   ExitPlazaId   : number,

 
    
       VehicleNumber   : string,

 
    
       VehicleId   : number,

 
    
       TagId   : number,
 
  TollAmount   : number,
 
   FeeAmounts   : number,
 
    
  DiscountAmount   : number,

     OutStandingAmount   : number,
 
    
     TripStageId : number,  

 
    
  TripStatusId   : number,
 
    
    //   TripStatusDate  : DateTimeFormat,
 
    
    // PostedDate   : DateTimeFormat,

 
    
       CreatedUser : string, 
 
    
       StatusName  : string, 

    
    
  StatusDate : number, 

 
    
     ComplaintId  :  number,

   
    
  ProblemId : number, 

    
    
       UpdatedUser  : string,
 
       SortDirection?:number,
       TripStatusCode : string, 

    
       SortColumn : string, 
    
    SortDir  : number,
    
    PageNumber  : number,
    
 PageSize  : number,

   
    
     IsPageLoad  : boolean,

  
    
 IsSearchEventFired  : boolean,
 
    
       LoginId  :number, 

 
    
       UserId  :number, 

   
    
      User  : string,

 
    
       ActivitySource  : string,
 
    
       CustTripIdCSV  : string,

 
    
       TollTransactionTypeCode  : string,
 
    
      TransactionAmount  : number

}