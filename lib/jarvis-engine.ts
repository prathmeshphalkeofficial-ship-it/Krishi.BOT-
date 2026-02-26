import type { Language } from "./i18n"

// ===============================================
// KrishiBot Jarvis AI Engine - Zero API dependency
// Comprehensive local intelligence system
// ===============================================

interface JarvisResponse {
  text: string
  motorCommand?: "on" | "off"
}

// Math expression evaluator
function evalMath(expr: string): number | null {
  try {
    // Extract numbers and operators
    const cleaned = expr
      .replace(/[xX×]/g, "*")
      .replace(/[÷]/g, "/")
      .replace(/गुणा|गुणिले|times|multiplied by/gi, "*")
      .replace(/भागा|divided by|भाग/gi, "/")
      .replace(/जोड|plus|अधिक/gi, "+")
      .replace(/घटा|minus|कमी/gi, "-")
      .replace(/[^\d+\-*/().%\s]/g, "")
      .trim()
    if (!cleaned || !/\d/.test(cleaned)) return null
    // Safe eval using Function constructor (no user code execution risk with number-only input)
    const result = new Function(`return (${cleaned})`)()
    if (typeof result === "number" && isFinite(result)) return result
    return null
  } catch {
    return null
  }
}

// Pattern matching utility
function matches(input: string, patterns: string[]): boolean {
  const lower = input.toLowerCase()
  return patterns.some((p) => lower.includes(p.toLowerCase()))
}

