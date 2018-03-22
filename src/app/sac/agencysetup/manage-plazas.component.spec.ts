import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePlazasComponent } from './manage-plazas.component';

describe('ManagePlazasComponent', () => {
  let component: ManagePlazasComponent;
  let fixture: ComponentFixture<ManagePlazasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagePlazasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagePlazasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
