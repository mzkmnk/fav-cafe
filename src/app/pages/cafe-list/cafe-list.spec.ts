import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CafeList } from './cafe-list';

describe('CafeList', () => {
  let component: CafeList;
  let fixture: ComponentFixture<CafeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CafeList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CafeList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
