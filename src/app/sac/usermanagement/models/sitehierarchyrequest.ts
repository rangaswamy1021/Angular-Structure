export interface ISiteHierarchyRequest {
    SiteId: number,
    SiteIdCSV: string,
    SiteName: string,
    SiteFqn: string,
    ContainerType: string,
    ParentSiteId: number,
    SiteDesc: string,
    CreatedUser: string,
    UpdatedUser: string,
    HierarchbyId: string,
    Depth: number,
    IsAllowed: number,
    IsDefault: boolean
    UserId: number,
    LoginId: number,
    ActionCode: string,
}