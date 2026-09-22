import { normalizeText } from "./string";

type ShippingZone = {
  fee: number;
  aliases: string[];
};

const SHIPPING_ZONES: ShippingZone[] = [
  {
    fee: 25000,
    aliases: [
      "hochiminh",
      "tphochiminh",
      "tphcm",
      "tpchm",
      "hcm",
      "saigon",
      "sg",
    ],
  },

  {
    fee: 35000,
    aliases: [
      "hanoi",
      "hn",
      "tphanoi",
    ],
  },

  {
    fee: 35000,
    aliases: [
      "danang",
      "tpdanang",
    ],
  },

  {
    fee: 35000,
    aliases: [
      "cantho",
      "tpcantho",
    ],
  },
];

export function getShippingFee(city: string) {

  const value = normalizeText(city);

  if (!value) return 0;

  const zone = SHIPPING_ZONES.find(zone =>
    zone.aliases.some(alias => value.includes(alias))
  );

  return zone?.fee ?? 35000;
}