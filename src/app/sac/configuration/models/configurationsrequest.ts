import { ConfigurationType, DataType } from "../../../shared/constants";

export interface IConfigurationRequest {
    LoginId: number;
    UserId: number;
    ParameterValue: string;
    ParameterId: number;
    ParamaterKey: string;
    Maxlength: number;
    MinLength: number;
    RegularExp: string;
    AllowedSplChars: boolean;
    isSpaceAllowed: boolean;
    ParameterName: string;
    MeasurementDescription: string;
    ParameterDescription: string;
    PerformedBy: string;
    Operation: string;
    ActivitySource: string;
    StartEffectiveDate: any;
    //ConfigType: ConfigurationType;
    ConfigType: string;
    DataType: DataType;
    //DataType: string;

}