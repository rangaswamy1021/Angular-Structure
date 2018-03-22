import { Component, OnInit, AfterViewInit , ViewChild, ElementRef } from '@angular/core'; 
import { IRefundProcess } from './models/RefundProcess';
import { RefundContextService } from './services/RefundContextService';

declare let jsPDF; 

@Component({
  selector: 'app-violator-refund-form',
  templateUrl: './violator-refund-form.component.html',
  styleUrls: ['./violator-refund-form.component.scss']
})
export class ViolatorRefundFormComponent implements OnInit {

  @ViewChild('generate') el: ElementRef; 
  
  constructor(private refundContextService: RefundContextService) { }

  iRefundProcess: IRefundProcess[] = <IRefundProcess[]>[];

  ngOnInit() {
    this.iRefundProcess = this.refundContextService.getRefund();
  }

  public GeneratePdf() {
    let pdf = new jsPDF('l', 'pt', 'a4');
    let options = {
      pagesplit: true,
      format:"PNG",
      background:"#fff"
    }; 
 
    pdf.addHTML(this.el.nativeElement, 0, 0, options, () => {
      pdf.save("ViolatorRefundForm.pdf");
    });
  }

}
