import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImcDashboardComponent } from "./imc-dashboard.component";
import { IMCDashboardService } from "./services/imc.dashboard.service";


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ImcDashboardComponent],
  providers:[IMCDashboardService]
})
export class ImcDashboardModule { }
