export interface IManageUserResponse
{
    UserId:number;
    IsActive:boolean;
    IsDefault:boolean;
    UserName:string;
    CreatedDate:Date;
    CreatedUser:string;
    UpdatedDate:Date;
    UpdatedUser:string;
    RoleId:number;
    SubSystems:string;
    Email:string;
    RoleName:string;
    SubSystemURL:string;
    NameType:string;
    FirstName:string;
    LastName:string;
    IsLocked:boolean;
    url:string;    
    DesignationLevels:string;
    SubsystemName:string;
    DesignationId:number;
    ParentDesignationId:number;
    LocationCode: string;
    LocationName: string;
}

