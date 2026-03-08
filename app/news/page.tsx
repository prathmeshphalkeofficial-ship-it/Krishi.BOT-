"use client"

import { useState, useEffect } from "react"
import { Newspaper, RefreshCw, ExternalLink, Tag, Clock, TrendingUp, Leaf, CloudRain, Bug, Wheat } from "lucide-react"
import { useApp } from "@/lib/app-context"
import { t } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const categories = [
  { key: "all", icon: Newspaper, color: "text-primary" },
  { key: "crops", icon: Wheat, color: "text-green-500" },
  { key: "weather", icon: CloudRain, color: "text-blue-500" },
  { key: "pestControl", icon: Bug, color: "text-orange-500" },
  { key: "market", icon: TrendingUp, color: "text-purple-500" },
]

const newsData = [
  {
    id: 1,
    category: "crops",
    titleEn: "New High-Yield Rice Variety Released for Kharif Season",
    titleHi: "खरीफ सीजन के लिए नई उच्च उपज चावल किस्म जारी",
    titleMr: "खरीप हंगामासाठी नवीन उच्च उत्पादन तांदूळ वाण जारी",
    summaryEn: "ICAR has released a new drought-resistant rice variety that promises 20% higher yield with 15% less water consumption, suitable for Maharashtra and MP regions.",
    summaryHi: "ICAR ने एक नई सूखा प्रतिरोधी चावल किस्म जारी की है जो 15% कम पानी के साथ 20% अधिक उपज का वादा करती है।",
    summaryMr: "ICAR ने नवीन दुष्काळ प्रतिरोधक तांदूळ वाण जारी केले आहे जे 15% कमी पाण्यात 20% जास्त उत्पादन देते.",
    source: "Krishi Jagran",
    time: "2h ago",
    tag: "crops",
    url: "#",
  },
  {
    id: 2,
    category: "weather",
    titleEn: "IMD Predicts Above-Normal Monsoon for Central India 2025",
    titleHi: "IMD ने मध्य भारत के लिए सामान्य से अधिक मानसून की भविष्यवाणी की",
    titleMr: "IMD ने मध्य भारतासाठी सामान्यपेक्षा जास्त पावसाचा अंदाज वर्तवला",
    summaryEn: "India Meteorological Department forecasts 106% of normal rainfall for Vidarbha and Marathwada regions, beneficial for soybean and cotton farmers.",
    summaryHi: "मौसम विभाग ने विदर्भ और मराठवाड़ा क्षेत्रों के लिए सामान्य वर्षा का 106% पूर्वानुमान लगाया है।",
    summaryMr: "हवामान विभागाने विदर्भ आणि मराठवाड्यासाठी सामान्य पावसाच्या 106% पर्जन्यमानाचा अंदाज वर्तवला आहे.",
    source: "IMD India",
    time: "4h ago",
    tag: "weather",
    url: "#",
  },
  {
    id: 3,
    category: "pestControl",
    titleEn: "Fall Armyworm Alert: Early Warning System Activated in Maharashtra",
    titleHi: "फॉल आर्मीवर्म अलर्ट: महाराष्ट्र में प्रारंभिक चेतावनी प्रणाली सक्रिय",
    titleMr: "फॉल आर्मीवर्म अलर्ट: महाराष्ट्रात पूर्व चेतावणी प्रणाली सक्रिय",
    summaryEn: "Agriculture department has issued alert for fall armyworm infestation in maize crops. Farmers advised to use recommended pesticides and bio-controls immediately.",
    summaryHi: "कृषि विभाग ने मक्के की फसलों में फॉल आर्मीवर्म संक्रमण के लिए अलर्ट जारी किया है।",
    summaryMr: "कृषी विभागाने मक्याच्या पिकांमध्ये फॉल आर्मीवर्म संसर्गाबाबत अलर्ट जारी केला आहे.",
    source: "Agrowon",
    time: "6h ago",
    tag: "pestControl",
    url: "#",
  },
  {
    id: 4,
    category: "market",
    titleEn: "Onion Prices Surge 40% at APMC Lasalgaon Market",
    titleHi: "APMC लासलगाव बाजार में प्याज की कीमतें 40% बढ़ीं",
    titleMr: "APMC लासलगाव बाजारात कांद्याचे भाव 40% वाढले",
    summaryEn: "Onion prices at Lasalgaon APMC market jumped to ₹3,200 per quintal due to reduced supply and increased export demand from Gulf countries.",
    summaryHi: "लासलगाव APMC बाजार में प्याज की कीमतें घटी आपूर्ति और खाड़ी देशों की बढ़ी मांग से ₹3,200 प्रति क्विंटल पहुंच गई।",
    summaryMr: "लासलगाव APMC बाजारात कांद्याचे भाव घटलेल्या पुरवठ्यामुळे ₹3,200 प्रति क्विंटलवर पोहोचले.",
    source: "Market Watch",
    time: "8h ago",
    tag: "market",
    url: "#",
  },
  {
    id: 5,
    category: "crops",
    titleEn: "PM-KISAN 18th Installment Released: ₹2000 Credited to 9.4 Crore Farmers",
    titleHi: "PM-KISAN 18वीं किस्त जारी: 9.4 करोड़ किसानों को ₹2000 क्रेडिट",
    titleMr: "PM-KISAN 18वा हप्ता जारी: 9.4 कोटी शेतकऱ्यांना ₹2000 जमा",
    summaryEn: "The government has released the 18th installment of PM-KISAN scheme, directly transferring ₹2000 to 9.4 crore eligible farmer families across India.",
    summaryHi: "सरकार ने PM-KISAN योजना की 18वीं किस्त जारी की, 9.4 करोड़ पात्र किसान परिवारों को ₹2000 सीधे ट्रांसफर किए।",
    summaryMr: "सरकारने PM-KISAN योजनेचा 18वा हप्ता जारी केला, 9.4 कोटी पात्र शेतकरी कुटुंबांना ₹2000 थेट हस्तांतरित केले.",
    source: "PIB India",
    time: "1d ago",
    tag: "crops",
    url: "#",
  },
  {
    id: 6,
    category: "market",
    titleEn: "Soybean MSP Increased by ₹292 for Kharif 2025 Season",
    titleHi: "खरीफ 2025 सीजन के लिए सोयाबीन MSP ₹292 बढ़ाया गया",
    titleMr: "खरीप 2025 हंगामासाठी सोयाबीन MSP ₹292 ने वाढवण्यात आला",
    summaryEn: "Cabinet Committee on Economic Affairs approved MSP hike for kharif crops. Soybean MSP set at ₹4,892 per quintal, benefiting over 3 crore farmers in Central India.",
    summaryHi: "आर्थिक मामलों की कैबिनेट समिति ने खरीफ फसलों के लिए MSP वृद्धि को मंजूरी दी।",
    summaryMr: "आर्थिक व्यवहारांच्या मंत्रिमंडळ समितीने खरीप पिकांसाठी MSP वाढीस मान्यता दिली.",
    source: "Economic Times",
    time: "1d ago",
    tag: "market",
    url: "#",
  },
]

