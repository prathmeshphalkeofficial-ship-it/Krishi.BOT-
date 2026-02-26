export type Language = "en" | "hi" | "mr"

export const languages: { code: Language; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
]

type TranslationKeys = {
  // Navbar
  dashboard: string
  chatbot: string
  voice: string
  settings: string
  appName: string
  tagline: string

  // Dashboard
  soilMoisture: string
  temperature: string
  humidity: string
  windSpeed: string
  weather: string
  motorStatus: string
  motorOn: string
  motorOff: string
  autoMode: string
  manualMode: string
  turnOn: string
  turnOff: string
  irrigationControl: string
  liveMonitoring: string
  weatherForecast: string
  moistureHistory: string
  lastUpdated: string
  safetyTimer: string
  minutes: string
  rainForecast: string
  sunny: string
  partlyCloudy: string
  rainy: string

  // Chatbot
  chatPlaceholder: string
  sendMessage: string
  chatWelcome: string
  suggestedQuestions: string

  // Voice
  voiceAssistant: string
  tapToSpeak: string
  listening: string
  processing: string
  speaking: string
  voiceReady: string
  voiceCommands: string

  // Settings
  language: string
  theme: string
  darkMode: string
  notifications: string
  moistureThreshold: string
  autoIrrigation: string
  generalSettings: string
  deviceSettings: string
  save: string

  // General
  loading: string
  error: string
  success: string
  cancel: string
  confirm: string
  welcome: string
  selectLanguage: string
}

