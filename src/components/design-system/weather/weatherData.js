/**
 * Weather Mock Data
 *
 * 날씨 대시보드에서 사용하는 목업 데이터입니다.
 */

/** 날씨 상태 아이콘 매핑 */
export const weatherIcons = {
  sunny: 'clear_day',
  partlyCloudy: 'partly_cloudy_day',
  cloudy: 'cloud',
  rainy: 'rainy',
  stormy: 'thunderstorm',
  snowy: 'weather_snowy',
  foggy: 'foggy',
  windy: 'air',
  night: 'clear_night',
  nightCloudy: 'nights_stay',
};

/** 
 * Pixel Art SVG Paths
 * Source: pixelarticons (npm)
 * 24x24 픽셀 그리드 아이콘
 */
export const pixelWeatherIcons = {
  // Sunny / Clear Day (sun.svg)
  clear_day: 'M13 3h-2v2h2V3zm4 2h2v2h-2V5zm-6 6h2v2h-2v-2zm-8 0h2v2H3v-2zm18 0h-2v2h2v-2zM5 5h2v2H5V5zm14 14h-2v-2h2v2zm-8 2h2v-2h-2v2zm-4-2H5v-2h2v2zM9 7h6v2H9V7zm0 8H7V9h2v6zm0 0v2h6v-2h2V9h-2v6H9z',
  
  // Night / Clear Night (moon.svg)
  clear_night: 'M6 2h8v2h-2v2h-2V4H6V2ZM4 6V4h2v2H4Zm0 10H2V6h2v10Zm2 2H4v-2h2v2Zm2 2H6v-2h2v2Zm10 0v2H8v-2h10Zm2-2v2h-2v-2h2Zm-2-4h2v4h2v-8h-2v2h-2v2Zm-6 0v2h6v-2h-6Zm-2-2h2v2h-2v-2Zm0 0V6H8v6h2Z',
  
  // Cloudy (cloud.svg)
  cloud: 'M16 4h-6v2H8v2H4v2H2v2H0v6h2v2h20v-2h2v-6h-2v-2h-2V8h-2V6h-2V4zm2 8h4v6H2v-6h2v-2h4v2h2v-2H8V8h2V6h6v2h2v4zm0 0v2h-2v-2h2z',
  
  // Partly Cloudy Day (cloud-sun.svg)
  partly_cloudy_day: 'M11 0h2v4h-2V0Zm1 12H8v2H4v2H2v4h2v2h10v-2h2v-4h-2v-2h-2v-2Zm0 2v2h2v4H4v-4h4v2h2v-2H8v-2h4ZM8 6h6v2H8V6Zm0 2v2H6V8h2Zm8 2h-2V8h2v2Zm0 0h2v2h-2v-2Zm4-8h2v2h-2V2Zm0 2v2h-2V4h2ZM2 2h2v2H2V2Zm2 2h2v2H4V4Zm20 7h-4v2h4v-2Z',
  
  // Night Cloudy (cloud-moon.svg)
  nights_stay: 'M18 2h-8v2H8v2H6v4h2V6h2V4h4v2h-2v4h2v2h4v-2h2v4h-2v2h2v-2h2V6h-2v2h-2v2h-4V6h2V4h2V2ZM8 14v-2h4v2H8Zm0 2v-2H4v2H2v4h2v2h10v-2h2v-4h-2v-2h-2v2h2v4H4v-4h4Zm0 0h2v2H8v-2Z',
  
  // Rainy (cloud-download.svg - as a metaphor for rain)
  rainy: 'M10 4h6v2h-6V4zM8 8V6h2v2H8zm-4 2V8h4v2H4zm-2 2v-2h2v2H2zm0 6H0v-6h2v6zm0 0h5v2H2v-2zM18 8h-2V6h2v2zm4 4h-4V8h2v2h2v2zm0 6v-6h2v6h-2zm0 0v2h-5v-2h5zm-11 2h2v-2h2v-2h2v-2h-4V9h-2v5H7v2h2v2h2v2z',
  
  // Stormy / Thunderstorm (zap.svg)
  thunderstorm: 'M12 1h2v8h8v4h-2v-2h-8V5h-2V3h2V1zM8 7V5h2v2H8zM6 9V7h2v2H6zm-2 2V9h2v2H4zm10 8v2h-2v2h-2v-8H2v-4h2v2h8v6h2zm2-2v2h-2v-2h2zm2-2v2h-2v-2h2zm0 0h2v-2h-2v2z',
  
  // Snowy (ac.svg - snowflake)
  weather_snowy: 'M13 2h-2v4H9V4H7v2h2v2h2v3H8V9H6V7H4v2h2v2H2v2h4v2H4v2h2v-2h2v-2h3v3H9v2H7v2h2v-2h2v4h2v-4h2v2h2v-2h-2v-2h-2v-3h3v2h2v2h2v-2h-2v-2h4v-2h-4V9h2V7h-2v2h-2v2h-3V8h2V6h2V4h-2v2h-2V2z',
  
  // Foggy (cloud.svg - reused as fog)
  foggy: 'M16 4h-6v2H8v2H4v2H2v2H0v6h2v2h20v-2h2v-6h-2v-2h-2V8h-2V6h-2V4zm2 8h4v6H2v-6h2v-2h4v2h2v-2H8V8h2V6h6v2h2v4zm0 0v2h-2v-2h2z',
  
  // Windy / Air (wind.svg)
  air: 'M12 3H8v2h4v2H2v2h12V3h-2zm10 8V7h-6v2h4v2H2v2h20v-2zM2 17v-2h14v6h-6v-2h4v-2H2z',
  
  // Location (pin.svg)
  location_on: 'M7 2h10v2H7V2zM5 6V4h2v2H5zm0 8H3V6h2v8zm2 2H5v-2h2v2zm2 2H7v-2h2v2zm2 2H9v-2h2v2zm2 0v2h-2v-2h2zm2-2v2h-2v-2h2zm2-2v2h-2v-2h2zm2-2v2h-2v-2h2zm0-8h2v8h-2V6zm0 0V4h-2v2h2zm-5 2h-4v4h4V8z',
  
  // Humidity (drop.svg)
  humidity_percentage: 'M13 2h-2v2H9v4H7v4H5v6h2v2h2v2h6v-2h2v-2h2v-6h-2V8h-2V4h-2V2zm0 2v4h2v4h2v6h-2v2H9v-2H7v-6h2V8h2V4h2z',
  
  // UV Index (sun.svg)
  wb_sunny: 'M13 3h-2v2h2V3zm4 2h2v2h-2V5zm-6 6h2v2h-2v-2zm-8 0h2v2H3v-2zm18 0h-2v2h2v-2zM5 5h2v2H5V5zm14 14h-2v-2h2v2zm-8 2h2v-2h-2v2zm-4-2H5v-2h2v2zM9 7h6v2H9V7zm0 8H7V9h2v6zm0 0v2h6v-2h2V9h-2v6H9z',
  
  // Thermostat / Feels Like (device-tablet.svg - used as display)
  thermostat: 'M6 2H4v20h16V2H6zm12 2v16H6V4h12zm-5 12h-2v2h2v-2z',
  
  // Pressure (speed-medium.svg)
  speed: 'M13 5h-2v8h-1v4h4v-4h-1V5zM9 7H5v2H3v2H1v6h2v2h2v-2H3v-6h2V9h4V7zm12 4h2v6h-2v-6zm-2-2h2v2h-2V9zm0 0h-4V7h4v2zm2 8v2h-2v-2h2z',
  
  // Visibility (eye.svg)
  visibility: 'M8 6h8v2H8V6zm-4 4V8h4v2H4zm-2 2v-2h2v2H2zm0 2v-2H0v2h2zm2 2H2v-2h2v2zm4 2H4v-2h4v2zm8 0v2H8v-2h8zm4-2v2h-4v-2h4zm2-2v2h-2v-2h2zm0-2h2v2h-2v-2zm-2-2h2v2h-2v-2zm0 0V8h-4v2h4zm-10 1h4v4h-4v-4z',
  
  // Sunrise/Sunset (sun-alt.svg)
  wb_twilight: 'M13 0h-2v4h2V0ZM0 11v2h4v-2H0Zm24 0v2h-4v-2h4ZM13 24h-2v-4h2v4ZM8 6h8v2H8V6ZM6 8h2v8H6V8Zm2 10v-2h8v2H8Zm10-2h-2V8h2v8Zm2-14h2v2h-2V2Zm0 2v2h-2V4h2Zm2 18h-2v-2h2v2Zm-2-2h-2v-2h2v2ZM4 2H2v2h2v2h2V4H4V2ZM2 22h2v-2h2v-2H4v2H2v2Z',
};

