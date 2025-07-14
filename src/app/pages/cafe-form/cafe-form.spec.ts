import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CafeForm } from './cafe-form';

describe('CafeForm', () => {
  let component: CafeForm;
  let fixture: ComponentFixture<CafeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CafeForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CafeForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
