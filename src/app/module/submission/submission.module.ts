import { NgModule } from "@angular/core";
import FormSubmissionComponent from "../../components/form-submission/form-submission.component";
import FormSubmissionEditComponent from "../../components/form-submission/edit/form-submission-edit/form-submission-edit.component";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormSubmissionRouteModule } from "../../route/form-submission-route.module";
import { TcgCardComponent } from "../../components/tcg-card/tcg-card.component";
import { RupiahPipe } from "../../shared/rupiah.pipe";



@NgModule({
  declarations: [
    FormSubmissionComponent,
    FormSubmissionEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormSubmissionRouteModule,
    TcgCardComponent,
    RupiahPipe,
  ],
})
export class SubmissionModule { }
