import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractSearchComponent } from './contract-search.component';

describe('ContractSearchComponent', () => {
  let component: ContractSearchComponent;
  let fixture: ComponentFixture<ContractSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
