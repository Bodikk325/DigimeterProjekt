import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firmSelectedValueToDisplayText'
})
export class FirmSelectedValueToDisplayTextPipe implements PipeTransform {

  transform(value : string): string {
    switch (value) {
      case "KozepDunantul":
        return "Közép-Dunántúl"
        break;
        case "PestMegye":
          return "Pest megye"
          break;
          case "NyugatDunantul":
        return "Nyugat-Dunántúl"
        break;
        case "EszakMagyarorszag":
        return "Észak-Magyarország"
        break;
        case "DelAlfold":
        return "Dél-Alföld"
        break;
        case "EszakAlfold":
        return "Észak-Alföld"
        break;
        case "DelDunantul":
        return "Dél-Dunántúl"
        break;
        case "Szallashely":
        return "szálláshely szolgálatatással, vendéglátással"
        break;
        case "Epitoipar":
        return "építőiparral"
        break;
        case "Kereskedelem":
        return "kereskedelmi, gépjárműjavítással"
        break;
        case "Ingatlan":
        return "ingatlanügyekkel"
        break;
        case "Informacio":
        return "információ, kommunikációval"
        break;
        case "Feldolgozoipar":
        return "feldolgozóiparral"
        break;
        case "Mezogazdasag":
        return "mezőgazdasággal, bányászattal"
        break;
        case "Villamosenergia":
        return "villamosenergia-, gáz-, gőzellátás, légkondicionálás, vízellátással"
        break;
        case "Szallitas":
        return "szállítással, raktározással"
        break;
        case "Szakmai":
        return "szakmai, tudományos, műszaki tevékenység, könyveléssel"
        break;
        case "Penzugy":
        return "pénzügyi, biztosítási tevékenységgel"
        break;
        case "Adminisztrativ":
        return "adminisztratív és szolgáltatást támogató tevékenységgel"
        break;
        case "Egyeb":
        return "közigazgatás, oktatás, egészségügy, szociális ellátás, művészet, egyéb szolgáltatással"
        break;
        case "otkilenc":
        return "5-9 főt"
        break;
        case "husznegyvenkilenc":
        return "10-19 főt"
        break;
        case "tiztizenkilenc":
        return "20-49 főt"
        break;
        case "otvenketszaznegyvenkilenc":
        return "50-249 főt"
        break;
      default:
        return "";
        break;
    }
  }

}
