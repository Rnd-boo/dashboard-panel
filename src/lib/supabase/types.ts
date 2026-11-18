export type SensorReading = {
  id: number;
  recorded_at: string;
  voltage: number;
  current: number;
  power: number;
  panel_temperature: number | null;
  light_lux: number | null;
  air_temperature: number | null;
  humidity: number | null;
};

export type Database = {
  public: {
    Tables: {
      sensor_readings: {
        Row: SensorReading;
        Insert: Omit<SensorReading, "id"> & { id?: number };
        Update: Partial<SensorReading>;
      };
    };
  };
};
