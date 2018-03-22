import { SacModule } from './sac/sac.module';

import { SearchModule } from './csc/search/search.module';
import { ViolatorContextService } from './shared/services/violator.context.service';
import { CustomerContextService } from './shared/services/customer.context.service';
import { AdditionalContactsComponent } from './csc/customerservice/additional-contacts.component';
import { AdjustmentRequestsComponent } from './csc/customeraccounts/adjustment-requests.component';
import { PaymentModesComponent } from './csc/customeraccounts/payment-modes.component';

import { UnidentifiedPaymentsService } from './csc/customeraccounts/services/unidentified-payments.service';
import { DashboardModule } from './sac/dashboard/dashboard.module';
import { CscModule } from './csc/csc.module';

import { GetTagsConfigurationsComponent } from './sac/configuration/get-tags-configurations.component';
import { VeppassesModule } from './csc/veppasses/veppasses.module';
import { FeesModule } from './sac/fees/fees.module';
import { ManageFeesComponent } from './sac/fees/manage-fees.component';
import { ViewPlansComponent } from './sac/plans/view-plans.component';
import { AccountSummaryComponent } from './csc/customerdetails/account-summary.component';
import { ReOpenAccountComponent } from './csc/customeraccounts/re-open-account.component';
import { RefundRequestComponent } from './refunds/refund-request.component';
import { InvoicesSearchComponent } from './csc/search/invoices-search.component';
import { ManageGiftCertificatesComponent } from './csc/giftcertificates/manage-gift-certificates.component';

import { element } from 'protractor';
import { Http } from '@angular/http';
import { AdvanceCscSearchComponent } from './csc/search/advance-csc-search.component';

import { paymentChildren } from './payment/payment.route';
import { refundChildren } from './refunds/refund.route';
//import { vehicleChildren } from './vehicles/vehicle.route';
import { helpdeskChildrens } from './helpdesk/helpdesk.route';
import { GetTagDetailsComponent } from './tags/get-tag-details.component';
import { RequestNewTagsComponent } from './tags/request-new-tags.component';
import { AddTagComponent } from './tags/add-tag.component';
import { sharedChildren } from './shared/shared.route';
import { FooterComponent } from './layout/footer/footer.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlansModule } from './sac/plans/plans.module';
import { CustomeraccountsModule } from './csc/customeraccounts/customeraccounts.module';
import { CustomerdetailsModule } from './csc/customerdetails/customerdetails.module';
import { VehiclesModule } from './vehicles/vehicles.module';
//import { HelpDeskModule } from './helpdesk/helpdesk.module';
//import { RefundsModule } from './refunds/refunds.module';
import { GiftcertificatesModule } from './csc/giftcertificates/giftcertificates.module';
import { AddGiftCertificateComponent } from './csc/giftcertificates/add-gift-certificate.component';
//import { PaymentModule } from './payment/payment.module';
import { AuthGuard } from './common/guard.guard';
import { ActivitiesSearchComponent } from './csc/search/activities-search.component';
import { BasicSearchComponent } from './csc/search/basic-search.component';
import { routes } from './app.routing';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { UiElementsComponent } from './common/ui-elements/ui-elements.component';
//import { TransactionsModule } from './transactions/transactions.module'
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from "@angular/http";
import { LayoutModule } from './layout/layout.module';
import { LayoutComponent } from './layout/layout.component';
import { MenuComponent } from './layout/menu/menu.component';
import { TagsModule } from "./tags/tags.module";
import { NgxPaginationModule } from 'ngx-pagination';
import { BsDatepickerModule, PopoverModule, TabsModule } from 'ngx-bootstrap';
import { DateTimePickerModule } from 'ng-pick-datetime';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { HttpService } from "./shared/services/http.service";
import { ConfigurationModule } from "./sac/configuration/configuration.module";

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './shared/services/interceptor';
import { CommonService } from './shared/services/common.service';


import { CustomerserviceModule } from "./csc/customerservice/customerservice.module";
import { DocumentsModule } from "./csc/documents/documents.module";
import { DeLinkDocumentComponent } from './csc/documents/de-link-document.component';
import { LinkDocumentComponent } from './csc/documents/link-document.component';

import { SessionService } from './shared/services/session.service';
import { SharedModule } from "./shared/shared.module";
import { ImcModule } from "./imc/imc.module";
import { AmChartsModule } from "@amcharts/amcharts3-angular";
import { LoginModule } from './login/login.module';
import { InvoicesModule } from './invoices/invoices.module';
import { FmcModule } from "./fmc/fmc.module";
import { AccountGroupsComponent } from "./fmc/configuration/account-groups.component";
import { entryPoints } from "./route-mappings";
import { ExceptionlistsModule } from './csc/exceptionlists/exceptionlists.module';
import { ModuleComponent } from './sac/module.component';
import { CurrencyPipe } from "@angular/common";
//import { SelectiveStrategy } from './preload-strategy.service';
import { RpcModule } from "./rpc/rpc.module";


@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes,{useHash:true }),//preloadingStrategy: SelectiveStrategy
    LoginModule,
    HttpClientModule,
    FormsModule,
    HttpModule,
    NgxPaginationModule,
    DateTimePickerModule ,
    BrowserAnimationsModule,
    SharedModule,
    ReactiveFormsModule,
    HttpModule,
    LayoutModule,
    AmChartsModule,
    BsDatepickerModule.forRoot(),
    PopoverModule.forRoot(),
    TabsModule.forRoot(),
    RpcModule
  ],
  declarations: [
    AppComponent,
    UiElementsComponent,
    ModuleComponent,
    ],

  providers: [AuthGuard,ViolatorContextService,CustomerContextService,HttpService,CommonService,
    SessionService,UnidentifiedPaymentsService,//SelectiveStrategy,
    {provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true},CurrencyPipe],
  entryComponents: entryPoints,
  bootstrap: [AppComponent]
})
export class AppModule {

}
