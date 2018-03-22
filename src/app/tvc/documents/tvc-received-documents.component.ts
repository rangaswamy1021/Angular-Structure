import { Component, OnInit } from '@angular/core';
import { ViolatorContextService } from "../../shared/services/violator.context.service";

@Component({
  selector: 'app-tvc-received-documents',
  templateUrl: './tvc-received-documents.component.html',
  styleUrls: ['./tvc-received-documents.component.scss']
})
export class TvcReceivedDocumentsComponent implements OnInit {
  ViolatorAccountId: number;

  constructor(private violatorContext: ViolatorContextService) { }

  ngOnInit() {
    this.violatorContext.currentContext
      .subscribe(violatorContext => { this.ViolatorAccountId = violatorContext.accountId; }
      );
  }
  
}
