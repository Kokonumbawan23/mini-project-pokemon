import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvPageComponent } from './cv-page.component';

describe('CvPageComponent', () => {
  let component: CvPageComponent;
  let fixture: ComponentFixture<CvPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CvPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CvPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
