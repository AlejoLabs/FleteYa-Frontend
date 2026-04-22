export interface GoogleDirections {
  geocoded_waypoints: Geocodedwaypoint[];
  routes: Route[];
  status: string;
}
interface Route {
  bounds: Bounds;
  copyrights: string;
  legs: Leg[];
  overview_polyline: Polyline;
  summary: string;
  warnings: any[];
  waypoint_order: any[];
}
interface Leg {
  distance: Distance;
  duration: Distance;
  end_address: string;
  end_location: Northeast;
  start_address: string;
  start_location: Northeast;
  steps: Step[];
  traffic_speed_entry: any[];
  via_waypoint: any[];
}
interface Step {
  distance: Distance;
  duration: Distance;
  end_location: Northeast;
  html_instructions: string;
  polyline: Polyline;
  start_location: Northeast;
  travel_mode: string;
  maneuver?: string;
}
interface Polyline {
  points: string;
}
interface Distance {
  text: string;
  value: number;
}
interface Bounds {
  northeast: Northeast;
  southwest: Northeast;
}
interface Northeast {
  lat: number;
  lng: number;
}
interface Geocodedwaypoint {
  geocoder_status: string;
  place_id: string;
  types: string[];
}