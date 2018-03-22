import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IBlocklistresponse } from "../../shared/models/blocklistmessageresponse";
declare var $: any;
@Component({
  selector: 'app-blocked-list',
  templateUrl: './blocked-list.component.html',
  styleUrls: ['./blocked-list.component.scss']
})
export class BlockedListComponent implements OnInit {

  constructor() { }
  @Input() blockListArray: IBlocklistresponse[];
  @Output() status: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit() {   
  }

  continueProcess() {
    this.status.emit();
    $('#blocklist-dialog').modal('hide');
  }
}
