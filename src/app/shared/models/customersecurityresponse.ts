export interface ICustomerSecurityResponse {
    UserName: string,
    Password: string,
    Pin: number,
    Question: string,
    Answer: string,
    FirstName: string,
    LastName: string,
    PasswordAttemptsCount: number,
    AccountId: number
}