import locations from "./data/india-locations.json";

/** Local convenience options; never an eligibility or delivery-area check. */
export const indiaStates = locations.map(({ code, name }) => ({ code, name }));
export function citiesForState(name: string) {
  return locations.find((state) => state.name === name)?.cities ?? [];
}
