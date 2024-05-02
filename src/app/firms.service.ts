import { Injectable } from '@angular/core';

export interface Point
{
  questionId: number,
  Osszpont : number,
  BudapestResult: number,
  AlfoldResult : number,
  VizvezetekResult : number,
  Result1019 : number,
  ShownPoint : number
}

@Injectable({
  providedIn: 'root'
})
export class FirmsService {
  
  points : Point[] = [
    {
      questionId : 1,
      Osszpont : 3,
      BudapestResult : 4,
      AlfoldResult: 3,
      VizvezetekResult : 2,
      ShownPoint : 0,
      Result1019 : 3
    },
    {
      questionId : 2,
      Osszpont : 2,
      BudapestResult : 1,
      AlfoldResult: 0,
      VizvezetekResult : 2,
      ShownPoint : 0,
      Result1019 : 2
    },
    {
      questionId : 3,
      Osszpont : 5,
      BudapestResult : 3,
      AlfoldResult: 8,
      VizvezetekResult : 2,
      ShownPoint : 0,
      Result1019 : 7
    }
  ]

  constructor() { }

  public getFirmPoints() : Point[]
  {
    return this.points;
  }
}
