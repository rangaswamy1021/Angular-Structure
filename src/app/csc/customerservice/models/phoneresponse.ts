export interface IPhoneResponse{
    PhoneId: number;
    CustomerId: number;
    Type: string;
    Description: string;
    PhoneNumber: string;
    IsCommunication: boolean;
    Extension: string;
    UserName: string;
    IsActive: boolean;
    IsPhoneNumberChanged: boolean;
    IsActiveChanged: boolean;
    IsCommunicationChanged: boolean;
    IsExtensionChanged: boolean;
    IsVerified: boolean;
}