import { TvcDashBoardService } from './services/tvc-dashboard.service';
import { TvcDashboardComponent } from './tvc-dashboard.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmChartsModule } from "@amcharts/amcharts3-angular";
@NgModule({
  imports: [
    CommonModule,
    AmChartsModule
  ],
  declarations: [TvcDashboardComponent],
  providers:[TvcDashBoardService]
})
export class TvcDashboardModule { }
