import { Component, Inject, OnInit } from '@angular/core';
import { CvService } from '../cv.service';
@Component({
  selector: 'app-cv-page',
  standalone: false,
  
  templateUrl: './cv-page.component.html',
  styleUrl: './cv-page.component.css'
})
export class CvPageComponent implements OnInit {

  cvData:any;

  constructor(private cvService: CvService) {
  }

  ngOnInit() {
    this.cvData = this.cvService.getCvData();
  }
}