/** 현재 날씨 데이터 */
export const currentWeather = {
  location: 'Seoul, Korea',
  temperature: 28,
  feelsLike: 31,
  condition: 'sunny',
  conditionText: 'Sunny',
  humidity: 65,
  windSpeed: 12,
  windDirection: 'NE',
  uvIndex: 8,
  uvLevel: 'Very High',
  pressure: 1013,
  visibility: 10,
  high: 32,
  low: 24,
  sunrise: '05:42',
  sunset: '19:38',
  updatedAt: 'Updated 5 min ago',
};

/** 시간별 예보 데이터 */
export const hourlyForecast = [
  { time: 'Now', temp: 28, condition: 'sunny', precipitation: 0 },
  { time: '1PM', temp: 29, condition: 'sunny', precipitation: 0 },
  { time: '2PM', temp: 30, condition: 'sunny', precipitation: 0 },
  { time: '3PM', temp: 31, condition: 'partlyCloudy', precipitation: 10 },
  { time: '4PM', temp: 30, condition: 'partlyCloudy', precipitation: 15 },
  { time: '5PM', temp: 29, condition: 'cloudy', precipitation: 25 },
  { time: '6PM', temp: 28, condition: 'cloudy', precipitation: 30 },
  { time: '7PM', temp: 27, condition: 'rainy', precipitation: 60 },
  { time: '8PM', temp: 26, condition: 'rainy', precipitation: 70 },
  { time: '9PM', temp: 25, condition: 'rainy', precipitation: 55 },
  { time: '10PM', temp: 24, condition: 'nightCloudy', precipitation: 40 },
  { time: '11PM', temp: 24, condition: 'night', precipitation: 20 },
];

