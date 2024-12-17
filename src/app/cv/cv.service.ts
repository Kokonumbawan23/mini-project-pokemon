import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CvService {

  getCvData() {
    return {
      name: 'Rizki Firmansyah',
      birthDate: '2002-07-26',
      email: 'rizkifirmansyah2642@gmail.com',
      stack: ["Nodejs", "Typescript", "Java"],
    };
  }
}
