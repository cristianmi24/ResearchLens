/** Constantes y tablas de referencia del atlas (mundo + Colombia). */

export type LonLat = [number, number];

export const BOGOTA: LonLat = [-74.0721, 4.711];
export const COLOMBIA_CENTER: LonLat = [-73.5, 4.2];
export const R_EARTH = 6371;

/** Código ISO numérico → [ISO alfa-2, nombre en español]. */
export const COUNTRY_ES: Record<string, [string, string]> = {"004":["AF","Afganistán"],"008":["AL","Albania"],"010":["AQ","Antártida"],"012":["DZ","Argelia"],"024":["AO","Angola"],"031":["AZ","Azerbaiyán"],"032":["AR","Argentina"],"036":["AU","Australia"],"040":["AT","Austria"],"044":["BS","Bahamas"],"050":["BD","Bangladesh"],"051":["AM","Armenia"],"056":["BE","Bélgica"],"064":["BT","Bután"],"068":["BO","Bolivia"],"070":["BA","Bosnia y Herzegovina"],"072":["BW","Botswana"],"076":["BR","Brasil"],"084":["BZ","Belice"],"090":["SB","Islas Salomón"],"096":["BN","Brunéi"],"100":["BG","Bulgaria"],"104":["MM","Myanmar (Birmania)"],"108":["BI","Burundi"],"112":["BY","Bielorrusia"],"116":["KH","Camboya"],"120":["CM","Camerún"],"124":["CA","Canadá"],"140":["CF","República Centroafricana"],"144":["LK","Sri Lanka"],"148":["TD","Chad"],"152":["CL","Chile"],"156":["CN","China"],"158":["TW","Taiwán"],"170":["CO","Colombia"],"178":["CG","Congo"],"180":["CD","R. D. del Congo"],"188":["CR","Costa Rica"],"191":["HR","Croacia"],"192":["CU","Cuba"],"196":["CY","Chipre"],"203":["CZ","República Checa"],"204":["BJ","Benin"],"208":["DK","Dinamarca"],"214":["DO","República Dominicana"],"218":["EC","Ecuador"],"222":["SV","El Salvador"],"226":["GQ","Guinea Ecuatorial"],"231":["ET","Etiopía"],"232":["ER","Eritrea"],"233":["EE","Estonia"],"238":["FK","Islas Malvinas"],"242":["FJ","Fiji"],"246":["FI","Finlandia"],"250":["FR","Francia"],"260":["TF","Tierras Australes Francesas"],"262":["DJ","Yibuti"],"266":["GA","Gabón"],"268":["GE","Georgia"],"270":["GM","Gambia"],"275":["PS","Palestina"],"276":["DE","Alemania"],"288":["GH","Ghana"],"300":["GR","Grecia"],"304":["GL","Groenlandia"],"320":["GT","Guatemala"],"324":["GN","Guinea"],"328":["GY","Guyana"],"332":["HT","Haití"],"340":["HN","Honduras"],"348":["HU","Hungría"],"352":["IS","Islandia"],"356":["IN","India"],"360":["ID","Indonesia"],"364":["IR","Irán"],"368":["IQ","Iraq"],"372":["IE","Irlanda"],"376":["IL","Israel"],"380":["IT","Italia"],"384":["CI","Costa de Marfil"],"388":["JM","Jamaica"],"392":["JP","Japón"],"398":["KZ","Kazajistán"],"400":["JO","Jordania"],"404":["KE","Kenia"],"408":["KP","Corea del Norte"],"410":["KR","Corea del Sur"],"414":["KW","Kuwait"],"417":["KG","Kirguistán"],"418":["LA","Laos"],"422":["LB","Líbano"],"426":["LS","Lesoto"],"428":["LV","Letonia"],"430":["LR","Liberia"],"434":["LY","Libia"],"440":["LT","Lituania"],"442":["LU","Luxemburgo"],"450":["MG","Madagascar"],"454":["MW","Malaui"],"458":["MY","Malasia"],"466":["ML","Malí"],"478":["MR","Mauritania"],"484":["MX","México"],"496":["MN","Mongolia"],"498":["MD","Moldavia"],"499":["ME","Montenegro"],"504":["MA","Marruecos"],"508":["MZ","Mozambique"],"512":["OM","Omán"],"516":["NA","Namibia"],"524":["NP","Nepal"],"528":["NL","Países Bajos"],"540":["NC","Nueva Caledonia"],"548":["VU","Vanuatu"],"554":["NZ","Nueva Zelanda"],"558":["NI","Nicaragua"],"562":["NE","Níger"],"566":["NG","Nigeria"],"578":["NO","Noruega"],"586":["PK","Pakistán"],"591":["PA","Panamá"],"598":["PG","Papua Nueva Guinea"],"600":["PY","Paraguay"],"604":["PE","Perú"],"608":["PH","Filipinas"],"616":["PL","Polonia"],"620":["PT","Portugal"],"624":["GW","Guinea Bissau"],"626":["TL","Timor-Leste"],"630":["PR","Puerto Rico"],"634":["QA","Catar"],"642":["RO","Rumanía"],"643":["RU","Rusia"],"646":["RW","Ruanda"],"682":["SA","Arabia Saudita"],"686":["SN","Senegal"],"688":["RS","Serbia"],"694":["SL","Sierra Leona"],"703":["SK","Eslovaquia"],"704":["VN","Vietnam"],"705":["SI","Eslovenia"],"706":["SO","Somalia"],"710":["ZA","Sudáfrica"],"716":["ZW","Zimbabue"],"724":["ES","España"],"728":["SS","Sudán del Sur"],"729":["SD","Sudán"],"732":["EH","Sahara Occidental"],"740":["SR","Suriname"],"748":["SZ","Esuatini"],"752":["SE","Suecia"],"756":["CH","Suiza"],"760":["SY","Siria"],"762":["TJ","Tayikistán"],"764":["TH","Tailandia"],"768":["TG","Togo"],"780":["TT","Trinidad y Tobago"],"784":["AE","Emiratos Árabes Unidos"],"788":["TN","Túnez"],"792":["TR","Turquía"],"795":["TM","Turkmenistán"],"800":["UG","Uganda"],"804":["UA","Ucrania"],"807":["MK","Macedonia del Norte"],"818":["EG","Egipto"],"826":["GB","Reino Unido"],"834":["TZ","Tanzania"],"840":["US","Estados Unidos"],"854":["BF","Burkina Faso"],"858":["UY","Uruguay"],"860":["UZ","Uzbekistán"],"862":["VE","Venezuela"],"887":["YE","Yemen"],"894":["ZM","Zambia"]};

