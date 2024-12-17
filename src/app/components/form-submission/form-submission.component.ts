import { Component, OnInit } from "@angular/core";
import { RealtimeDatabaseService } from "../../services/realtime-database.service";

@Component({
  selector: "app-form-submission",
  templateUrl: "./form-submission.component.html",
  standalone: false
})
export default class FormSubmissionComponent implements OnInit{

  submissions: any[] = [];

  constructor(private dbService: RealtimeDatabaseService) {}

  async ngOnInit() {
      const response = await this.dbService.getFormSubmissions();
      this.submissions = Object.keys(response).map(key => ({id: key, ...response[key]}));
  }

  async deleteSubmission(id: string){
    try{
      if (!confirm('Are you sure you want to delete this submission?')) {
        return;
      }

      await this.dbService.deleteFormSubmission(id);
      this.submissions = this.submissions.filter(submission => submission.id !== id);
    }catch(error){
      console.error('Error deleting form submission:', error);
    }
  }

}
