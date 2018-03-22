import { Component, OnInit } from '@angular/core';
import { ITagConfigurationRequest } from './models/tags-configurationsrequest';
import { ConfigurationService } from './services/configuration.service';
import { ITagConfigurationResponse } from './models/tags-configurationsresponse';
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ICommonResponse } from '../../shared/models/commonresponse';
import { CommonService } from '../../shared/services/common.service';
import { IUserEvents } from '../../shared/models/userevents';
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { MaterialscriptService } from "../../shared/materialscript.service";


@Component({
  selector: 'app-get-tags-configurations',
  templateUrl: './get-tags-configurations.component.html',
  styleUrls: ['./get-tags-configurations.component.scss']
})
export class GetTagsConfigurationsComponent implements OnInit {
  tags: ITagConfigurationResponse[];
  lookupType: ICommonResponse;
  protocolResponse: ICommonResponse[];
  mountingResponse: ICommonResponse[];
  manageConf: FormGroup;
  objTagConfig: ITagConfigurationRequest = <ITagConfigurationRequest>{};
  TagConfigId: number;
  isUpdate: boolean;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  editTagId: number;

  constructor(private tagService: ConfigurationService, private context: SessionService, private router: Router, private commonService: CommonService,private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.manageConf = new FormGroup({
      'protocol': new FormControl(''),
      'mounting': new FormControl('')
    });

    this.getTags(false, true);
    this.getLookUpByParentLookupTypeCode();
  }

  searchTags() {
    if ((this.manageConf.controls['protocol'].value != '' && this.manageConf.controls['protocol'].value != null) ||
      (this.manageConf.controls['mounting'].value != '' && this.manageConf.controls['mounting'].value != null)) {

      let strProtocol: string;
      let strMounting: string;

      if (this.manageConf.controls['protocol'].value == null)
        strProtocol = "";
      else
        strProtocol = this.manageConf.controls['protocol'].value;

      if (this.manageConf.controls['mounting'].value == null)
        strMounting = "";
      else
        strMounting = this.manageConf.controls['mounting'].value;

      this.getTags(true, false);
    }
    else {
      this.showErrorMsg('At least 1 field is required');
    }
  }

  getTags(isSearch: boolean, isPageLoad: boolean) {
    this.objTagConfig = <ITagConfigurationRequest>{};
    if (isPageLoad) {
      this.objTagConfig.Protocol = null;
      this.objTagConfig.Mounting = null;
    }
    else if (isSearch) {
      this.objTagConfig.Protocol = this.manageConf.controls['protocol'].value;
      this.objTagConfig.Mounting = this.manageConf.controls['mounting'].value;
    }
    this.objTagConfig.SortColumn = 'PROTOCOL';
    this.objTagConfig.SortDirection = 0;
    this.objTagConfig.PageNumber = 1;
    this.objTagConfig.PageSize = 10;
    this.objTagConfig.SearchFlag = 'SEARCH';
    this.objTagConfig.UserId = this.context._customerContext.userId;
    this.objTagConfig.LoginId = this.context._customerContext.loginId;
    this.objTagConfig.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.objTagConfig.UpdateUser = this.context._customerContext.userName;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.TAGCONFIG];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;

    this.tagService.SearchTagConfigs(this.objTagConfig,userEvents).subscribe(
      res => {
        this.tags = res;
      });
  }

  resetClick() {
    this.manageConf.reset();
    this.getTags(false, true);
  }

  closeDiv(isupdate: boolean): void {
    this.isUpdate = isupdate;
  }

  onSuccess(): void {   
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = 'Tag Configurations updated Successfully';
    this.getTags(false, true);
  }
  
  setOutputFlag(e) {
    this.msgFlag = e;
  }

  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }

  showSucsMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = msg;
  }

  //binding protocol and mounting
  getLookUpByParentLookupTypeCode() {
    this.lookupType = <ICommonResponse>{};
    this.lookupType.LookUpTypeCode = 'Protocols';
    this.commonService.getLookUpByParentLookupTypeCode(this.lookupType).subscribe(
      res => {
        this.protocolResponse = res;
      });
    this.lookupType.LookUpTypeCode = 'Mounting';
    this.commonService.getLookUpByParentLookupTypeCode(this.lookupType).subscribe(
      res => {
        this.mountingResponse = res;
      });
  }

  onEditclick(tag: ITagConfigurationResponse): void {
    this.tagService.SetValue(tag);
    this.isUpdate = true;
    this.editTagId = tag.TagConfigId;
      let rootSele=this;
      setTimeout(function(){
      rootSele.materialscriptService.material();
      },0)
  }

}

