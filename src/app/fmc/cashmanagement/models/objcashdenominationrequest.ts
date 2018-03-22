
export interface IcashDenominationRequest {
    Hundreds: number,
    Fifties: number,
    Twenties: number,
    Tens: number,
    Fives: number,
    Twos: number,
    Ones: number,
    Halfs: number,
    Quarters: number,
    Dimes: number,
    Nickles: number,
    Pennies: number,
    Type: any,
    ICNCashId:number,
    Source:string,
    ChangeFundID:number,
    FloatAmount:number,
    CRDRFlag:string,
    FundDate:Date,
    LinkSource:string,
    User:string,
    CreatedUser:string,
    UpdatedUser:string
    
}