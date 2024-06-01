import { HttpClient, HttpParams } from '@angular/common/http';
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

  newFirm: MyFirm = {
    UserName: "",
    Region: '',
    Field: '',
    Workers: '',
    Sector: '',
    Capital: '',
    Revenue: ''
  }

  constructor(private http: HttpClient, private authService : AuthService) {
      
  }

  saveMyFirmData(myFirm : MyFirm)
  {
    let body = new HttpParams();
    body = body.set('userId', localStorage.getItem("currentUser") ?? "");
    body = body.set('region', myFirm.Region);
    body = body.set('field', myFirm.Field);
    body = body.set('employees', myFirm.Workers);
    body = body.set('capital', myFirm.Capital);
    body = body.set('sector', myFirm.Sector);
    body = body.set('revenue', myFirm.Revenue);
    return this.http.post("http://localhost/updateMyFirm.php", body);
  }

  getFirmData()
  {
    let body = new HttpParams();
    body = body.set('userId', localStorage.getItem("currentUser") ?? "");
    return this.http.post("http://localhost/getMyFirmData.php", body);
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
      AvaragePoint: item["average_points"],
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
}
