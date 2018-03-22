import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from "../shared/services/common.service";
import { SessionService } from "../shared/services/session.service";
import { ApplicationParameterkey } from "../shared/applicationparameter";
import { LookupTypeCodes } from "../shared/constants";
import { IAttachmentRequest } from "../shared/models/attachmentrequest";
import { HelpDeskService } from "./services/helpdesk.service";
import { MaterialscriptService } from "../shared/materialscript.service";


@Component({
  selector: 'app-pm-attachment',
  templateUrl: './pm-attachment.component.html',
  styleUrls: ['./pm-attachment.component.scss']
})
export class PmAttachmentComponent implements OnInit {

  attachmentsList: IAttachmentRequest[] = [];
  attachment: IAttachmentRequest;
  viewPath: string = '';
  fileMaxSize: number;
  maxFiles: number;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  @ViewChild('cmpFile') cmpFile;

  constructor(private helpDeskService: HelpDeskService, private commonService: CommonService, private sessionService: SessionService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.Complaints)
      .subscribe(res => { this.viewPath = res; });

    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxAttachments)
      .subscribe(res => { this.maxFiles = res; });

    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxFileSize)
      .subscribe(res => { this.fileMaxSize = res; });
  }

  uploadFile() {
    if (this.cmpFile.nativeElement.files[0]) {
      let file: File = this.cmpFile.nativeElement.files[0];
      let type = file.name.substring(file.name.lastIndexOf('.'));

      if (this.attachmentsList.length < this.maxFiles) {
        if ([".gif", ".jpg", ".jpeg", ".txt", ".xls", ".docx", ".pdf", ".doc", ".png", ".xlsx"].indexOf(type.toLowerCase()) > 0) {
          if (file.size / 1048576 < this.fileMaxSize) {
            let formData = new FormData();
            formData.append('upload', file);
            this.helpDeskService.uploadFile(formData)
              .subscribe(
              data => {
                if (data != null && data !== '' && data.Result) {
                  let pathParts: string[] = data.FilePath.split('/');
                  this.attachment = <IAttachmentRequest>{};
                  this.attachment.FileName = pathParts[pathParts.length - 1];
                  this.attachment.Path = data.FilePath;
                  this.attachment.Size = file.size;
                  this.attachment.FileType = type;
                  this.attachmentsList.push(this.attachment);
                  this.cmpFile.nativeElement.value = '';
                } else {
                  this.showErrorMsg(data.Result);
                  this.cmpFile.nativeElement.value = '';
                }
              });
          } else {
            this.showErrorMsg('File size should not exceed more than ' + this.fileMaxSize + 'MB');
          }
        } else {
          this.showErrorMsg('Attach files of type  jpg, jpeg, txt, gif, docx, pdf, doc, png, xlsx, xls only.');
        }
      } else {
        this.showErrorMsg('You can attach maximum of  ' + this.maxFiles + ' attachments');
      }
    } else {
      this.showErrorMsg('select file to upload');
    }
  }

  deleteFile(fileName: string) {
    this.helpDeskService.deleteFile(fileName)
      .subscribe(
      data => {
        if (data) {
          this.attachmentsList = this.attachmentsList.filter((f: IAttachmentRequest) => f.Path !== fileName);
        } else {
          this.showErrorMsg('Error while deleting file');
        }
      });
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }

}
