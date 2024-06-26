import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Point } from '../models/Point';
import { MyFirm } from '../models/MyFirm';
import { httpUrl } from '../variables';
import { AuthServiceHelper } from '../helpers/authServiceHelper';

@Injectable({
  providedIn: 'root'
})
export class FirmsService {

  url : string;
  newFirm: MyFirm;

  constructor(private http: HttpClient) {

      this.newFirm = {
        UserName: "",
        Region: '',
        Field: '',
        Workers: '',
        Sector: '',
        Capital: '',
        Revenue: ''
      }

      this.url = httpUrl;
  }

  saveMyFirmData(myFirm : MyFirm)
  {
    let body = new HttpParams();
    body = body.set('jwt', AuthServiceHelper.getJwtToken());
    body = body.set('region', myFirm.Region);
    body = body.set('field', myFirm.Field);
    body = body.set('employees', myFirm.Workers);
    body = body.set('capital', myFirm.Capital);
    body = body.set('sector', myFirm.Sector);
    body = body.set('revenue', myFirm.Revenue);
    return this.http.post(this.url + "updateMyFirm.php", body, {withCredentials : true});
  }

  getFirmData()
  {
    let body = new HttpParams();
    body = body.set('jwt', AuthServiceHelper.getJwtToken());
    return this.http.post(this.url + "getMyFirmData.php", body, {withCredentials : true});
  }

  getPoints(): Observable<Point[]> {
    return this.http.get<any[]>(this.url + "readFilters.php").pipe(
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
