import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'answerIdToTextConverter'
})
export class AnswerIdToTextConverterPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
