export interface RegionData {
    id: string;
    max_point: number;
    average_points: number;
    Budapest: number;
    "Dél-Alföld": number;
    "Dél-Dunántúl": number;
    "Egyéb (közigazgatás, oktatás, egészségügy, szociális ellátás, művészet, egyéb szolgáltatás)": number;
    Feldolgozóipar: number;
    "Informatikai eszközt használó munkavállalók": number | null;
    "Információ, kommunikáció": number;
    Ingatlanügyek: number;
    "Kereskedelem, gépjárműjavítás": number;
    "Közép-Dunántúl": number;
    "Mezőgazdaság, bányászat": number;
    "Nyugat-Dunántúl": number;
    "Pest megye": number;
    "Pénzügyi, biztosítási tevékenység": number;
    "Szakmai, tudományos, műszaki tevékenység, könyvelés": number;
    "Szálláshely szolgálatatás, vendéglátás": number;
    "Szállítás/raktározás": number;
    "Villamosenergia-, gáz-, gőzellátás, légkondicionálás, vízellátás": number;
    Építőipar: number;
    "Észak-Alföld": number;
    "Észak-Magyarország": number;
    "5-9 fő": number;
    "10-19 fő": number;
    "20-49 fő": number;
    "50-249 fő": number;
    "Adminisztratív és szolgáltatást támogató tevékenység": number;
    [key: string]: number | string | null; // Index signature
  }