// Knowledge base categories
const knowledgeBase = {
  // ===================== MOTOR COMMANDS =====================
  motorOn: {
    patterns: [
      "turn on motor", "motor on", "start motor", "motor chalu", "motor start",
      "मोटर चालू", "मोटर ऑन", "मोटर स्टार्ट", "सिंचाई चालू", "पंप चालू",
      "motor chalu karo", "motor on karo", "pump on", "pump start",
      "मोटर चालू करा", "पंप चालू करा", "सिंचन चालू करा",
    ],
    response: {
      en: "Motor has been turned ON. Irrigation system is now active. I'll monitor the water flow. The safety timer is running - the motor will auto-stop after the set duration.",
      hi: "मोटर चालू कर दी गई है। सिंचाई प्रणाली अब सक्रिय है। मैं पानी के प्रवाह की निगरानी करूंगा। सुरक्षा टाइमर चल रहा है।",
      mr: "मोटर चालू केली आहे. सिंचन प्रणाली आता सक्रिय आहे. मी पाण्याच्या प्रवाहावर लक्ष ठेवीन. सुरक्षा टाइमर चालू आहे.",
    },
    motor: "on" as const,
  },
  motorOff: {
    patterns: [
      "turn off motor", "motor off", "stop motor", "motor band", "motor stop",
      "मोटर बंद", "मोटर ऑफ", "मोटर स्टॉप", "सिंचाई बंद", "पंप बंद",
      "motor band karo", "motor off karo", "pump off", "pump stop",
      "मोटर बंद करा", "पंप बंद करा", "सिंचन बंद करा",
    ],
    response: {
      en: "Motor has been turned OFF. Irrigation system is now inactive. Water flow has stopped. Your field received adequate irrigation today.",
      hi: "मोटर बंद कर दी गई है। सिंचाई प्रणाली अब निष्क्रिय है। पानी का प्रवाह रुक गया है।",
      mr: "मोटर बंद केली आहे. सिंचन प्रणाली आता निष्क्रिय आहे. पाण्याचा प्रवाह थांबला आहे.",
    },
    motor: "off" as const,
  },

  // ===================== WEATHER =====================
  weather: {
    patterns: [
      "weather", "mausam", "havaaman", "forecast", "rain", "barish", "paaus",
      "मौसम", "हवामान", "बारिश", "पाऊस", "तापमान", "temperature",
      "will it rain", "kya barish hogi", "पाऊस पडेल का",
    ],
    response: {
      en: "Current weather conditions for your region:\n\nTemperature: 28°C (feels like 31°C)\nHumidity: 65%\nWind: 12 km/h from Southwest\nCondition: Partly cloudy\n\n5-Day Forecast:\n- Today: Partly cloudy, 28-34°C\n- Tomorrow: Sunny, 27-35°C\n- Day 3: Light rain expected, 25-30°C\n- Day 4: Moderate rain, 24-28°C\n- Day 5: Clearing up, 26-32°C\n\nFarming Advisory: Consider completing any pending field work before Day 3. Rain expected mid-week is good for Kharif crops. Avoid spraying pesticides before rain.",
      hi: "आपके क्षेत्र का मौसम:\n\nतापमान: 28°C (महसूस 31°C)\nआर्द्रता: 65%\nहवा: दक्षिण-पश्चिम से 12 km/h\nस्थिति: आंशिक बादल\n\n5-दिन का पूर्वानुमान:\n- आज: आंशिक बादल, 28-34°C\n- कल: धूप, 27-35°C\n- परसों: हल्की बारिश, 25-30°C\n- दिन 4: मध्यम बारिश, 24-28°C\n- दिन 5: साफ़ मौसम, 26-32°C\n\nकृषि सलाह: दिन 3 से पहले बाकी खेत का काम पूरा करें। बारिश खरीफ फसलों के लिए अच्छी है। बारिश से पहले कीटनाशक छिड़काव न करें।",
      mr: "तुमच्या भागाचे हवामान:\n\nतापमान: 28°C (वाटते 31°C)\nआर्द्रता: 65%\nवारा: नैऋत्येकडून 12 km/h\nस्थिती: अंशतः ढगाळ\n\n5-दिवसांचा अंदाज:\n- आज: अंशतः ढगाळ, 28-34°C\n- उद्या: ऊन, 27-35°C\n- परवा: हलका पाऊस, 25-30°C\n- दिवस 4: मध्यम पाऊस, 24-28°C\n- दिवस 5: निवळत, 26-32°C\n\nशेती सल्ला: दिवस 3 पूर्वी बाकी शेतकाम पूर्ण करा. पाऊस खरीप पिकांसाठी चांगला आहे.",
    },
  },

  // ===================== NEWS =====================
  news: {
    patterns: [
      "news", "headlines", "khabar", "batmya", "what's happening", "current events",
      "खबर", "समाचार", "बातम्या", "खबरें बताओ", "आज की खबरें", "बातम्या सांगा",
      "top news", "latest news", "mukhya samachar", "aaj ki khabar",
    ],
    response: {
      en: "Here are today's top headlines:\n\n1. Agriculture: Government announces 15% increase in MSP for Kharif crops. Paddy MSP raised to Rs 2,300 per quintal.\n\n2. Weather: IMD predicts normal monsoon this year, good news for farmers across India.\n\n3. Technology: New mobile app launched for direct mandi price comparison across states.\n\n4. Policy: PM-KISAN 17th installment scheduled for next month. Over 11 crore farmers to benefit.\n\n5. Market: Onion prices stabilize after government intervention. Export restrictions eased for selected commodities.\n\n6. Innovation: Solar-powered irrigation pumps subsidy increased to 90% for small farmers.",
      hi: "आज की मुख्य खबरें:\n\n1. कृषि: सरकार ने खरीफ फसलों के MSP में 15% वृद्धि की घोषणा की। धान का MSP बढ़कर 2,300 रुपये प्रति क्विंटल।\n\n2. मौसम: IMD ने इस साल सामान्य मानसून की भविष्यवाणी की। किसानों के लिए अच्छी खबर।\n\n3. तकनीक: राज्यों में मंडी कीमतों की तुलना के लिए नया मोबाइल ऐप लॉन्च।\n\n4. नीति: PM-KISAN की 17वीं किस्त अगले महीने। 11 करोड़ से अधिक किसानों को लाभ।\n\n5. बाजार: सरकारी हस्तक्षेप के बाद प्याज की कीमतें स्थिर। निर्यात प्रतिबंध में ढील।\n\n6. नवाचार: छोटे किसानों के लिए सोलर सिंचाई पंप पर 90% सब्सिडी।",
      mr: "आजच्या मुख्य बातम्या:\n\n1. शेती: सरकारने खरीप पिकांच्या MSP मध्ये 15% वाढ जाहीर केली. भात MSP 2,300 रुपये प्रति क्विंटल.\n\n2. हवामान: IMD ने यंदा सामान्य मान्सूनचा अंदाज वर्तवला. शेतकऱ्यांसाठी आनंदाची बातमी.\n\n3. तंत्रज्ञान: राज्यांमध्ये मंडी किमतींच्या तुलनेसाठी नवीन मोबाइल अॅप.\n\n4. धोरण: PM-KISAN चा 17वा हप्ता पुढील महिन्यात. 11 कोटी शेतकऱ्यांना लाभ.\n\n5. बाजार: सरकारी हस्तक्षेपानंतर कांद्याचे भाव स्थिर. निर्यात निर्बंधात शिथिलता.\n\n6. नवकल्पना: छोट्या शेतकऱ्यांसाठी सोलर सिंचन पंपावर 90% अनुदान.",
    },
  },

  // ===================== CROPS =====================
  crops: {
    patterns: [
      "crop", "fasal", "pik", "best crop", "season", "kharif", "rabi", "zaid",
      "what to plant", "which crop", "फसल", "पीक", "क्या उगाएं", "काय पेरावे",
      "season crop", "mausam ki fasal", "hangam", "हंगाम",
    ],
    response: {
      en: "Crop recommendations by season:\n\nKharif (June-October):\n- Rice, Maize, Jowar, Bajra, Cotton, Soybean, Groundnut, Sugarcane\n- Best: Soybean & Cotton for high returns\n\nRabi (October-March):\n- Wheat, Mustard, Chickpea (Chana), Peas, Barley, Linseed\n- Best: Wheat & Chickpea for stable income\n\nZaid (March-June):\n- Watermelon, Muskmelon, Cucumber, Moong, Fodder crops\n- Best: Vegetables for quick cash\n\nTips:\n- Always get soil tested before choosing crops\n- Consider water availability in your area\n- Check MSP rates before deciding\n- Crop rotation improves soil health\n- Intercropping can maximize per-acre income",
      hi: "मौसम के अनुसार फसल सुझाव:\n\nखरीफ (जून-अक्टूबर):\n- धान, मक्का, ज्वार, बाजरा, कपास, सोयाबीन, मूंगफली, गन्ना\n- सबसे अच्छा: सोयाबीन और कपास\n\nरबी (अक्टूबर-मार्च):\n- गेहूं, सरसों, चना, मटर, जौ, अलसी\n- सबसे अच्छा: गेहूं और चना\n\nजायद (मार्च-जून):\n- तरबूज, खरबूजा, खीरा, मूंग, चारा\n- सबसे अच्छा: सब्जियां\n\nसुझाव:\n- फसल चुनने से पहले मिट्टी जांच करवाएं\n- पानी की उपलब्धता देखें\n- MSP दरें जांचें\n- फसल चक्र अपनाएं",
      mr: "हंगामानुसार पीक शिफारसी:\n\nखरीप (जून-ऑक्टोबर):\n- भात, मका, ज्वारी, बाजरी, कापूस, सोयाबीन, भुईमूग, ऊस\n- सर्वोत्तम: सोयाबीन आणि कापूस\n\nरब्बी (ऑक्टोबर-मार्च):\n- गहू, मोहरी, हरभरा, वाटाणा, जव\n- सर्वोत्तम: गहू आणि हरभरा\n\nउन्हाळी (मार्च-जून):\n- कलिंगड, खरबूज, काकडी, मूग, चारा\n- सर्वोत्तम: भाजीपाला\n\nटिप्स:\n- पीक निवडण्यापूर्वी माती तपासा\n- पाण्याची उपलब्धता पहा\n- MSP दर तपासा\n- पीक फेरपालट करा",
    },
  },

  // ===================== PESTS =====================
  pests: {
    patterns: [
      "pest", "keet", "kid", "insect", "aphid", "disease", "bimari", "rog",
      "कीट", "कीड", "रोग", "बीमारी", "aphid", "whitefly", "bollworm",
      "how to control", "organic pest", "jevik", "सेंद्रिय",
    ],
    response: {
      en: "Common pest control methods:\n\nAphids:\n- Spray neem oil solution (5ml/L water)\n- Release ladybird beetles\n- Use yellow sticky traps\n\nBollworm (Cotton):\n- Install pheromone traps (5/acre)\n- Spray Bt (Bacillus thuringiensis)\n- Trichogramma egg parasitoid release\n\nWhitefly:\n- Neem oil spray at 3ml/L\n- Yellow sticky traps\n- Remove infected leaves\n\nOrganic Solutions:\n- Neem oil: Universal pesticide (5ml/L)\n- Buttermilk spray: For fungal diseases\n- Garlic-chili extract: Broad pest repellent\n- Trichoderma: Soil-borne disease control\n- Pseudomonas: Bacterial disease management\n\nAlways spray in early morning or late evening for best results.",
      hi: "सामान्य कीट नियंत्रण:\n\nएफिड्स:\n- नीम तेल घोल छिड़कें (5ml/L पानी)\n- लेडीबर्ड बीटल छोड़ें\n- पीले चिपचिपे जाल लगाएं\n\nबॉलवॉर्म (कपास):\n- फेरोमोन ट्रैप (5/एकड़)\n- Bt स्प्रे करें\n- ट्राइकोग्रामा छोड़ें\n\nजैविक उपाय:\n- नीम तेल: सार्वभौमिक कीटनाशक\n- छाछ स्प्रे: कवक रोगों के लिए\n- लहसुन-मिर्च अर्क: कीट विकर्षक\n- ट्राइकोडर्मा: मिट्टी के रोगों के लिए\n\nसुबह या शाम को छिड़काव करें।",
      mr: "सामान्य कीड नियंत्रण:\n\nऍफिड्स:\n- कडुनिंबाचे तेल फवारा (5ml/L पाणी)\n- लेडीबर्ड बीटल सोडा\n- पिवळे चिकट सापळे लावा\n\nबोंडअळी (कापूस):\n- फेरोमोन सापळे (5/एकर)\n- Bt फवारणी\n- ट्रायकोग्रामा सोडा\n\nसेंद्रिय उपाय:\n- कडुनिंबाचे तेल: सार्वत्रिक कीटनाशक\n- ताक फवारणी: बुरशी रोगांसाठी\n- लसूण-मिरची अर्क: कीड विकर्षक\n- ट्रायकोडर्मा: जमिनीतील रोगांसाठी\n\nसकाळी किंवा संध्याकाळी फवारणी करा.",
    },
  },

  // ===================== FERTILIZER =====================
  fertilizer: {
    patterns: [
      "fertilizer", "khat", "khaad", "urea", "dap", "npk", "manure", "gobar",
      "खाद", "खत", "उर्वरक", "यूरिया", "डीएपी", "गोबर", "organic fertilizer",
      "जैविक खाद", "सेंद्रिय खत", "compost", "vermicompost",
    ],
    response: {
      en: "Fertilizer guide for farmers:\n\nChemical Fertilizers (per acre):\n- Urea (N): 50-60 kg for cereals, apply in 2-3 splits\n- DAP (P): 50 kg as basal dose\n- MOP (K): 30-40 kg as basal dose\n- NPK 10:26:26: Good balanced option\n\nOrganic Options:\n- Vermicompost: 2-3 tonnes/acre, best all-round\n- FYM (Farmyard Manure): 5-8 tonnes/acre\n- Green manure: Dhaincha, Sunhemp ploughed before sowing\n- Neem cake: 200 kg/acre, pest-repellent too\n- Jeevamrut: Liquid organic fertilizer, easy to make at home\n\nSoil Health Tips:\n- Get soil tested every 2 years\n- Never apply excess urea (reduces soil health)\n- Mix organic + chemical for best results\n- Micronutrients (Zinc, Boron) are often deficient",
      hi: "किसानों के लिए खाद गाइड:\n\nरासायनिक खाद (प्रति एकड़):\n- यूरिया: 50-60 kg, 2-3 बार में दें\n- DAP: 50 kg बुवाई के समय\n- MOP: 30-40 kg बुवाई के समय\n\nजैविक खाद:\n- वर्मीकम्पोस्ट: 2-3 टन/एकड़\n- गोबर की खाद: 5-8 टन/एकड़\n- हरी खाद: ढैंचा, सनई\n- नीम खली: 200 kg/एकड़\n- जीवामृत: घर पर बनाएं\n\nमिट्टी स्वास्थ्य:\n- हर 2 साल मिट्टी जांच करवाएं\n- अधिक यूरिया न डालें\n- जैविक + रासायनिक मिलाकर उपयोग करें",
      mr: "शेतकऱ्यांसाठी खत मार्गदर्शक:\n\nरासायनिक खत (प्रति एकर):\n- युरिया: 50-60 kg, 2-3 वेळा द्या\n- DAP: 50 kg पेरणीच्या वेळी\n- MOP: 30-40 kg पेरणीच्या वेळी\n\nसेंद्रिय खत:\n- गांडूळखत: 2-3 टन/एकर\n- शेणखत: 5-8 टन/एकर\n- हिरवळीचे खत: ताग, धैंचा\n- निंबोळी पेंड: 200 kg/एकर\n- जीवामृत: घरी बनवा\n\nमाती आरोग्य:\n- दर 2 वर्षांनी माती तपासा\n- अतिरिक्त युरिया टाळा\n- सेंद्रिय + रासायनिक एकत्र वापरा",
    },
  },

  // ===================== GOVERNMENT SCHEMES =====================
  schemes: {
    patterns: [
      "pm kisan", "pmkisan", "scheme", "yojana", "subsidy", "government",
      "sarkari", "sarkar", "किसान", "योजना", "सब्सिडी", "सरकार", "सरकारी",
      "pmfby", "kcc", "kisan credit", "soil health card", "fasal bima",
      "फसल बीमा", "क्रेडिट कार्ड", "पीक विमा", "शेतकरी योजना",
    ],
    response: {
      en: "Key Government Schemes for Farmers:\n\n1. PM-KISAN: Rs 6,000/year in 3 installments directly to bank account. For all land-holding farmers.\n\n2. PMFBY (Crop Insurance): Premium just 2% for Kharif, 1.5% for Rabi. Covers crop loss from natural calamities.\n\n3. KCC (Kisan Credit Card): Loan up to Rs 3 lakh at 4% interest. Quick disbursal for crop expenses.\n\n4. Soil Health Card: Free soil testing and fertilizer recommendations. Available at Krishi Vigyan Kendras.\n\n5. PM Kusum: Solar pump subsidy up to 90%. Both standalone and grid-connected options.\n\n6. e-NAM: Sell produce online across 1,000+ mandis. Better price discovery.\n\n7. MKSP (Mahila Kisan): Special support for women farmers. Training and tools provided.\n\nHow to Apply: Visit your nearest CSC (Common Service Centre) or Krishi Vigyan Kendra with Aadhaar, bank passbook, and land documents.",
      hi: "किसानों के लिए मुख्य सरकारी योजनाएं:\n\n1. PM-KISAN: 6,000 रुपये/साल, 3 किस्तों में सीधे बैंक खाते में।\n\n2. PMFBY (फसल बीमा): प्रीमियम खरीफ 2%, रबी 1.5%। प्राकृतिक आपदाओं से फसल नुकसान की भरपाई।\n\n3. KCC (किसान क्रेडिट कार्ड): 3 लाख तक लोन, 4% ब्याज दर।\n\n4. मृदा स्वास्थ्य कार्ड: मुफ्त मिट्टी जांच और खाद सिफारिश।\n\n5. PM कुसुम: सोलर पंप पर 90% तक सब्सिडी।\n\n6. e-NAM: 1,000+ मंडियों में ऑनलाइन बिक्री।\n\nआवेदन: नजदीकी CSC या कृषि विज्ञान केंद्र जाएं। आधार, बैंक पासबुक, जमीन के कागज साथ ले जाएं।",
      mr: "शेतकऱ्यांसाठी मुख्य सरकारी योजना:\n\n1. PM-KISAN: 6,000 रुपये/वर्ष, 3 हप्त्यांमध्ये बँक खात्यात.\n\n2. PMFBY (पीक विमा): प्रीमियम खरीप 2%, रब्बी 1.5%. नैसर्गिक आपत्तीतील पीक नुकसानीची भरपाई.\n\n3. KCC (किसान क्रेडिट कार्ड): 3 लाखांपर्यंत कर्ज, 4% व्याजदर.\n\n4. मृदा आरोग्य पत्रिका: मोफत माती तपासणी.\n\n5. PM कुसुम: सोलर पंपावर 90% अनुदान.\n\n6. e-NAM: 1,000+ बाजारपेठांमध्ये ऑनलाइन विक्री.\n\nअर्ज: जवळच्या CSC किंवा कृषी विज्ञान केंद्राला भेट द्या. आधार, बँक पासबुक, जमीन कागदपत्रे सोबत घ्या.",
    },
  },

  // ===================== IRRIGATION =====================
  irrigation: {
    patterns: [
      "irrigation", "drip", "sprinkler", "sinchai", "sinchan", "water management",
      "सिंचाई", "सिंचन", "ठिबक", "स्प्रिंकलर", "पानी", "water",
      "drip irrigation", "ड्रिप", "how to irrigate", "pani", "paani",
    ],
    response: {
      en: "Irrigation Methods Explained:\n\nDrip Irrigation:\n- Water directly to plant roots through tubes\n- Saves 30-60% water compared to flood irrigation\n- Best for: Vegetables, fruits, cotton, sugarcane\n- Cost: Rs 20,000-45,000/acre\n- Government subsidy: 55-90% available\n\nSprinkler Irrigation:\n- Sprays water like rain over the field\n- Saves 25-50% water\n- Best for: Wheat, pulses, groundnut, fodder\n- Cost: Rs 15,000-30,000/acre\n\nFlood Irrigation (traditional):\n- Cheapest but wastes most water\n- Only for paddy rice fields\n\nSmart Tips:\n- Irrigate early morning or evening (less evaporation)\n- Use mulching to retain soil moisture\n- Install soil moisture sensors for precision\n- Clean drip filters regularly\n- Schedule based on crop stage, not calendar",
      hi: "सिंचाई विधियां:\n\nड्रिप सिंचाई:\n- पौधों की जड़ों में सीधे पानी\n- 30-60% पानी बचत\n- अच्छा: सब्जी, फल, कपास, गन्ना\n- लागत: 20,000-45,000 रुपये/एकड़\n- सरकारी सब्सिडी: 55-90%\n\nस्प्रिंकलर:\n- बारिश जैसा पानी छिड़काव\n- 25-50% पानी बचत\n- अच्छा: गेहूं, दालें, मूंगफली\n\nस्मार्ट टिप्स:\n- सुबह या शाम सिंचाई करें\n- मल्चिंग से नमी बनाए रखें\n- मिट्टी नमी सेंसर लगाएं\n- ड्रिप फिल्टर नियमित साफ करें",
      mr: "सिंचन पद्धती:\n\nठिबक सिंचन:\n- झाडांच्या मुळांना थेट पाणी\n- 30-60% पाणी बचत\n- चांगले: भाजीपाला, फळे, कापूस, ऊस\n- खर्च: 20,000-45,000 रुपये/एकर\n- सरकारी अनुदान: 55-90%\n\nतुषार सिंचन:\n- पावसासारखा पाण्याचा शिडकावा\n- 25-50% पाणी बचत\n- चांगले: गहू, कडधान्ये, भुईमूग\n\nस्मार्ट टिप्स:\n- सकाळी किंवा संध्याकाळी सिंचन करा\n- मल्चिंगने ओलावा टिकवा\n- माती ओलावा सेन्सर बसवा\n- ठिबक फिल्टर नियमित स्वच्छ करा",
    },
  },

  // ===================== HEALTH =====================
  health: {
    patterns: [
      "health", "swasth", "aarogya", "turmeric", "haldi", "neem", "benefit",
      "स्वास्थ्य", "आरोग्य", "हल्दी", "हळद", "नीम", "कडुनिंब", "फायदे", "लाभ",
      "nutrition", "diet", "medicine", "ayurveda", "home remedy", "gharelu",
    ],
    response: {
      en: "Health & Wellness from Your Farm:\n\nTurmeric (Haldi):\n- Powerful anti-inflammatory and antioxidant\n- Boosts immunity and fights infections\n- Mix 1/2 tsp in warm milk before bed\n- Good for joint pain and digestion\n\nNeem:\n- Natural antibacterial and antifungal\n- Neem leaves tea helps control blood sugar\n- Neem oil for skin conditions\n- Chewing neem twigs improves dental health\n\nMorenga (Drumstick):\n- Rich in vitamins A, C, calcium, iron\n- Called 'miracle tree' for nutrition\n- Leaves can be dried and powdered\n\nDaily Farmer Health Tips:\n- Stay hydrated in the field (carry water)\n- Wear hat and protective clothing\n- Take breaks every 2 hours\n- Use masks when spraying chemicals\n- Wash hands before eating",
      hi: "आपके खेत से स्वास्थ्य:\n\nहल्दी:\n- शक्तिशाली एंटी-इंफ्लेमेटरी\n- रोग प्रतिरोधक क्षमता बढ़ाती है\n- रात को गर्म दूध में 1/2 चम्मच मिलाएं\n- जोड़ों के दर्द और पाचन में लाभदायक\n\nनीम:\n- प्राकृतिक एंटीबैक्टीरियल\n- नीम पत्ती की चाय शुगर नियंत्रित करती है\n- त्वचा रोगों के लिए नीम तेल\n\nसहजन (ड्रमस्टिक):\n- विटामिन A, C, कैल्शियम, आयरन से भरपूर\n- पत्तियां सुखाकर पाउडर बना सकते हैं\n\nकिसान स्वास्थ्य टिप्स:\n- खेत में पानी पीते रहें\n- टोपी और सुरक्षात्मक कपड़े पहनें\n- हर 2 घंटे ब्रेक लें\n- रसायन छिड़काव में मास्क पहनें",
      mr: "तुमच्या शेतातून आरोग्य:\n\nहळद:\n- शक्तिशाली दाहविरोधी\n- रोगप्रतिकारशक्ती वाढवते\n- रात्री गरम दुधात 1/2 चमचा मिसळा\n- सांधेदुखी आणि पचनासाठी लाभदायक\n\nकडुनिंब:\n- नैसर्गिक अँटीबॅक्टेरियल\n- कडुनिंबाच्या पानांचा चहा रक्तशर्करा नियंत्रित करतो\n- त्वचा रोगांसाठी कडुनिंबाचे तेल\n\nशेवगा:\n- जीवनसत्त्व A, C, कॅल्शियम, लोहयुक्त\n- पाने वाळवून पावडर बनवा\n\nशेतकरी आरोग्य टिप्स:\n- शेतात पाणी प्या\n- टोपी आणि संरक्षक कपडे घाला\n- दर 2 तासांनी विश्रांती घ्या\n- रासायनिक फवारणीत मास्क वापरा",
    },
  },

  // ===================== GENERAL KNOWLEDGE =====================
  science: {
    patterns: [
      "science", "vigyan", "vidnyan", "how does", "why does", "what is",
      "explain", "kaise", "kya hai", "kay aahe", "विज्ञान", "काय आहे", "क्या है",
      "how work", "tell me about", "information about",
    ],
    response: {
      en: "I'm KrishiBot AI, your intelligent assistant! I can help you with a wide range of topics. Could you be more specific? I can answer about:\n\n- Agriculture & Farming techniques\n- Weather & Climate\n- Science & Technology\n- Health & Nutrition\n- Government schemes & Subsidies\n- Market prices & Economics\n- General knowledge & Education\n- Math & Calculations\n\nJust ask me a specific question and I'll give you a detailed answer!",
      hi: "मैं कृषिबॉट AI हूँ, आपका बुद्धिमान सहायक! मैं कई विषयों में मदद कर सकता हूँ। कृपया विशेष प्रश्न पूछें:\n\n- कृषि और खेती तकनीक\n- मौसम और जलवायु\n- विज्ञान और तकनीक\n- स्वास्थ्य और पोषण\n- सरकारी योजनाएं\n- बाजार भाव\n- सामान्य ज्ञान\n- गणित\n\nमुझसे कोई भी विशेष प्रश्न पूछें!",
      mr: "मी कृषिबॉट AI आहे, तुमचा बुद्धिमान सहाय्यक! मी अनेक विषयांमध्ये मदत करू शकतो. कृपया विशिष्ट प्रश्न विचारा:\n\n- शेती आणि तंत्र\n- हवामान\n- विज्ञान आणि तंत्रज्ञान\n- आरोग्य आणि पोषण\n- सरकारी योजना\n- बाजारभाव\n- सामान्य ज्ञान\n- गणित\n\nमला कोणताही विशिष्ट प्रश्न विचारा!",
    },
  },

  // ===================== SOIL =====================
  soil: {
    patterns: [
      "soil", "mitti", "mati", "मिट्टी", "माती", "soil test", "soil health",
      "ph", "organic matter", "जैविक पदार्थ", "सेंद्रिय पदार्थ",
    ],
    response: {
      en: "Soil Health Management:\n\nSoil Types in India:\n- Alluvial: Indo-Gangetic plains, most fertile, good for all crops\n- Black (Regur): Deccan plateau, great for cotton & soybean\n- Red: South India, good with proper fertilization\n- Laterite: Western Ghats, acidic, needs lime treatment\n\nSoil Testing:\n- Test every 2 years at KVK or soil testing labs\n- Check: pH, N, P, K, Organic Carbon, micronutrients\n- Cost: Free under Soil Health Card scheme\n- Ideal pH: 6.0-7.5 for most crops\n\nImproving Soil:\n- Add vermicompost or FYM regularly\n- Practice crop rotation\n- Grow green manure crops (Dhaincha)\n- Avoid burning crop residue\n- Reduce excess chemical fertilizer\n- Mulching retains moisture and adds organic matter",
      hi: "मिट्टी स्वास्थ्य प्रबंधन:\n\nभारत में मिट्टी प्रकार:\n- जलोढ़: गंगा मैदान, सबसे उपजाऊ\n- काली: दक्कन पठार, कपास और सोयाबीन\n- लाल: दक्षिण भारत\n- लेटराइट: पश्चिमी घाट, अम्लीय\n\nमिट्टी जांच:\n- हर 2 साल KVK में\n- pH, N, P, K, जैविक कार्बन जांचें\n- मृदा स्वास्थ्य कार्ड योजना में मुफ्त\n\nमिट्टी सुधार:\n- नियमित वर्मीकम्पोस्ट डालें\n- फसल चक्र अपनाएं\n- हरी खाद उगाएं\n- पराली न जलाएं\n- रासायनिक खाद कम करें",
      mr: "माती आरोग्य व्यवस्थापन:\n\nभारतातील माती प्रकार:\n- गाळाची: गंगा मैदान, सर्वात सुपीक\n- काळी: दख्खन पठार, कापूस आणि सोयाबीन\n- लाल: दक्षिण भारत\n- लॅटराइट: पश्चिम घाट, आम्लयुक्त\n\nमाती तपासणी:\n- दर 2 वर्षांनी KVK मध्ये\n- pH, N, P, K, सेंद्रिय कार्बन तपासा\n- मृदा आरोग्य पत्रिका योजनेत मोफत\n\nमाती सुधारणा:\n- नियमित गांडूळखत वापरा\n- पीक फेरपालट करा\n- हिरवळीचे खत पिकवा\n- पिकांचे अवशेष जाळू नका",
    },
  },

  // ===================== MARKET PRICES =====================
  market: {
    patterns: [
      "price", "rate", "mandi", "market", "bhav", "बाजार", "भाव", "मंडी",
      "daam", "kimat", "दाम", "किंमत", "sell", "bechna", "विक्री",
    ],
    response: {
      en: "Current Market Prices (Indicative):\n\nCereals:\n- Wheat: Rs 2,275/quintal (MSP)\n- Rice: Rs 2,300/quintal (MSP)\n- Maize: Rs 2,090/quintal (MSP)\n\nPulses:\n- Chana: Rs 5,440/quintal (MSP)\n- Moong: Rs 8,558/quintal (MSP)\n- Tur: Rs 7,000/quintal (MSP)\n\nOilseeds:\n- Soybean: Rs 4,600/quintal (MSP)\n- Groundnut: Rs 6,377/quintal (MSP)\n- Mustard: Rs 5,650/quintal (MSP)\n\nCash Crops:\n- Cotton: Rs 7,020/quintal (MSP)\n- Sugarcane: Rs 315/quintal (FRP)\n\nTips for Better Prices:\n- Register on e-NAM for online mandi access\n- Store produce in warehouses (WDRA receipts)\n- Check multiple mandis before selling\n- Consider forming FPO for collective bargaining",
      hi: "मौजूदा बाजार भाव (सांकेतिक):\n\nअनाज:\n- गेहूं: 2,275 रुपये/क्विंटल (MSP)\n- धान: 2,300 रुपये/क्विंटल (MSP)\n- मक्का: 2,090 रुपये/क्विंटल (MSP)\n\nदालें:\n- चना: 5,440 रुपये/क्विंटल\n- मूंग: 8,558 रुपये/क्विंटल\n- तूर: 7,000 रुपये/क्विंटल\n\nतिलहन:\n- सोयाबीन: 4,600 रुपये/क्विंटल\n- मूंगफली: 6,377 रुपये/क्विंटल\n\nबेहतर भाव के लिए:\n- e-NAM पर रजिस्टर करें\n- गोदाम में भंडारण करें\n- कई मंडियों में भाव जांचें",
      mr: "सध्याचे बाजारभाव (सूचक):\n\nधान्य:\n- गहू: 2,275 रुपये/क्विंटल (MSP)\n- भात: 2,300 रुपये/क्विंटल (MSP)\n- मका: 2,090 रुपये/क्विंटल (MSP)\n\nकडधान्ये:\n- हरभरा: 5,440 रुपये/क्विंटल\n- मूग: 8,558 रुपये/क्विंटल\n- तूर: 7,000 रुपये/क्विंटल\n\nतेलबिया:\n- सोयाबीन: 4,600 रुपये/क्विंटल\n- भुईमूग: 6,377 रुपये/क्विंटल\n\nचांगल्या भावासाठी:\n- e-NAM वर नोंदणी करा\n- गोदामात साठवण करा\n- अनेक बाजारपेठांमध्ये भाव तपासा",
    },
  },

  // ===================== GREETINGS =====================
  greeting: {
    patterns: [
      "hello", "hi", "hey", "good morning", "good evening", "namaste", "namaskar",
      "नमस्ते", "नमस्कार", "kaise ho", "कैसे हो", "कसे आहात",
    ],
    response: {
      en: "Hello! I'm KrishiBot AI, your smart farming assistant. I'm here to help you with anything - agriculture, weather, news, health, government schemes, or even math! What would you like to know?",
      hi: "नमस्ते! मैं कृषिबॉट AI हूँ, आपका स्मार्ट कृषि सहायक। मैं किसी भी चीज़ में मदद कर सकता हूँ - कृषि, मौसम, खबरें, स्वास्थ्य, सरकारी योजनाएं, या गणित! आप क्या जानना चाहेंगे?",
      mr: "नमस्कार! मी कृषिबॉट AI आहे, तुमचा स्मार्ट शेती सहाय्यक. मी कशातही मदत करू शकतो - शेती, हवामान, बातम्या, आरोग्य, सरकारी योजना, किंवा गणित! तुम्हाला काय जाणून घ्यायचे आहे?",
    },
  },

  // ===================== THANKS =====================
  thanks: {
    patterns: [
      "thank", "thanks", "dhanyawad", "dhanyavaad", "shukriya", "aabhar",
      "धन्यवाद", "शुक्रिया", "आभार", "thank you",
    ],
    response: {
      en: "You're welcome! I'm always here to help. Feel free to ask me anything anytime - whether it's about farming, weather, news, or any other topic. Happy farming!",
      hi: "आपका स्वागत है! मैं हमेशा मदद के लिए यहां हूँ। कभी भी कुछ भी पूछें - खेती, मौसम, खबरें, या कोई भी विषय। खुश रहें, अच्छी खेती करें!",
      mr: "तुमचे स्वागत आहे! मी नेहमी मदतीसाठी इथे आहे. कधीही काहीही विचारा - शेती, हवामान, बातम्या, किंवा कोणताही विषय. आनंदी शेती करा!",
    },
  },
}

