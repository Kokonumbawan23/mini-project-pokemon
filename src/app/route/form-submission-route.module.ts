import { RouterModule, Routes } from "@angular/router";
import FormSubmissionComponent from "../components/form-submission/form-submission.component";
import FormSubmissionEditComponent from "../components/form-submission/edit/form-submission-edit/form-submission-edit.component";
import { FormGuard } from "../guards/form.guard";
import { NgModule } from "@angular/core";


const routes: Routes = [{
        path: '',
        component: FormSubmissionComponent,
      },
      {
        path: ':id/edit',
        component: FormSubmissionEditComponent,
        canDeactivate: [FormGuard]
      }];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormSubmissionRouteModule { }
