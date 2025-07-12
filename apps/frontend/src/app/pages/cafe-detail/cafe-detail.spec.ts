import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CafeDetail } from './cafe-detail';

describe('CafeDetail', () => {
  let component: CafeDetail;
  let fixture: ComponentFixture<CafeDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CafeDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CafeDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
