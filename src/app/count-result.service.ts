import { Injectable } from '@angular/core';
import { Point } from './firms.service';

@Injectable({
  providedIn: 'root'
})
export class CountResultService {

  constructor() { }

  FindWhichPointToShow(point: Point, text: string): number {

    // Végigmegyünk a point objektum kulcsain
    for (const key of Object.keys(point)) {

      // Ellenőrizzük, hogy a kulcs tartalmazza-e a "Budapest" szót
      if (key.includes(text)) {
        var selectedPoint = point[key as keyof Point]
        if(typeof selectedPoint == "number")
          {
            
            return selectedPoint
          }
      }
    }
    return 0;  // Visszatérünk null-lal, ha nem találtuk meg
  }
}
