import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
 
import { IUserresponse } from '../models/userresponse';
import {LocalStorage, SessionStorage} from 'ngx-webstorage';


@Injectable()
export class SessionService {
   
    @SessionStorage() public _customerContext:IUserresponse;
   
    
    public get customerContext()  
    {
     
    return  this._customerContext;
    }

    //create a private setter
    private setcustomerContext(customer: IUserresponse) {
     // this._customerContext = customer;
      this._customerContext=customer;
 
    }
    
    
      constructor() { }
    
      changeResponse(context: IUserresponse) {

        
        this.setcustomerContext(context)
      }

    }