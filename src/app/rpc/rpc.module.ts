import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetReportDetailsComponent } from './get-report-details.component';
import { SharedModule } from "../shared/shared.module";
import { RouterModule, UrlSegment } from "@angular/router";
import { reportChildren } from "./rpc.route";

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(reportChildren),
    ],
    declarations: [GetReportDetailsComponent]
})
export class RpcModule { }

// export function forAllReports(url: UrlSegment[]) {
//     if (url.length == 1) {
//       debugger;
//         const path = url[0].path;
//         if (path != "login") {
//             var menuArray = JSON.parse(sessionStorage.getItem('menu')).beforesearch;
//             var link = menuArray.filter(x => x.name == "RPC")[0].links;
//             link.forEach(element => {
//                 var sublinks = element.links;
//                 if (sublinks) {
                 
//                      for(var i=0;i<sublinks.lenght;i++) {
//                         if (sublinks[i].url == path)
//                         return {consumed:url};
                        
//                     };
//                 }
//             });
//         }
//     }
//     else{
//       return null;
//     }
// }
