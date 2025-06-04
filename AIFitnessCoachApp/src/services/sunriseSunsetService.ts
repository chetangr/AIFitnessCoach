import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SunTimes {
  sunrise: Date;
  sunset: Date;
}

export class SunriseSunsetService {
  private static readonly LOCATION_KEY = '@user_location';
  private static readonly DEFAULT_LATITUDE = 40.7128; // New York
  private static readonly DEFAULT_LONGITUDE = -74.0060;

  /**
   * Calculate sunrise and sunset times for a given date and location
   * Using simplified sunrise equation
   */
  static calculateSunTimes(date: Date, latitude: number, longitude: number): SunTimes {
    // Julian day number
    const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
    const y = date.getFullYear() + 4800 - a;
    const m = (date.getMonth() + 1) + 12 * a - 3;
    const JDN = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    // Calculate solar noon
    const lw = -longitude * Math.PI / 180;
    const n = JDN - 2451545.0 + 0.0008;
    const Js = n - lw / (2 * Math.PI);
    const M = (357.5291 + 0.98560028 * Js) % 360;
    const C = 1.9148 * Math.sin(M * Math.PI / 180) + 0.02 * Math.sin(2 * M * Math.PI / 180) + 0.0003 * Math.sin(3 * M * Math.PI / 180);
    const L = (M + C + 180 + 102.9372) % 360;
    const Jt = 2451545.0 + Js + 0.0053 * Math.sin(M * Math.PI / 180) - 0.0069 * Math.sin(2 * L * Math.PI / 180);
    
    // Solar declination
    const delta = Math.asin(Math.sin(L * Math.PI / 180) * Math.sin(23.44 * Math.PI / 180));
    
    // Hour angle
    const latRad = latitude * Math.PI / 180;
    const cosH = -Math.tan(latRad) * Math.tan(delta);
    
    // Handle polar day/night
    if (cosH > 1) {
      // Polar night
      return {
        sunrise: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0),
        sunset: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0)
      };
    } else if (cosH < -1) {
      // Polar day
      return {
        sunrise: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0),
        sunset: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59)
      };
    }
    
    const H = Math.acos(cosH) * 180 / Math.PI;
    
    // Calculate sunrise and sunset Julian times
    const Jrise = Jt - H / 360;
    const Jset = Jt + H / 360;
    
    // Convert to dates
    const sunrise = this.julianToDate(Jrise, longitude);
    const sunset = this.julianToDate(Jset, longitude);
    
    return { sunrise, sunset };
  }

  private static julianToDate(julian: number, longitude: number): Date {
    const millisSince2000 = (julian - 2451545.0) * 86400000;
    const date = new Date(Date.UTC(2000, 0, 1, 12, 0, 0, 0));
    date.setTime(date.getTime() + millisSince2000);
    
    // Adjust for timezone (approximate)
    const timezoneOffset = Math.round(longitude / 15) * 60;
    date.setMinutes(date.getMinutes() + timezoneOffset);
    
    return date;
  }

  /**
   * Get the user's location with permission
   */
  static async getUserLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      // Check for existing saved location first
      const savedLocation = await AsyncStorage.getItem(this.LOCATION_KEY);
      if (savedLocation) {
        return JSON.parse(savedLocation);
      }

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied, using default location');
        return null;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Save location for future use
      await AsyncStorage.setItem(this.LOCATION_KEY, JSON.stringify(coords));
      
      return coords;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  /**
   * Get today's sun times based on user location or default
   */
  static async getTodaySunTimes(): Promise<SunTimes> {
    const location = await this.getUserLocation();
    const { latitude, longitude } = location || {
      latitude: this.DEFAULT_LATITUDE,
      longitude: this.DEFAULT_LONGITUDE,
    };

    return this.calculateSunTimes(new Date(), latitude, longitude);
  }

  /**
   * Check if it's currently dark (between sunset and sunrise)
   */
  static async isDarkTime(): Promise<boolean> {
    const { sunrise, sunset } = await this.getTodaySunTimes();
    const now = new Date();
    
    // If current time is before sunrise or after sunset, it's dark
    return now < sunrise || now > sunset;
  }

  /**
   * Get time until next theme change (sunrise or sunset)
   */
  static async getTimeUntilNextChange(): Promise<{ time: Date; isDarkNext: boolean }> {
    const { sunrise, sunset } = await this.getTodaySunTimes();
    const now = new Date();
    
    if (now < sunrise) {
      // Before sunrise - next change is sunrise (to light)
      return { time: sunrise, isDarkNext: false };
    } else if (now < sunset) {
      // Between sunrise and sunset - next change is sunset (to dark)
      return { time: sunset, isDarkNext: true };
    } else {
      // After sunset - next change is tomorrow's sunrise
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const location = await this.getUserLocation();
      const { latitude, longitude } = location || {
        latitude: this.DEFAULT_LATITUDE,
        longitude: this.DEFAULT_LONGITUDE,
      };
      const tomorrowSunTimes = this.calculateSunTimes(tomorrow, latitude, longitude);
      return { time: tomorrowSunTimes.sunrise, isDarkNext: false };
    }
  }
}