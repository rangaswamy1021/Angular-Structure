import { HelpDeskDashboardComponent } from './dashboard/help-desk-dashboard.component';
import { SacDashboardSettingsComponent } from './dashboard/sac-dashboard-settings.component';
import { ManageUsersComponent } from './usermanagement/manage-users.component';
import { ManageTollSchedulesComponent } from './tolls/manage-toll-schedules.component';
import { ManageTollRatesComponent } from './tolls/manage-toll-rates.component';
import { AgencyAdditionalInfoComponent } from './agencysetup/agency-additional-info.component';
import { AgencyRegistrationComponent } from './agencysetup/agency-registration.component';
import { ManageAgencyComponent } from './agencysetup/manage-agency.component';
import { AddTollSchedulesComponent } from './tolls/add-toll-schedules.component';
import { ManageRolesComponent } from './usermanagement/manage-roles.component';
import { CsrRelationsComponent } from './usermanagement/csr-relations.component';
import { Component } from '@angular/core';
import { paymentChildren } from './../payment/payment.route';
import { UpdateFeesComponent } from './fees/update-fees.component';
import { ManageFeesComponent } from './fees/manage-fees.component';
import { AddFeesComponent } from './fees/add-fees.component';
import { UpdatePlansComponent } from './plans/update-plans.component';
import { ViewPlansComponent } from './plans/view-plans.component';
import { AssignDiscountsToPlansComponent } from './plans/assign-discounts-to-plans.component';
import { AssignFeesToPlansComponent } from './plans/assign-fees-to-plans.component';
import { CreatePlansComponent } from './plans/create-plans.component';
import { GetTagsConfigurationsComponent } from "./configuration/get-tags-configurations.component";
import { UpdateTagsConfigurationComponent } from "./configuration/update-tags-configuration.component";
import { ManagePromosComponent } from './promos/manage-promos.component';
import { AuthGuard } from '../common/guard.guard';
import { ManagePrivilegesComponent } from './usermanagement/manage-privileges.component';
import { GeneralConfigurationsComponent } from "./configuration/general-configurations.component";
import { ManageTransactionTypesComponent } from "./usermanagement/manage-transaction-types.component";
import { ManagePagesComponent } from "./usermanagement/manage-pages.component";
import { ShipmentServiceTypesComponent } from "./plans/shipment-service-types.component";
import { ManageLanesComponent } from "./agencysetup/manage-lanes.component";
import { ManagePlazasComponent } from "./agencysetup/manage-plazas.component";
import { ManageVepPassesComponent } from "./tolls/manage-vep-passes.component";
import { PlazaRegistrationComponent } from "./agencysetup/plaza-registration.component";
import { PlazaAdditionalInfoComponent } from "./agencysetup/plaza-additional-info.component";
import { ManageDiscountsComponent } from "./discounts/manage-discounts.component";
import { ManageLocationsComponent } from './agencysetup/manage-locations.component';
import { PaymentPlanConfigurationsComponent } from "./configuration/payment-plan-configurations.component";
import { InvoiceAgingComponent } from "./workflow/invoice-aging.component";
import { IncludeMessageToInvoiceComponent } from "./configuration/include-message-to-invoice.component";
import { ManageInvoiceAgingComponent } from "./workflow/manage-invoice-aging.component";
import { BulkEmailsComponent } from "./configuration/bulk-emails.component";
import { ComplaintTurnAroundTimeComponent } from './configuration/complaint-turn-around-time.component';
import { HelpdeskManagersEmailSettingsComponent } from './configuration/helpdesk-managers-email-settings.component';
import { LowReplenishmentThreholdComponent } from "./configuration/low-replenishment-threhold.component";
import { OperationalLocationsComponent } from "./usermanagement/operational-locations.component";
import { LoadBalancingConfigurationsForMbsComponent } from "./configuration/load-balancing-configurations-for-mbs.component";
import { AuditLogFeaturesConfigurationComponent } from "./configuration/audit-log-features-configuration.component";

