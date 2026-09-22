import addressData from "@/data/vietnam-address.json";

export type Ward = {
  Id: string;
  Name: string;
};

export type District = {
  Id: string;
  Name: string;
  Wards: Ward[];
};

export type Province = {
  Id: string;
  Name: string;
  Districts: District[];
};

export const provinces = addressData as Province[];

export function getDistricts(name: string) {
  const province = provinces.find((p) => p.Name === name);
  return province?.Districts ?? [];
}

export function getWards(
  provinceName: string,
  districtName: string
) {
  const province = provinces.find(
    (p) => p.Name === provinceName
  );

  const district = province?.Districts.find(
    (d) => d.Name === districtName
  );

  return district?.Wards ?? [];
}