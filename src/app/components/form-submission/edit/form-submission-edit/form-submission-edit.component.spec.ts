import { ComponentFixture, TestBed } from '@angular/core/testing';

import FormSubmissionEditComponent  from './form-submission-edit.component';

describe('FormSubmissionEditComponent', () => {
  let component: FormSubmissionEditComponent;
  let fixture: ComponentFixture<FormSubmissionEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormSubmissionEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormSubmissionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
