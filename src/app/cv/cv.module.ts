import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvPageComponent } from './cv-page/cv-page.component';
import { CvService } from './cv.service';

@NgModule({
  declarations: [
    CvPageComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [
    CvService
  ],
  exports: [
    CvPageComponent
  ]
})
export class CvModule { }
