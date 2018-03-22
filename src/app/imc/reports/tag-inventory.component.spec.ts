import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagInventoryComponent } from './tag-inventory.component';

describe('TagInventoryComponent', () => {
  let component: TagInventoryComponent;
  let fixture: ComponentFixture<TagInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
