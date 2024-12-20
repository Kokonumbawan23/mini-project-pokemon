import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titlecase',
  standalone: false
})
export class TitlecasePipe implements PipeTransform {

  transform(value: string): string {
    return value.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

}