const translations: Record<Language, TranslationKeys> = {
  en: {
    dashboard: "Dashboard",
    chatbot: "AI Chat",
    voice: "Voice",
    settings: "Settings",
    appName: "KrishiBot AI",
    tagline: "Smart Farming Assistant",

    soilMoisture: "Soil Moisture",
    temperature: "Temperature",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    weather: "Weather",
    motorStatus: "Motor Status",
    motorOn: "Motor ON",
    motorOff: "Motor OFF",
    autoMode: "Auto Mode",
    manualMode: "Manual Mode",
    turnOn: "Turn On",
    turnOff: "Turn Off",
    irrigationControl: "Irrigation Control",
    liveMonitoring: "Live Monitoring",
    weatherForecast: "Weather Forecast",
    moistureHistory: "Moisture History",
    lastUpdated: "Last updated",
    safetyTimer: "Safety Timer",
    minutes: "minutes",
    rainForecast: "Rain Forecast",
    sunny: "Sunny",
    partlyCloudy: "Partly Cloudy",
    rainy: "Rainy",

    chatPlaceholder: "Ask about crops, pests, fertilizers...",
    sendMessage: "Send",
    chatWelcome: "Hello! I'm KrishiBot, your smart farming assistant. Ask me anything about agriculture.",
    suggestedQuestions: "Suggested Questions",

    voiceAssistant: "Voice Assistant",
    tapToSpeak: "Tap to speak",
    listening: "Listening...",
    processing: "Processing...",
    speaking: "Speaking...",
    voiceReady: "Ready to listen",
    voiceCommands: "Voice Commands",

    language: "Language",
    theme: "Theme",
    darkMode: "Dark Mode",
    notifications: "Notifications",
    moistureThreshold: "Moisture Threshold",
    autoIrrigation: "Auto Irrigation",
    generalSettings: "General Settings",
    deviceSettings: "Device Settings",
    save: "Save Settings",

    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    welcome: "Welcome to KrishiBot AI",
    selectLanguage: "Select Language",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    chatbot: "AI चैट",
    voice: "आवाज़",
    settings: "सेटिंग्स",
    appName: "कृषिबॉट AI",
    tagline: "स्मार्ट कृषि सहायक",

    soilMoisture: "मिट्टी की नमी",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    windSpeed: "हवा की गति",
    weather: "मौसम",
    motorStatus: "मोटर स्थिति",
    motorOn: "मोटर चालू",
    motorOff: "मोटर बंद",
    autoMode: "ऑटो मोड",
    manualMode: "मैनुअल मोड",
    turnOn: "चालू करें",
    turnOff: "बंद करें",
    irrigationControl: "सिंचाई नियंत्रण",
    liveMonitoring: "लाइव निगरानी",
    weatherForecast: "मौसम पूर्वानुमान",
    moistureHistory: "नमी इतिहास",
    lastUpdated: "अंतिम अपडेट",
    safetyTimer: "सुरक्षा टाइमर",
    minutes: "मिनट",
    rainForecast: "बारिश का पूर्वानुमान",
    sunny: "धूप",
    partlyCloudy: "आंशिक बादल",
    rainy: "बारिश",

    chatPlaceholder: "फसल, कीट, उर्वरक के बारे में पूछें...",
    sendMessage: "भेजें",
    chatWelcome: "नमस्ते! मैं कृषिबॉट हूँ, आपका स्मार्ट कृषि सहायक। कृषि के बारे में कुछ भी पूछें।",
    suggestedQuestions: "सुझाए गए प्रश्न",

    voiceAssistant: "आवाज़ सहायक",
    tapToSpeak: "बोलने के लिए दबाएं",
    listening: "सुन रहा है...",
    processing: "प्रोसेसिंग...",
    speaking: "बोल रहा है...",
    voiceReady: "सुनने के लिए तैयार",
    voiceCommands: "आवाज़ कमांड",

    language: "भाषा",
    theme: "थीम",
    darkMode: "डार्क मोड",
    notifications: "सूचनाएं",
    moistureThreshold: "नमी सीमा",
    autoIrrigation: "ऑटो सिंचाई",
    generalSettings: "सामान्य सेटिंग्स",
    deviceSettings: "डिवाइस सेटिंग्स",
    save: "सेटिंग्स सहेजें",

    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफलता",
    cancel: "रद्द करें",
    confirm: "पुष्टि करें",
    welcome: "कृषिबॉट AI में आपका स्वागत है",
    selectLanguage: "भाषा चुनें",
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    chatbot: "AI चॅट",
    voice: "आवाज",
    settings: "सेटिंग्ज",
    appName: "कृषिबॉट AI",
    tagline: "स्मार्ट शेती सहाय्यक",

    soilMoisture: "मातीतील ओलावा",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    windSpeed: "वाऱ्याचा वेग",
    weather: "हवामान",
    motorStatus: "मोटर स्थिती",
    motorOn: "मोटर चालू",
    motorOff: "मोटर बंद",
    autoMode: "ऑटो मोड",
    manualMode: "मॅन्युअल मोड",
    turnOn: "चालू करा",
    turnOff: "बंद करा",
    irrigationControl: "सिंचन नियंत्रण",
    liveMonitoring: "लाइव्ह निरीक्षण",
    weatherForecast: "हवामान अंदाज",
    moistureHistory: "ओलावा इतिहास",
    lastUpdated: "शेवटचा अपडेट",
    safetyTimer: "सुरक्षा टाइमर",
    minutes: "मिनिटे",
    rainForecast: "पावसाचा अंदाज",
    sunny: "ऊन",
    partlyCloudy: "अंशतः ढगाळ",
    rainy: "पाऊस",

    chatPlaceholder: "पिके, कीड, खत याबद्दल विचारा...",
    sendMessage: "पाठवा",
    chatWelcome: "नमस्कार! मी कृषिबॉट आहे, तुमचा स्मार्ट शेती सहाय्यक. शेतीबद्दल काहीही विचारा.",
    suggestedQuestions: "सुचवलेले प्रश्न",

    voiceAssistant: "आवाज सहाय्यक",
    tapToSpeak: "बोलण्यासाठी दाबा",
    listening: "ऐकत आहे...",
    processing: "प्रक्रिया होत आहे...",
    speaking: "बोलत आहे...",
    voiceReady: "ऐकण्यास तयार",
    voiceCommands: "आवाज कमांड",

    language: "भाषा",
    theme: "थीम",
    darkMode: "डार्क मोड",
    notifications: "सूचना",
    moistureThreshold: "ओलावा मर्यादा",
    autoIrrigation: "ऑटो सिंचन",
    generalSettings: "सामान्य सेटिंग्ज",
    deviceSettings: "डिव्हाइस सेटिंग्ज",
    save: "सेटिंग्ज जतन करा",

    loading: "लोड होत आहे...",
    error: "त्रुटी",
    success: "यशस्वी",
    cancel: "रद्द करा",
    confirm: "पुष्टी करा",
    welcome: "कृषिबॉट AI मध्ये आपले स्वागत आहे",
    selectLanguage: "भाषा निवडा",
  },
}

export function t(key: keyof TranslationKeys, lang: Language): string {
  return translations[lang]?.[key] || translations.en[key] || key
}
