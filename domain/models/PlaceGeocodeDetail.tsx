export interface PlaceGeocodeDetail {
  plus_code: Pluscode;
  results: Result[];
  status: string;
}
interface Result {
  address_components: Addresscomponent[];
  formatted_address: string;
  geometry: Geometry;
  navigation_points?: Navigationpoint[];
  place_id: string;
  plus_code?: Pluscode;
  types: string[];
}
interface Navigationpoint {
  location: Location2;
}
interface Location2 {
  latitude: number;
  longitude: number;
}
interface Geometry {
  location: Location;
  location_type: string;
  viewport: Viewport;
  bounds?: Viewport;
}
interface Viewport {
  northeast: Location;
  southwest: Location;
}
interface Location {
  lat: number;
  lng: number;
}
interface Addresscomponent {
  long_name: string;
  short_name: string;
  types: string[];
}
interface Pluscode {
  global_code: string;
}