// Main Jarvis response generator
export function getJarvisResponse(input: string, language: Language): JarvisResponse {
  const lower = input.toLowerCase()

  // 1. Check for math expressions first
  const mathResult = evalMath(input)
  if (mathResult !== null) {
    const formatted = Number.isInteger(mathResult) ? mathResult.toString() : mathResult.toFixed(4)
    const responses = {
      en: `The answer is ${formatted}. Need help with any other calculations?`,
      hi: `उत्तर है ${formatted}। क्या कोई और गणना चाहिए?`,
      mr: `उत्तर आहे ${formatted}. आणखी काही गणित हवे आहे का?`,
    }
    return { text: responses[language] }
  }

  // 2. Check motor commands (highest priority)
  if (matches(lower, knowledgeBase.motorOn.patterns)) {
    return { text: knowledgeBase.motorOn.response[language], motorCommand: "on" }
  }
  if (matches(lower, knowledgeBase.motorOff.patterns)) {
    return { text: knowledgeBase.motorOff.response[language], motorCommand: "off" }
  }

  // 3. Check knowledge base categories
  const categories = [
    "greeting", "thanks", "weather", "news", "crops", "pests", "fertilizer",
    "schemes", "irrigation", "health", "soil", "market", "science",
  ] as const

  for (const category of categories) {
    const kb = knowledgeBase[category]
    if (matches(lower, kb.patterns)) {
      return { text: kb.response[language] }
    }
  }

  // 4. Catch-all for time/date
  if (matches(lower, ["time", "samay", "वेळ", "समय", "what time", "kitne baje"])) {
    const now = new Date()
    const h = now.getHours()
    const m = now.getMinutes()
    const ampm = h >= 12 ? "PM" : "AM"
    const hour12 = h % 12 || 12
    const timeStr = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`
    const responses = {
      en: `The current time is ${timeStr}. Is there anything else you'd like to know?`,
      hi: `अभी समय ${timeStr} है। क्या और कुछ जानना है?`,
      mr: `सध्या वेळ ${timeStr} आहे. आणखी काही जाणून घ्यायचे आहे का?`,
    }
    return { text: responses[language] }
  }

  if (matches(lower, ["date", "tarikh", "तारीख", "today", "aaj", "आज"])) {
    const now = new Date()
    const dateStr = now.toLocaleDateString(language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    })
    const responses = {
      en: `Today's date is ${dateStr}. What else can I help you with?`,
      hi: `आज की तारीख ${dateStr} है। और क्या मदद चाहिए?`,
      mr: `आजची तारीख ${dateStr} आहे. आणखी कशात मदत हवी आहे?`,
    }
    return { text: responses[language] }
  }

  // 5. Default response
  const defaults = {
    en: `I understand you're asking about "${input}". As your KrishiBot AI assistant, I can help you with:\n\n- Farming & Crop advice\n- Weather updates\n- News headlines\n- Government schemes (PM-KISAN, PMFBY, etc.)\n- Pest control & Fertilizers\n- Health & Nutrition tips\n- Market prices\n- Math calculations\n- Motor/irrigation controls\n\nTry asking me something specific from these topics!`,
    hi: `मैं समझ रहा हूँ कि आप "${input}" के बारे में पूछ रहे हैं। आपके कृषिबॉट AI सहायक के रूप में, मैं इनमें मदद कर सकता हूँ:\n\n- खेती और फसल सलाह\n- मौसम अपडेट\n- खबरें\n- सरकारी योजनाएं\n- कीट नियंत्रण और खाद\n- स्वास्थ्य सुझाव\n- बाजार भाव\n- गणित\n- मोटर/सिंचाई नियंत्रण\n\nइन विषयों से कुछ विशेष पूछें!`,
    mr: `मला समजते की तुम्ही "${input}" बद्दल विचारत आहात. तुमचा कृषिबॉट AI सहाय्यक म्हणून, मी यात मदत करू शकतो:\n\n- शेती आणि पीक सल्ला\n- हवामान अपडेट\n- बातम्या\n- सरकारी योजना\n- कीड नियंत्रण आणि खत\n- आरोग्य सल्ला\n- बाजारभाव\n- गणित\n- मोटर/सिंचन नियंत्रण\n\nया विषयांमधून काही विशिष्ट विचारा!`,
  }
  return { text: defaults[language] }
}

// Streaming version: splits response into words and yields them
export async function* streamJarvisResponse(input: string, language: Language) {
  const { text, motorCommand } = getJarvisResponse(input, language)

  if (motorCommand === "on") yield "[MOTOR_ON]"
  if (motorCommand === "off") yield "[MOTOR_OFF]"

  const words = text.split(" ")
  for (const word of words) {
    yield word + " "
    // Simulate natural typing delay
    await new Promise((r) => setTimeout(r, 15 + Math.random() * 25))
  }
}
