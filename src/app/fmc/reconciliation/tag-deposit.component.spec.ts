import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagDepositComponent } from './tag-deposit.component';

describe('TagDepositComponent', () => {
  let component: TagDepositComponent;
  let fixture: ComponentFixture<TagDepositComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagDepositComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagDepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
