import { Component, OnInit, Input, OnChanges, AfterViewInit, AfterViewChecked, AfterContentInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-table-layout',
  templateUrl: './table-layout.component.html',
  styleUrls: ['./table-layout.component.scss']
})
export class TableLayoutComponent implements OnChanges {
  @Input() records: any[];
  @Input() caption: string;
  keys: string[];

  constructor() { }

  ngOnChanges() {
    this.keys = Object.keys(this.records[0]);
  }

  editRecord(record) {
    console.log("Edit Record: ", record);
  }

  deleteRecord(record) {
    console.log("Delete Record: ", record);
  }

}
