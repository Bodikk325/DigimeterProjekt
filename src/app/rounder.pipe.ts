import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rounder'
})
export class RounderPipe implements PipeTransform {

  transform(points: number | undefined | string, maxPoints: number): any {
    if (maxPoints === 0) {
      return 'N/A'; // Elkerülendő a nullával való osztás
    }
    if(points != null)
      {
        const percentage = (points as number / maxPoints);
        return `${Math.round(percentage)}%`;
      }
    return ""
  }
}
