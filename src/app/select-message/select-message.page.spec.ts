import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMessagePage } from './select-message.page';

describe('SelectMessagePage', () => {
  let component: SelectMessagePage;
  let fixture: ComponentFixture<SelectMessagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectMessagePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectMessagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
