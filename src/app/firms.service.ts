import { HttpClient } from '@angular/common/http';
import { Injectable, afterNextRender } from '@angular/core';
import { Observable, map } from 'rxjs';
import { MyFirm } from './myFirm';
import { LogarithmicScale } from 'chart.js';
import { AuthService } from './auth.service';
import { User } from './user';

export interface Point {
  questionId: string,
  Maxpoint: number,
  AvaragePoint: number,
  Budapest: number | undefined,
  KozepDunantul: number | undefined,
  PestMegye: number | undefined,
  NyugatDunantul: number | undefined,
  EszakMagyarorszag: number | undefined,
  DelAlfold: number | undefined,
  EszakAlfold: number | undefined,
  DelDunantul: number | undefined,
  Szallashely: number | undefined,
  Epitoipar: number | undefined,
  Penzugy: number | undefined,
  Adminisztrativ: number | undefined,
  Kereskedelem: number | undefined,
  Ingatlan: number | undefined,
  Feldolgozoipar: number | undefined,
  Informacio: number | undefined,
  Egyeb: number | undefined,
  Szakmai: number | undefined,
  Villamosenergia: number | undefined,
  Szallitas: number | undefined,
  Mezogazdasag: number | undefined,
  otkilenc: number | undefined,
  husznegyvenkilenc: number | undefined,
  tiztizenkilenc: number | undefined,
  otvenketszaznegyvenkilenc: number | undefined,
  ShownPoint: number
}

@Injectable({
  providedIn: 'root'
})
export class FirmsService {

  points: Point[] = [
  ]

  firmsList: MyFirm[] = [];

  newFirm: MyFirm = {
    UserName: (this.authService.getCurrentUser() as User).username,
    Region: '',
    Field: '',
    Workers: ''
  }

  constructor(private http: HttpClient, private authService : AuthService) {
      const firmsData = localStorage.getItem('MyFirmsList');
      this.firmsList = firmsData ? JSON.parse(firmsData) as MyFirm[] : [];
  }

  getMyFirmData(): MyFirm {
    return this.firmsList.find(x => x.UserName == this.authService.getCurrentUser().username) ?? this.newFirm
  }

  saveFirmToList(myFirm: MyFirm) {
    var selected = this.firmsList.find(x => x.UserName == myFirm.UserName);
    if (selected == null) {
      this.firmsList.push(myFirm)
    }
    else {
      this.update(myFirm)
    }

    this.saveListToLocalStorage();
  }

  saveListToLocalStorage() {
    localStorage.setItem("MyFirmsList", JSON.stringify(this.firmsList))
  }

  getPoints(): Observable<Point[]> {
    return this.http.get<any[]>('assets/filters.json').pipe(
      map(data => data.map(item => this.transformToPoints(item)))
    );
  }

  private transformToPoints(item: any): Point {
    return {
      questionId: item.id,
      Maxpoint: item.max_point,
      AvaragePoint: item.average_points,
      Budapest: item.Budapest,
      KozepDunantul: item['Közép-Dunántúl'],
      PestMegye: item['Pest megye'],
      NyugatDunantul: item['Nyugat-Dunántúl'],
      EszakMagyarorszag: item['Észak-Magyarország'],
      DelAlfold: item['Dél-Alföld'],
      EszakAlfold: item['Észak-Alföld'],
      DelDunantul: item['Dél-Dunántúl'],
      Szallashely: item['Szálláshely szolgálatatás, vendéglátás'],
      Epitoipar: item['Építőipar'],
      Penzugy: item['Pénzügyi, biztosítási tevékenység'],
      Adminisztrativ: item['Adminisztratív és szolgáltatást támogató tevékenység'],
      Kereskedelem: item['Kereskedelem, gépjárműjavítás'],
      Ingatlan: item['Ingatlanügyek'],
      Feldolgozoipar: item['Feldolgozóipar'],
      Informacio: item['Információ, kommunikáció'],
      Egyeb: item['Egyéb (közigazgatás, oktatás, egészségügy, szociális ellátás, művészet, egyéb szolgáltatás)'],
      Szakmai: item['Szakmai, tudományos, műszaki tevékenység, könyvelés'],
      Villamosenergia: item['Villamosenergia-, gáz-, gőzellátás, légkondicionálás, vízellátás'],
      Szallitas: item['Szállítás/raktározás'],
      Mezogazdasag: item['Mezőgazdaság, bányászat'],
      otkilenc: item['5-9 fő'],
      husznegyvenkilenc: item['20-49 fő'],
      tiztizenkilenc: item['10-19 fő'],
      otvenketszaznegyvenkilenc: item['50-249 fő'],
      ShownPoint: 0
    };
  }

  private update(newItem: MyFirm) {
    let indexToUpdate = this.firmsList.findIndex(item => item.UserName === newItem.UserName);
    this.firmsList[indexToUpdate] = newItem;

    this.firmsList = Object.assign([], this.firmsList);
  }
}
