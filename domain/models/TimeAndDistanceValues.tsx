export interface TimeAndDistanceValues {
    distance:            Distance;
    duration:            Distance;
    origin_address:      string;
    destination_address: string;
    recommended_value:   number;
}

export interface Distance {
    text:  string;
    value: number;
}

export interface Duration {
    text:  string;
    value: number;
}
