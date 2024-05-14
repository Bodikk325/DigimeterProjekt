import { Pipe, PipeTransform } from '@angular/core';
import { Result } from './result';
import { DataService } from './data.service';

@Pipe({
  name: 'answerIdToTextConverter'
})
export class AnswerIdToTextConverterPipe implements PipeTransform {

  /**
   *
   */
  constructor(private dataService : DataService) {
  }
  transform(value: any, ...args: any[]) {
    throw new Error('Method not implemented.');
  }

  
}
