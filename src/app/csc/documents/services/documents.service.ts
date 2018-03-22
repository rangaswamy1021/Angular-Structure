import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, RequestOptions, ResponseContentType, Response } from '@angular/http';
import { HttpService } from './../../../shared/services/http.service';
import { DocumentTypes } from "../constants";
import { IDocumentsRequest } from "../models/documentsrequest";
import { IDocumentsResponse } from "../models/documentsresponse";
import { ILookupResponse } from "../models/lookupresponse";
import { IInOrOutBoundRequest } from "../models/inoroutboundrequest";
import { IInOrOutBoundResponse } from "../models/inoroutboundresponse";
import { IUserEvents } from "../../../shared/models/userevents";
@Injectable()
export class DocumentsService {
  constructor(private httpService: HttpService, private http: Http) { }
  private documentsUrl = 'Documents/';
  private receiveDocumentsUrl = 'ReceivedDocuments/';
  private sentDocumnetsUrl = 'SentDocuments/';
  private common = 'Common/';

  getDocumentTypes(userEvents?: IUserEvents): Observable<any> {
    return this.httpService.getHttpWithoutParams(this.documentsUrl + 'GetDocumentTypes', userEvents);
  }

  getFileNames(documentDirctory: string, userEvents: IUserEvents): Observable<any> {
    //let obj = JSON.stringify(documentDirctory);
    return this.httpService.getHttpWithParams(this.documentsUrl + 'GetDocumentNames', "strDirectoryName", documentDirctory, userEvents);
  }

  getDelinkDocuments(objDocumentSearchReq: IDocumentsRequest, userEvents?: IUserEvents): Observable<IDocumentsResponse[]> {
    let obj = JSON.stringify(objDocumentSearchReq);
    return this.httpService.getHttpWithParams(this.documentsUrl + 'GetDocumentsByStatus', "objType", obj, userEvents);
  }

  linkCustomerDocuments(objDocumentSearchReq: IDocumentsRequest, userEvents?: IUserEvents): Observable<any> {
    return this.httpService.postHttpMethod(this.documentsUrl + 'LinkDocumentToCustomer', JSON.stringify(objDocumentSearchReq), userEvents);
  }


  delinkDocument(documents: IDocumentsRequest): Observable<boolean> {
    let objType = JSON.stringify(documents);
    return this.httpService.postHttpMethod(this.documentsUrl + 'DelinkDocument', objType);
  }

  getFile(path: string): Observable<Blob> {
    let options = new RequestOptions({ responseType: ResponseContentType.Blob });

    return this.http.get(path, options)
      .map((response: Response) => <Blob>response.blob())
  }
  getLookUpByParentLookupTypeCode(lookuptypecode: ILookupResponse): Observable<ILookupResponse[]> {
    let obj = JSON.stringify(lookuptypecode);
    return this.httpService.getHttpWithParams(this.common + 'GetLookUpByParentLookupTypeCode', "lookupTypecode", obj);
  }
  getInBoundSearchByKeyword(objType: IInOrOutBoundRequest, userEvents: IUserEvents): Observable<IInOrOutBoundResponse[]> {
    let obj = JSON.stringify(objType);
    return this.httpService.postHttpMethod(this.receiveDocumentsUrl + 'InBoundSearchByKeyword', obj, userEvents);
  }
  getCreateInboundDocument(objInOrOutBoundList: IInOrOutBoundRequest[], userEvents: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(objInOrOutBoundList);
    return this.httpService.postHttpMethod(this.receiveDocumentsUrl + 'CreateInboundDocument', obj, userEvents);
  }
  getInOutBoundByCustomerID(customerId: IInOrOutBoundRequest, userEvents: IUserEvents): Observable<IInOrOutBoundResponse[]> {
    let obj = JSON.stringify(customerId);
    return this.httpService.postHttpMethod(this.sentDocumnetsUrl + 'GetInOutBoundByCustomerID', obj, userEvents);
  }
  uploadFile(formData: FormData): Observable<string> {
    return this.httpService.postHttpMethodwithoutOptions(this.receiveDocumentsUrl + 'UploadFile', formData);
  }

  deleteFile(strDbFilePath: string): Observable<[boolean]> {
    let filePath = strDbFilePath;
    return this.httpService.deleteHttpMethodWithParams(this.receiveDocumentsUrl + 'DeleteFile', 'strDbFilePath', filePath);
  }
};
