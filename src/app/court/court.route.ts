import { AuthGuard } from "../common/guard.guard";
import { PrecourtComponent } from "./precourt/precourt-selection.component";
import { PrecourtTrackingComponent } from "./precourt/precourt-tracking.component";
import { CourtselectionComponent } from "./court/courtselection.component";
import { SummarycomplaintComponent } from "./court/summarycomplaint.component";
import { CourttrackingComponent } from "./court/courttracking.component";


export const courtChildrens = [
    {
        path: "precourt",
        children: [
            {
                path: 'precourt-selection',
                component: PrecourtComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'precourt-tracking',
                component: PrecourtTrackingComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
    path: "court",
    children: [
        {
            path: 'courtselection',
            component: CourtselectionComponent,
            canActivate: [AuthGuard]
        },
        {
            path: 'courtselection/:customerid/:courtid/:collectionId',
            component: CourtselectionComponent,
            canActivate: [AuthGuard]
        },
        {
            path: 'summarycomplaint/:customerid/:collectionid/:courtid/:isupdated',
            component: SummarycomplaintComponent,
            canActivate: [AuthGuard]
        },
        {
            path: 'courttracking',
            component: CourttrackingComponent,
            canActivate: [AuthGuard]
        }
    ]
    },
]

