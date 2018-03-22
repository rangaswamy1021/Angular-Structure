import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationTransferComponent } from './violation-transfer.component';

describe('ViolationTransferComponent', () => {
  let component: ViolationTransferComponent;
  let fixture: ComponentFixture<ViolationTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViolationTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViolationTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
