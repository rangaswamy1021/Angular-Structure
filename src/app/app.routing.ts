
import { cscRoutes } from './csc/csc.route';
import { AuthGuard } from './common/guard.guard';
import { AdvanceCscSearchComponent } from './csc/search/advance-csc-search.component';
import { PayByPlateListComponent } from './csc/customeraccounts/pay-by-plate-list.component';
import { PayAAdvanceTollsComponent } from './csc/search/pay-a-advance-tolls.component';
import { CscDashboardComponent } from './csc/dashboard/csc-dashboard.component';
import { CloseAccountComponent } from './csc/customerservice/close-account.component';
import { VepPassDetailsComponent } from './csc/veppasses/vep-pass-details.component';
import { ContactInformationComponent } from './csc/customerdetails/contact-information.component';
import { UpdatePlansComponent } from './sac/plans/update-plans.component';
import { CreatePlansComponent } from './sac/plans/create-plans.component';
//import { vehicleChildren } from './vehicles/vehicle.route';
import { helpdeskChildrens } from './helpdesk/helpdesk.route';
import { refundChildren } from './refunds/refund.route';
//import { sacChildrens } from './sac/sac.route';
import { paymentChildren } from './payment/payment.route';
import { BasicSearchComponent } from './csc/search/basic-search.component';
import { UiElementsComponent } from './common/ui-elements/ui-elements.component';
import { Routes, CanActivate } from '@angular/router';
import { GetTagDetailsComponent } from "./tags/get-tag-details.component";
import { RequestNewTagsComponent } from "./tags/request-new-tags.component";
import { AddTagComponent } from "./tags/add-tag.component";
import { AddAddressComponent } from './shared/address/add-address.component';
import { sharedChildren } from './shared/shared.route';
import { LoginComponent } from './login/login.component';
import { imcChildren } from "./imc/imc.route";
import { tvcChildren } from "./tvc/tvc.route";
import { fmcChidrens } from "./fmc/fmc.route";
import { TvcDashboardComponent } from "./tvc/tvcdashboard/tvc-dashboard.component";
import { InvoiceDetailsComponent } from "./invoices/invoice-details.component";
import { ForgotPasswordComponent } from "./login/forgot-password.component";
import { ChangePasswordComponent } from './login/change-password.component';
import { UserProfileUpdateComponent } from './login/user-profile-update.component';
import { Error404Component } from "./shared/error-404.component";
import { UnauthorizedAccessComponent } from "./shared/unauthorized-access.component";
import { courtChildrens } from './court/court.route';

export const routes: Routes = [
{   path: 'ui-elements', 
    component: UiElementsComponent,
    
},
{
    path: '',
    pathMatch: "full",
    redirectTo: '/login',
},
{
    path: 'login',
    component: LoginComponent,
},
{
    path: 'forgot-password',
    component: ForgotPasswordComponent
},
{
    path: 'change-password',
    component: ChangePasswordComponent
},
{
    path: 'user-profile-update',
    component: UserProfileUpdateComponent
},
{
    path: 'csc',
    //data: { preload: true },
    loadChildren: './csc/csc.module#CscModule'
},
{
    path: 'imc',
    loadChildren: './imc/imc.module#ImcModule'
},
{
    path: 'tvc',
    loadChildren: './tvc/tvc.module#TvcModule'
},
{
    path: 'fmc',
    loadChildren: './fmc/fmc.module#FmcModule'
},
{
    path: 'invoices',
    loadChildren: './invoices/invoices.module#InvoicesModule'
},
{
    path: 'tags',
    loadChildren: './tags/tags.module#TagsModule'
},
{
    path: 'unauthorized',
    component: UnauthorizedAccessComponent,
},
// {
//     path: 'csc/helpdesk',
//     loadChildren: './helpdesk/helpdesk.module#HelpDeskModule'
// },
// {
//     path: 'tvc/helpdesk',
//     loadChildren: './helpdesk/helpdesk.module#HelpDeskModule'
// },
// {
//     path: 'payment',
//     loadChildren:'./payment/payment.module#PaymentModule'
// },
// {
//     path: "tags",
//     children: [
//         {
//             path: 'get-tag-details/:id',
//             component: GetTagDetailsComponent
//         }
//     ]
// },
// {
//     path: "invoices",
//     children: [
//         {
//             path: 'invoices/invoice-details/:id',
//             component: InvoiceDetailsComponent
//         }
//     ]
// },
{
    path: 'sac',
    loadChildren: './sac/sac.module#SacModule'
},
{
    path: 'court',
    loadChildren: './court/court.module#CourtModule'
},
{
    path: '404',
    component: Error404Component
},
{
    path: '**',
    redirectTo: '404'
},

];