/** 주간 예보 데이터 */
export const weeklyForecast = [
  { day: 'Today', date: 'Nov 28', high: 32, low: 24, condition: 'sunny', precipitation: 10 },
  { day: 'Fri', date: 'Nov 29', high: 30, low: 23, condition: 'partlyCloudy', precipitation: 20 },
  { day: 'Sat', date: 'Nov 30', high: 26, low: 20, condition: 'rainy', precipitation: 80 },
  { day: 'Sun', date: 'Dec 1', high: 24, low: 18, condition: 'rainy', precipitation: 70 },
  { day: 'Mon', date: 'Dec 2', high: 25, low: 17, condition: 'cloudy', precipitation: 30 },
  { day: 'Tue', date: 'Dec 3', high: 27, low: 19, condition: 'partlyCloudy', precipitation: 15 },
  { day: 'Wed', date: 'Dec 4', high: 29, low: 21, condition: 'sunny', precipitation: 5 },
];

/** 상세 날씨 정보 */
export const weatherDetails = [
  { label: 'Humidity', value: '65%', icon: 'humidity_percentage' },
  { label: 'Wind', value: '12 km/h NE', icon: 'air' },
  { label: 'UV Index', value: '8 (Very High)', icon: 'wb_sunny' },
  { label: 'Feels Like', value: '31°', icon: 'thermostat' },
  { label: 'Pressure', value: '1013 hPa', icon: 'speed' },
  { label: 'Visibility', value: '10 km', icon: 'visibility' },
];

/** 공기질 데이터 */
export const airQuality = {
  index: 72,
  level: 'Moderate',
  pm25: 35,
  pm10: 68,
  o3: 45,
  no2: 28,
};

export default {
  weatherIcons,
  pixelWeatherIcons,
  currentWeather,
  hourlyForecast,
  weeklyForecast,
  weatherDetails,
  airQuality,
};