const tagColors: Record<string, string> = {
  crops: "bg-green-500/10 text-green-600 dark:text-green-400",
  weather: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  pestControl: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  market: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
}

export default function NewsPage() {
  const { language } = useApp()
  const [activeCategory, setActiveCategory] = useState("all")
  const [refreshing, setRefreshing] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }

  const filtered = activeCategory === "all"
    ? newsData
    : newsData.filter((n) => n.category === activeCategory)

  const getTitle = (item: typeof newsData[0]) => {
    if (language === "hi") return item.titleHi
    if (language === "mr") return item.titleMr
    return item.titleEn
  }

  const getSummary = (item: typeof newsData[0]) => {
    if (language === "hi") return item.summaryHi
    if (language === "mr") return item.summaryMr
    return item.summaryEn
  }

  const getCategoryLabel = (key: string) => {
    const labels: Record<string, Record<string, string>> = {
      all: { en: "All News", hi: "सभी समाचार", mr: "सर्व बातम्या" },
      crops: { en: "Crops", hi: "फसलें", mr: "पिके" },
      weather: { en: "Weather", hi: "मौसम", mr: "हवामान" },
      pestControl: { en: "Pest Control", hi: "कीट नियंत्रण", mr: "कीड नियंत्रण" },
      market: { en: "Market", hi: "बाजार", mr: "बाजार" },
    }
    return labels[key]?.[language] || labels[key]?.en || key
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 md:top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Newspaper className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">
                {language === "hi" ? "कृषि समाचार" : language === "mr" ? "कृषी बातम्या" : "Krishi News"}
              </h1>
              <p className="text-[10px] text-muted-foreground">
                {language === "hi" ? "ताज़ा कृषि अपडेट" : language === "mr" ? "ताज्या कृषी अपडेट" : "Latest farming updates"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
          >
            <RefreshCw className={cn("h-4 w-4 text-muted-foreground", refreshing && "animate-spin")} />
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                activeCategory === cat.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              )}
            >
              <cat.icon className="h-3 w-3" />
              {getCategoryLabel(cat.key)}
            </button>
          ))}
        </div>
      </div>

      {/* News Feed */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {filtered.map((item, i) => (
          <div
            key={item.id}
            className={cn(
              "group bg-card border border-border rounded-xl p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", tagColors[item.tag])}>
                    {getCategoryLabel(item.tag)}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {item.time}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-foreground leading-snug mb-1.5 group-hover:text-primary transition-colors">
                  {getTitle(item)}
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {getSummary(item)}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    <Leaf className="h-3 w-3 text-primary" />
                    <span className="text-[10px] text-muted-foreground font-medium">{item.source}</span>
                  </div>
                  <button className="flex items-center gap-1 text-[10px] text-primary hover:underline">
                    {language === "hi" ? "और पढ़ें" : language === "mr" ? "अधिक वाचा" : "Read more"}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="px-4 pb-4 text-center">
        <p className="text-[10px] text-muted-foreground">
          {language === "hi"
            ? "स्रोत: Krishi Jagran, Agrowon, IMD, PIB"
            : language === "mr"
            ? "स्रोत: Krishi Jagran, Agrowon, IMD, PIB"
            : "Sources: Krishi Jagran, Agrowon, IMD, PIB India"}
        </p>
      </div>
    </div>
  )
}