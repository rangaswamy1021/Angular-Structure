import { CashType } from "../constants";
import { ICNDetails } from "./icndetails";

export interface ICashDenomination extends ICNDetails {
          ICNCashId:number;
          Hundreds :number;
          Fifties :number;
          Twenties :number;
          Tens :number;
          Fives :number;
          Twos :number;
          Ones :number;
          Halfs :number;
          Quarters :number;
          Dimes :number;
          Nickles :number;
          Pennies :number;
          Type :CashType
          FundDate :Date
          CRDRFlag :string;
          FloatAmount :number;
          ChangeFundID :number;
          Source :string;
}