export interface ICustomerProfileResponse {
    AccountId: number,
    FirstName: string,
    MiddleName: string,
    LastName: string,
    Gender: string,
    Title: string,
    Suffix: string,
    FullName: string,
    OrganisationName: string,
    UserName: string,
    DOB: Date,
    IsSubscribeNewsLetter: boolean,
    RecordCount: number,
    AccountStatus: string,
    AccountType: string,
    RevenueCategory: string,
    ParentId: number
    CreatedUser: string,
    CustomerParentPlan: string
    FullAddress: string;
    Phone: string;
    Email: string;
    AccountStatusDesc: string;
    IsOneTimeTollCustomer:boolean;
}