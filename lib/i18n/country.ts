import { isMarket, markets } from "./config";
import { countryName } from "./format";

/** Record the export country in the city field; the stored enquiry shape is unchanged. */
export function withCountry(city: string, market: unknown) {
  if (!isMarket(market) || market === "in") return city;
  const country = countryName(markets[market].country, "en");
  if (city.toLowerCase().includes(country.toLowerCase())) return city;
  const suffix = `, ${country}`;
  return `${city.slice(0, 100 - suffix.length).trim()}${suffix}`;
}
