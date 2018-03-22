export interface IPrivilegesResponse {
    RoleId: number,
    ActionId: number,
    ActionName: string,
    ActionDescription: string,
    FeatureId: number,
    FeatureName: string,
    DisplayName: string,
    CreatedDate: Date,
    UpdatedDate: Date,
    CreatedUser: string,
    UpdatedUser: string,
    IsActive: boolean,
    IsAllowAudit: boolean,
    SubSystem: string
}

export interface IPrivilegeWrapper {
    Features: IFeature,
    User: string,
    UserId: number,
    LoginId: number,
    ActionCode: string,
    RoleId: number
}

export interface IFeature {
    FeatureId: number
    Actions: Action[],
    FeatureName: string
    DisplayName: string
    IsAllActionAvailable: boolean
}

export interface Action {
    ActionId: number
    ActionName: string
    ActionDescription: string
    IsActionAssigned: boolean
    FeatureId:number
}
