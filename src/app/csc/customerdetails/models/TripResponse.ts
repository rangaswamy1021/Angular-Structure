export interface ITripResponse
{

      
         
       AccountId  : number, 

       
         
         CustomerTripId   : number, 

 
         
        TripId   : number, 

         
         
        // Entry_TripDateTime :DateTimeFormat,  

   
        //   Exit_TripDateTime  : DateTimeFormat,

       
         
            TripMethod   : string,
 
         
            TripType : string,  
 
         
            VehicleNumber  : string, 
 
         
            TagId   : string,

      
         
      TollAmount   : number,

       
  FeeAmounts : number,  

       DiscountAmount : number,  
       OutStandingAmount: number,   

    //  PostedDate   :DateTimeFormat,

     
         
            PlazaName  : string, 

     
         
       ReCount :number,  

  
         
        PageNumber: number,   

 
         
            LocationName   : string,
 
         
            EntryPlazaName   : string,

 
         
            ExitPlazaName   : string,

     
         
            // PaymentDate :DateTimeFormat , 
 
         
            TravelTime   :string,
 
 ProblemId   :number,
 
         
            ImagePath :string,  

         
            SmallImagePath   :string,
 
         
            ImageType   :string,

   
         
//  ImageDateTime   :DateTimeFormat,

   
         
            VehicleState   :string,

   
         
        VehicleId  : number,  

 
         
            VehicleColor   :string,

 
         
            VehicleMake   : string,

 
         
 VehicleModal   :string,

 
         
       VehicleYear    : number,



    
         
     VehicleConfidence   : number,
 
         
  StateConfidence   : number,

   
         
          TXNImageId   : number, 
 
         
            Year   : string,

    
         
            YearMonth  : string, 
 
        MonthlyUsage    : number, 

      
         
         DayWiseAvgToll   : number,  

 MonthlyWiseAvgToll    : number, 
 
         
 TripStatusId    : number, 


      
         
            EntryLaneName   : string,
 
         
            ExitLaneName    : string,

         
            LaneName    : string,

 
         
            ProblemStatus   : string,
 
         
            TripStatusCode   

        
         
    TripStageId  : number, 

         
        Selected   : boolean,

     
         
          UnPaidAmount: number,   


   
         
            PlanCode  :string, 
 
         
            PlanDescription  :string,  
 
         
       ParentPlanId  : number, 

     
            ParentPlanCode  : string, 

       
         
            ParentPlanDescription   : string,  


         
        PlanId : number,  
 
         
        OutstandingViolationsCount   : number, 

      
         
            TollTransactionTypeCode   : string,

         TransactionAmount: number   




}