export const sacChildrens = [
    {
        path: "plans",
        children: [
            {
                path: 'view-plans',
                component: ViewPlansComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'create-plans',
                component: CreatePlansComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'update-plans/:id',
                component: UpdatePlansComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'assign-fees-to-plans/:status/:id',
                component: AssignFeesToPlansComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'assign-discounts-to-plans/:status/:id',
                component: AssignDiscountsToPlansComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'create-plans/:id',
                component: CreatePlansComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'shipment-service-types',
                component: ShipmentServiceTypesComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "fees",
        children: [
            {
                path: 'AddFeeType',
                component: AddFeesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-fees',
                component: ManageFeesComponent,
                canActivate: [AuthGuard]
            }
            ,
            {
                path: 'UpdateFeeType/:id',
                component: UpdateFeesComponent,
                canActivate: [AuthGuard]
            },
        ]
    },

    {
        path: "configuration",
        children: [
            {
                path: 'get-tags-configurations',
                component: GetTagsConfigurationsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'low-replenishment-threhold',
                component: LowReplenishmentThreholdComponent
            },
            {
                path: 'audit-log-features-configuration',
                component: AuditLogFeaturesConfigurationComponent,
                // canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "promos",
        children: [
            {
                path: 'manage-promos',
                component: ManagePromosComponent,
                canActivate: [AuthGuard]
            },

        ]
    },
    {
        path: "tolls",
        children: [
            {
                path: 'add-toll-schedules',
                component: AddTollSchedulesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'add-toll-schedules/:id/:status',
                component: AddTollSchedulesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-toll-schedules',
                component: ManageTollSchedulesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-toll-rates',
                component: ManageTollRatesComponent,
                canActivate: [AuthGuard]
            },

        ]
    },
    {
        path: "usermanagement",
        children: [
            {
                path: 'manage-privileges',
                component: ManagePrivilegesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-transaction-types',
                component: ManageTransactionTypesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-pages',
                component: ManagePagesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-roles',
                component: ManageRolesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'csr-relations',
                component: CsrRelationsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-users',
                component: ManageUsersComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'operational-locations',
                component: OperationalLocationsComponent,
                canActivate: [AuthGuard]
            },

        ]
    },
    {
        path: "configuration",
        children: [
            {
                path: 'general-configurations',
                component: GeneralConfigurationsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'bulk-emails',
                component: BulkEmailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'shipment-service-types',
                component: ShipmentServiceTypesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-vep-passes',
                component: ManageVepPassesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'payment-plan-configurations',
                component: PaymentPlanConfigurationsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'include-message-to-invoice',
                component: IncludeMessageToInvoiceComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'complaint-turn-around-time',
                component: ComplaintTurnAroundTimeComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'helpdesk-managers-email-settings',
                component: HelpdeskManagersEmailSettingsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'load-balancing-configurations-for-mbs',
                component: LoadBalancingConfigurationsForMbsComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "agencysetup",
        children: [
            {
                path: 'agency-registration',
                component: AgencyRegistrationComponent,

            },
            {
                path: 'manage-agency',
                component: ManageAgencyComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'agency-additional',
                component: AgencyAdditionalInfoComponent,

            },
            {
                path: 'agency-registration/:id',
                component: AgencyRegistrationComponent,

            },
            {
                path: 'manage-lanes',
                component: ManageLanesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-facilities',
                component: ManageLocationsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-plazas',
                component: ManagePlazasComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'plaza-registration',
                component: PlazaRegistrationComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'plaza-additional-info',
                component: PlazaAdditionalInfoComponent,
                canActivate: [AuthGuard]
            },
        ]
    },
    {
        path: "discounts",
        children: [
            {
                path: "manage-discounts",
                component: ManageDiscountsComponent,
                canActivate: [AuthGuard]
            }
        ]

    },

    {
        path: 'dashboard',
        children: [
            {
                path: 'help-desk-dashboard',
                component: HelpDeskDashboardComponent,
                // canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "workflow",
        children: [
            {
                path: "invoice-aging",
                component: InvoiceAgingComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "manage-invoice-aging",
                component: ManageInvoiceAgingComponent,
                canActivate: [AuthGuard]
            }
        ]

    }
];