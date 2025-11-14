// Weather icon SVG components
export const SunIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" strokeWidth="2" fill="#FDB813" stroke="#FDB813"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
      d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" 
      stroke="#FDB813"/>
  </svg>
);

export const CloudIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      fill="#E0E0E0" stroke="#9E9E9E"/>
  </svg>
);

export const PartlyCloudyIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle cx="14" cy="8" r="3.5" fill="#FDB813" stroke="#FDB813" strokeWidth="1.5"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
      d="M14 2v1.5m5.66 1.84l-1.06 1.06M22 8h-1.5m-1.16 5.66l-1.06-1.06"
      stroke="#FDB813"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M3 17a3 3 0 003 3h7a4 4 0 100-8 4.992 4.992 0 00-8.5 2.5A3 3 0 003 17z"
      fill="#E0E0E0" stroke="#9E9E9E"/>
  </svg>
);

export const RainIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M3 12a4 4 0 004 4h9a5 5 0 100-10 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 12z"
      fill="#B0BEC5" stroke="#78909C"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M8 16v3m4-3v4m4-4v3" stroke="#4FC3F7"/>
  </svg>
);

export const SnowIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M3 12a4 4 0 004 4h9a5 5 0 100-10 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 12z"
      fill="#E3F2FD" stroke="#90CAF9"/>
    <circle cx="7" cy="17" r="1" fill="#B3E5FC"/>
    <circle cx="11" cy="18" r="1" fill="#B3E5FC"/>
    <circle cx="15" cy="17" r="1" fill="#B3E5FC"/>
    <circle cx="9" cy="20" r="1" fill="#B3E5FC"/>
    <circle cx="13" cy="21" r="1" fill="#B3E5FC"/>
  </svg>
);

export const ThunderstormIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M3 12a4 4 0 004 4h9a5 5 0 100-10 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 12z"
      fill="#78909C" stroke="#546E7A"/>
    <path d="M12 16l-2 4h3l-2 3 4-5h-3l2-2z" fill="#FDD835" stroke="#F9A825" strokeWidth="1"/>
  </svg>
);

export const MistIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M4 10h12M4 14h16M4 18h10" stroke="#B0BEC5"/>
  </svg>
);

// Map OpenWeather icon codes to components
export const getWeatherIcon = (iconCode) => {
  if (!iconCode) return CloudIcon;
  
  const code = iconCode.substring(0, 2); // Get first 2 chars (01, 02, 03, etc.)
  
  const iconMap = {
    '01': SunIcon,           // clear sky
    '02': PartlyCloudyIcon,  // few clouds
    '03': CloudIcon,         // scattered clouds
    '04': CloudIcon,         // broken clouds
    '09': RainIcon,          // shower rain
    '10': RainIcon,          // rain
    '11': ThunderstormIcon,  // thunderstorm
    '13': SnowIcon,          // snow
    '50': MistIcon,          // mist
  };
  
  return iconMap[code] || CloudIcon;
};