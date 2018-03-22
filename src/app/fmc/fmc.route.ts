import { ManualJournalEntriesApprovalComponent } from './accounting/manual-journal-entries-approval.component';
import { ManualJournalEntriesComponent } from './accounting/manual-journal-entries.component';
import { AccountGroupsComponent } from "./configuration/account-groups.component";
import { AccountSubGroupsComponent } from "./configuration/account-sub-groups.component";
import { CategoryTypesComponent } from "./configuration/category-types.component";
import { CostCenterCodesComponent } from "./configuration/cost-center-codes.component";
import { PeriodCloseComponent } from "./configuration/period-close.component";
import { ManagePeriodsComponent } from "./configuration/manage-periods.component";
import { ManageFiscalYearComponent } from "./configuration/manage-fiscal-year.component";
import { TrailBalanceComponent } from "./accounting/trail-balance.component";
import { GeneralLedgerComponent } from "./accounting/general-ledger.component";
import { GeneralJournalComponent } from "./accounting/general-journal.component";
import { SpecialJournalComponent } from "./accounting/special-journal.component";
import { AuthGuard } from "../common/guard.guard";
import { ManageBusinessProcessesComponent } from "./configuration/manage-business-processes.component";
import { ManageSpecialJournalsComponent } from "./configuration/manage-special-journals.component";
import { TransactionTypeHistoryComponent } from "./configuration/transaction-type-history.component";
import { ManageTransactionTypesComponent } from "./configuration/manage-transaction-types.component";
import { ClerkDashboardComponent } from "./dashboard/clerk-dashboard.component";
import { DirectorDashboardComponent } from "./dashboard/director-dashboard.component";
import { ManagerDashboardComponent } from "./dashboard/manager-dashboard.component";
import { FmcCreditCardComponent } from "./reconciliation/fmc-credit-card.component";
import { FinanceByCategoryComponent } from "./reconciliation/finance-by-category.component";
import { TagDepositComponent } from "./reconciliation/tag-deposit.component";
import { TransactionComponent } from "./reconciliation/transaction.component";
import { TransactionRevenueComponent } from "./reconciliation/transaction-revenue.component";
import { TransactionsByAccountComponent } from "./reconciliation/transactions-by-account.component";
import { AddCashDetailsComponent } from "./cashmanagement/add-cash-details.component";
import { CashDetailsReportComponent } from "./cashmanagement/cash-details-report.component";
import { CloseFiscalYearComponent } from "./accounting/close-fiscal-year.component";
import { ManageBusinessProcessCodesComponent } from "./configuration/manage-business-process-codes.component";
import { ManageChartOfAccountsComponent } from "./accounting/manage-chart-of-accounts.component";

export const fmcChidrens = [
    {
        path: "configuration",

        children: [
            {
                path: 'account-groups',
                component: AccountGroupsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'account-sub-groups',
                component: AccountSubGroupsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'category-types',
                component: CategoryTypesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'cost-center-codes',
                component: CostCenterCodesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-periods',
                component: ManagePeriodsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-fiscal-year',
                component: ManageFiscalYearComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-business-process-codes',
                component: ManageBusinessProcessCodesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'period-close',
                component: PeriodCloseComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-special-journals',
                component: ManageSpecialJournalsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'transaction-type-history',
                component: TransactionTypeHistoryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-transaction-types',
                component: ManageTransactionTypesComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "accounting",

        children: [
            {
                path: 'manage-chart-of-accounts',
                component: ManageChartOfAccountsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'general-ledger',
                component: GeneralLedgerComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'trail-balance',
                component: TrailBalanceComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'general-journal',
                component: GeneralJournalComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'special-journal',
                component: SpecialJournalComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manual-journal-entries',
                component: ManualJournalEntriesComponent,
                // canActivate:[AuthGuard]

            },
            {
                path: 'manual-journal-entries-approval',
                component: ManualJournalEntriesApprovalComponent,
                // canActivate:[AuthGuard]
            },
            {
                path: 'close-fiscal-year',
                component: CloseFiscalYearComponent,
                canActivate: [AuthGuard]
            }

        ]
    },
    {
        path: "dashboard",

        children: [
            {
                path: 'clerk-dashboard',
                component: ClerkDashboardComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'director-dashboard',
                component: DirectorDashboardComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manager-dashboard',
                component: ManagerDashboardComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "reconciliation",

        children: [
            {
                path: 'fmc-credit-card',
                component: FmcCreditCardComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'finance-by-category',
                component: FinanceByCategoryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'tag-deposit',
                component: TagDepositComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'transaction',
                component: TransactionComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'transaction-revenue',
                component: TransactionRevenueComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'transactions-by-account',
                component: TransactionsByAccountComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "cashmanagement",

        children: [
            {
                path: 'add-cash-details',
                component: AddCashDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'cash-details-report',
                component: CashDetailsReportComponent,
                canActivate: [AuthGuard]
            }
        ]
    }
];