/** Territorios del mapa que no traen id numérico (se identifican por nombre). */
export const FALLBACK_ES: Record<string, [string | null, string]> = {
  Kosovo: ["XK", "Kosovo"],
  "N. Cyprus": [null, "Chipre del Norte"],
  Somaliland: [null, "Somalilandia"],
};

export type Region = "Caribe" | "Andina" | "Pacífica" | "Orinoquía" | "Amazonía" | "Insular";

export interface Departamento {
  nombre: string;
  capital: string;
  region: Region;
  /** Coordenadas [lon, lat] de la capital; null si comparte capital con otro (Cundinamarca → Bogotá). */
  cap: LonLat | null;
}

/** Departamentos por código DANE: nombre, capital, región y coordenadas de la capital. */
export const DEPARTAMENTOS: Record<string, Departamento> = {
  "05": { nombre: "Antioquia", capital: "Medellín", region: "Andina", cap: [-75.5636, 6.2518] },
  "08": { nombre: "Atlántico", capital: "Barranquilla", region: "Caribe", cap: [-74.7964, 10.9685] },
  "11": { nombre: "Bogotá D.C.", capital: "Bogotá", region: "Andina", cap: [-74.0721, 4.711] },
  "13": { nombre: "Bolívar", capital: "Cartagena de Indias", region: "Caribe", cap: [-75.5144, 10.391] },
  "15": { nombre: "Boyacá", capital: "Tunja", region: "Andina", cap: [-73.3678, 5.5446] },
  "17": { nombre: "Caldas", capital: "Manizales", region: "Andina", cap: [-75.5174, 5.0703] },
  "18": { nombre: "Caquetá", capital: "Florencia", region: "Amazonía", cap: [-75.6062, 1.6144] },
  "19": { nombre: "Cauca", capital: "Popayán", region: "Pacífica", cap: [-76.6131, 2.4448] },
  "20": { nombre: "Cesar", capital: "Valledupar", region: "Caribe", cap: [-73.2532, 10.4631] },
  "23": { nombre: "Córdoba", capital: "Montería", region: "Caribe", cap: [-75.8814, 8.7479] },
  "25": { nombre: "Cundinamarca", capital: "Bogotá", region: "Andina", cap: null },
  "27": { nombre: "Chocó", capital: "Quibdó", region: "Pacífica", cap: [-76.6583, 5.6947] },
  "41": { nombre: "Huila", capital: "Neiva", region: "Andina", cap: [-75.2819, 2.9273] },
  "44": { nombre: "La Guajira", capital: "Riohacha", region: "Caribe", cap: [-72.9072, 11.5444] },
  "47": { nombre: "Magdalena", capital: "Santa Marta", region: "Caribe", cap: [-74.199, 11.2408] },
  "50": { nombre: "Meta", capital: "Villavicencio", region: "Orinoquía", cap: [-73.6266, 4.142] },
  "52": { nombre: "Nariño", capital: "Pasto", region: "Pacífica", cap: [-77.2811, 1.2136] },
  "54": { nombre: "Norte de Santander", capital: "Cúcuta", region: "Andina", cap: [-72.5078, 7.8939] },
  "63": { nombre: "Quindío", capital: "Armenia", region: "Andina", cap: [-75.6811, 4.5339] },
  "66": { nombre: "Risaralda", capital: "Pereira", region: "Andina", cap: [-75.6961, 4.8133] },
  "68": { nombre: "Santander", capital: "Bucaramanga", region: "Andina", cap: [-73.1198, 7.1193] },
  "70": { nombre: "Sucre", capital: "Sincelejo", region: "Caribe", cap: [-75.3978, 9.3047] },
  "73": { nombre: "Tolima", capital: "Ibagué", region: "Andina", cap: [-75.2322, 4.4389] },
  "76": { nombre: "Valle del Cauca", capital: "Cali", region: "Pacífica", cap: [-76.532, 3.4516] },
  "81": { nombre: "Arauca", capital: "Arauca", region: "Orinoquía", cap: [-70.7591, 7.0847] },
  "85": { nombre: "Casanare", capital: "Yopal", region: "Orinoquía", cap: [-72.3959, 5.3378] },
  "86": { nombre: "Putumayo", capital: "Mocoa", region: "Amazonía", cap: [-76.6473, 1.1528] },
  "88": { nombre: "San Andrés y Providencia", capital: "San Andrés", region: "Insular", cap: [-81.7006, 12.5847] },
  "91": { nombre: "Amazonas", capital: "Leticia", region: "Amazonía", cap: [-69.9406, -4.2153] },
  "94": { nombre: "Guainía", capital: "Inírida", region: "Amazonía", cap: [-67.9239, 3.8653] },
  "95": { nombre: "Guaviare", capital: "San José del Guaviare", region: "Amazonía", cap: [-72.6459, 2.5729] },
  "97": { nombre: "Vaupés", capital: "Mitú", region: "Amazonía", cap: [-70.2339, 1.2536] },
  "99": { nombre: "Vichada", capital: "Puerto Carreño", region: "Orinoquía", cap: [-67.4859, 6.189] },
};

export const REGIONES: Record<Region, string> = {
  Caribe: "#F6C344",
  Andina: "#EF7B57",
  Pacífica: "#2EC4B6",
  Orinoquía: "#B9DC6B",
  Amazonía: "#2FA56A",
  Insular: "#5DA9E9",
};
