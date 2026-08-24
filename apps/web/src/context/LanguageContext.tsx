"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi" | "as" | "bn";

export interface Translations {
  // Top Header & Nav
  skipToContent: string;
  govIndia: string;
  ministryAttribution: string;
  lightMode: string;
  darkMode: string;
  emergencySOS: string;
  signIn: string;
  register: string;
  logout: string;
  searchPlaceholder: string;

  home: string;
  touristHub: string;
  sosProtocol: string;
  safetyMap: string;
  fairPrices: string;
  tripsGuide: string;
  digitalId: string;
  profile: string;

  // Ticker
  latestUpdates: string;

  // Banner
  banner1Title: string;
  banner1Subtitle: string;
  banner1Badge: string;
  bannerCta1: string;
  bannerCta2: string;

  // Services
  accessServices: string;
  servicesSubtitle: string;
  proceed: string;

  // PM Quote
  pmQuote: string;
  pmName: string;
  pmTitle: string;
  pmCiting: string;

  // Telemetry
  telemetryTitle: string;
  telemetrySubtitle: string;
  statIds: string;
  statStates: string;
  statDelivery: string;
  statZones: string;
  statPolice: string;

  // Personas
  personaTitle: string;
  personaSubtitle: string;
  trekkerTitle: string;
  intlTitle: string;
  operatorTitle: string;
  authorityTitle: string;

  // Cascade
  cascadeTitle: string;
  cascadeSubtitle: string;
  step0Title: string;
  step0Desc: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;

  // Helplines
  helplineTitle: string;
  helplineDesc: string;
  call112: string;
  call1363: string;

  // ─── Internal Route Translations ───
  // Tourist Hub (/dashboard)
  dashboardWelcome: string;
  dashboardSub: string;
  readySOS: string;
  kycCardTitle: string;
  kycCardDesc: string;
  mapCardTitle: string;
  mapCardDesc: string;
  faresCardTitle: string;
  faresCardDesc: string;
  cascadeChecklist: string;

  // SOS Page (/sos)
  sosHeading: string;
  sosSubheading: string;
  sosHoldPrompt: string;
  sosHolding: string;
  sosActiveHeading: string;
  sosCancelBtn: string;
  cascadeStatusTitle: string;

  // Safety Map (/map)
  mapHeading: string;
  mapSubheading: string;
  locateMeBtn: string;
  allLayers: string;
  dangerZonesLayer: string;
  deadZonesLayer: string;
  policeLayer: string;
  medicalLayer: string;
  zonesDirectory: string;

  // ONDC Fares (/fares)
  faresHeading: string;
  faresSubheading: string;
  autoDetectBtn: string;
  selectRegion: string;
  localTransportTitle: string;
  popularRoutesTitle: string;
  essentialsTitle: string;
  reportScamTitle: string;
  reportScamSub: string;
  submitGrievanceBtn: string;

  // Trips (/trips)
  tripsHeading: string;
  tripsSubheading: string;
  destinationLabel: string;
  datesLabel: string;
  groupSizeLabel: string;
  generateAdvisoryBtn: string;
  safetyScoreLabel: string;
  terrainHazardTitle: string;
  weatherAdvisoryTitle: string;
  packingGearTitle: string;
  permitStatusTitle: string;

  // KYC (/kyc)
  kycHeading: string;
  kycSubheading: string;
  tabDigiLocker: string;
  tabPassport: string;
  aadhaarTitle: string;
  aadhaarPrompt: string;
  authDigiLockerBtn: string;
  passportTitle: string;
  passportPrompt: string;
  extractMrzBtn: string;

  // Profile (/profile)
  profileHeading: string;
  citizenIdLabel: string;
  emergencyContactsTitle: string;
  addContactBtn: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    skipToContent: "Skip to Main Content",
    govIndia: "भारत सरकार | Government of India",
    ministryAttribution: "Ministry of Development of North Eastern Region (MDoNER) & Ministry of Tourism",
    lightMode: "☀️ Light",
    darkMode: "🌙 Dark",
    emergencySOS: "EMERGENCY SOS",
    signIn: "Sign In",
    register: "Register",
    logout: "Logout",
    searchPlaceholder: "Search safety zones, permits, fares...",

    home: "🏠 Home",
    touristHub: "📊 Tourist Hub",
    sosProtocol: "🚨 4-Step SOS",
    safetyMap: "🗺️ Safety Map",
    fairPrices: "💰 ONDC Fair Prices",
    tripsGuide: "✈️ Trips & AI Guide",
    digitalId: "🛂 Digital ID & KYC",
    profile: "👤 Profile",

    latestUpdates: "📢 Latest Updates",

    banner1Title: "Safe & Assured Travel Across Northeast India",
    banner1Subtitle: "Experience Meghalaya, Sikkim, and the entire NER with a 4-step emergency SOS safety net that works even with zero internet coverage.",
    banner1Badge: "V.A.N.A 4-Step SOS Protocol",
    bannerCta1: "Emergency SOS Portal",
    bannerCta2: "Explore Safety Map",

    accessServices: "Access V.A.N.A Services",
    servicesSubtitle: "Citizen & Tourist Services",
    proceed: "Proceed",

    pmQuote: "The North East is the 'Ashtalakshmi' of India's growth and natural wonder. Ensuring every traveler, youth, and foreign guest feels secure, connected, and empowered with smart indigenous technology is our sacred commitment.",
    pmName: "Shri Narendra Modi",
    pmTitle: "Hon'ble Prime Minister of India",
    pmCiting: "National Tourism & NER Development Summit",

    telemetryTitle: "V.A.N.A Northeast Safety Dashboard",
    telemetrySubtitle: "Real-Time Telemetry & Impact",
    statIds: "Verified Digital IDs Issued",
    statStates: "NER States Integrated",
    statDelivery: "SOS Relay Delivery Rate",
    statZones: "Geofenced High-Risk Areas",
    statPolice: "Tourist Police Interconnect",

    personaTitle: "Select Your Role / Persona",
    personaSubtitle: "Personalized Experience",
    trekkerTitle: "Backpacker & Trekker",
    intlTitle: "International Traveler",
    operatorTitle: "Taxi & Tour Operator",
    authorityTitle: "Police & Forest Guard",

    cascadeTitle: "The Connectivity Cascade: 4-Step SOS Protocol",
    cascadeSubtitle: "Fail-Safe Safety Architecture engineered for deep valleys, dense rainforests, and mountain passes where standard connectivity breaks down.",
    step0Title: "Step 0: Proactive Geo-Fenced Warnings",
    step0Desc: "Hardware GPS logs your path and warns you 500m before entering known valley dead zones so you can pre-sync your Digital ID.",
    step1Title: "Step 1: Primary Gateway (Internet/4G)",
    step1Desc: "High-speed WebSocket / HTTP emergency dispatch with live battery, coordinates, and real-time authority socket alert.",
    step2Title: "Step 2: Encrypted Compact SMS",
    step2Desc: "Fallback to compressed 80-char encrypted SMS. Hybrid routed via MSG91 (+91 domestic) or Twilio (international).",
    step3Title: "Step 3: BLE Mesh Beacon Broadcast",
    step3Desc: "Zero network? Your phone broadcasts continuous encrypted BLE beacons. Passing tourists relay signals automatically.",

    helplineTitle: "Need Immediate On-Ground Assistance in NER?",
    helplineDesc: "24x7 Emergency Contact Numbers",
    call112: "📞 National Emergency: 112",
    call1363: "📞 Tourist Helpline: 1363",

    // Dashboard
    dashboardWelcome: "Welcome back",
    dashboardSub: "Your offline 4-step emergency SOS network and Digital ID are actively synchronized.",
    readySOS: "🚨 Ready Emergency SOS",
    kycCardTitle: "Digital ID & Passport KYC",
    kycCardDesc: "Verify identity via DigiLocker Aadhaar or International Passport OCR.",
    mapCardTitle: "Interactive NER Safety Map",
    mapCardDesc: "View danger zones, police stations, and dead zones in Meghalaya & Sikkim.",
    faresCardTitle: "ONDC Anti-Scam Fare Guide",
    faresCardDesc: "Real-time benchmark fares for cabs, sumos, homestays, and essentials.",
    cascadeChecklist: "The 4-Step Safety Cascade Checklist",

    // SOS
    sosHeading: "4-Step Connectivity Cascade SOS 🚨",
    sosSubheading: "Designed for Northeast India. Automatically falls back from 4G Internet ➔ Encrypted Compact SMS ➔ Offline BLE Mesh.",
    sosHoldPrompt: "PRESS & HOLD FOR 3 SECONDS",
    sosHolding: "HOLDING...",
    sosActiveHeading: "DISTRESS PROTOCOL ACTIVE",
    sosCancelBtn: "Cancel / Reset Emergency SOS",
    cascadeStatusTitle: "Connectivity Cascade Live Status",

    // Map
    mapHeading: "Interactive Safety & Dead-Zone Map 🗺️",
    mapSubheading: "Live mapping of geofenced danger zones, cellular dead zones (Step 0), police outposts, and emergency trauma centers.",
    locateMeBtn: "Locate Me on NER Map",
    allLayers: "All Layers",
    dangerZonesLayer: "⚠️ Danger Zones",
    deadZonesLayer: "📡 Dead Zones (Step 0)",
    policeLayer: "👮 Police Outposts",
    medicalLayer: "🏥 Trauma Medical",
    zonesDirectory: "⚠️ Geofenced Zones Directory",

    // Fares
    faresHeading: "Real-Time Fair Price & Mobility Benchmarks 💰",
    faresSubheading: "Direct ONDC open commerce telemetry for local cabs, sumos, homestays, and essential utilities across Northeast India.",
    autoDetectBtn: "Auto-Detect My Location",
    selectRegion: "Select Region:",
    localTransportTitle: "🚗 Local Transport Benchmarks",
    popularRoutesTitle: "🗺️ Popular Tourist Corridors",
    essentialsTitle: "🛒 Food, Stays & Essential Utilities",
    reportScamTitle: "Report Overcharging or Tourist Scam",
    reportScamSub: "Directly alerts Tourist Police Command Unit & ONDC Consumer Protection Cell.",
    submitGrievanceBtn: "Submit Official Grievance to Police Desk →",

    // Trips
    tripsHeading: "Safe Trip Planner & Terrain Advisory ✈️",
    tripsSubheading: "Generate real-time weather risk models, terrain hazard scores, and Protected Area Permit (PAP) requirements for Northeast India.",
    destinationLabel: "Destination in NER",
    datesLabel: "Planned Travel Dates",
    groupSizeLabel: "Group Size / Companions",
    generateAdvisoryBtn: "Generate AI Safety Advisory →",
    safetyScoreLabel: "Safety Score",
    terrainHazardTitle: "⚠️ Terrain Hazard Assessment:",
    weatherAdvisoryTitle: "🌦️ Weather & Monsoon Advisory:",
    packingGearTitle: "🎒 Recommended Packing Gear:",
    permitStatusTitle: "📋 Permit Status:",

    // KYC
    kycHeading: "Tourist Digital ID & KYC Verification 🛂",
    kycSubheading: "Connect DigiLocker (Aadhaar for Indian citizens) or scan your International Passport for instant Protected Area Permits (PAP).",
    tabDigiLocker: "🇮🇳 DigiLocker Aadhaar (Domestic)",
    tabPassport: "✈️ International Passport OCR (Foreigner)",
    aadhaarTitle: "DigiLocker Instant Aadhaar KYC",
    aadhaarPrompt: "National e-Governance zero-knowledge identity issuance.",
    authDigiLockerBtn: "Authenticate with DigiLocker →",
    passportTitle: "Capture or Upload Passport Bio Page",
    passportPrompt: "Ensure the 2-line Machine Readable Zone (MRZ) at the bottom is clear and well-lit.",
    extractMrzBtn: "Extract MRZ & Verify Passport Digital ID →",

    // Profile
    profileHeading: "Tourist Profile & Credentials 👤",
    citizenIdLabel: "V.A.N.A Citizen ID",
    emergencyContactsTitle: "Emergency Contacts",
    addContactBtn: "+ Add Contact",
  },

  hi: {
    skipToContent: "मुख्य सामग्री पर जाएं",
    govIndia: "भारत सरकार | Government of India",
    ministryAttribution: "पूर्वोत्तर क्षेत्र विकास मंत्रालय (MDoNER) एवं पर्यटन मंत्रालय",
    lightMode: "☀️ लाइट",
    darkMode: "🌙 डार्क",
    emergencySOS: "आपातकालीन एसओएस",
    signIn: "लॉग इन करें",
    register: "पंजीकरण",
    logout: "लॉग आउट",
    searchPlaceholder: "सुरक्षा क्षेत्र, परमिट, किराया खोजें...",

    home: "🏠 होम",
    touristHub: "📊 पर्यटक केंद्र",
    sosProtocol: "🚨 4-चरणीय एसओएस",
    safetyMap: "🗺️ सुरक्षा मानचित्र",
    fairPrices: "💰 उचित किराया",
    tripsGuide: "✈️ यात्रा व एआई गाइड",
    digitalId: "🛂 डिजिटल आईडी (केवाईसी)",
    profile: "👤 प्रोफ़ाइल",

    latestUpdates: "📢 नवीनतम अपडेट",

    banner1Title: "पूर्वोत्तर भारत में सुरक्षित एवं आश्वस्त यात्रा",
    banner1Subtitle: "मेघालय, सिक्किम और पूरे पूर्वोत्तर की यात्रा 4-चरणीय आपातकालीन सुरक्षा तंत्र के साथ करें, जो बिना इंटरनेट के भी काम करता है।",
    banner1Badge: "वाना 4-चरणीय एसओएस प्रोटोकॉल",
    bannerCta1: "आपातकालीन पोर्टल",
    bannerCta2: "सुरक्षा मानचित्र देखें",

    accessServices: "वाना सेवाओं का उपयोग करें",
    servicesSubtitle: "नागरिक एवं पर्यटक सेवाएं",
    proceed: "आगे बढ़ें",

    pmQuote: "पूर्वोत्तर भारत के विकास और प्राकृतिक वैभव की 'अष्टलक्ष्मी' है। हर यात्री, युवा और विदेशी अतिथि को स्वदेशी स्मार्ट तकनीक से सुरक्षित और सशक्त बनाना हमारा संकल्प है।",
    pmName: "श्री नरेंद्र मोदी",
    pmTitle: "माननीय प्रधानमंत्री, भारत सरकार",
    pmCiting: "राष्ट्रीय पर्यटन एवं पूर्वोत्तर विकास शिखर सम्मेलन",

    telemetryTitle: "वाना पूर्वोत्तर सुरक्षा डैशबोर्ड",
    telemetrySubtitle: "रीयल-टाइम सुरक्षा स्थिति",
    statIds: "सत्यापित डिजिटल आईडी जारी",
    statStates: "पूर्वोत्तर राज्य एकीकृत",
    statDelivery: "एसओएस रिले सफलता दर",
    statZones: "जियोफेंस्ड संवेदनशील क्षेत्र",
    statPolice: "पर्यटक पुलिस कनेक्टिविटी",

    personaTitle: "अपनी भूमिका / श्रेणी चुनें",
    personaSubtitle: "व्यक्तिगत अनुभव",
    trekkerTitle: "ट्रैकर व बैकपैकर",
    intlTitle: "अंतर्राष्ट्रीय पर्यटक",
    operatorTitle: "टैक्सी व टूर ऑपरेटर",
    authorityTitle: "पुलिस व वन अधिकारी",

    cascadeTitle: "कनेक्टिविटी कैस्केड: 4-चरणीय एसओएस प्रोटोकॉल",
    cascadeSubtitle: "गहरी घाटियों और घने जंगलों के लिए निर्मित आपातकालीन तंत्र जहाँ सामान्य मोबाइल नेटवर्क समाप्त हो जाता है।",
    step0Title: "चरण 0: सक्रिय जियो-फेंस चेतावनी",
    step0Desc: "हार्डवेयर जीपीएस नेटवर्क समाप्त होने से 500 मीटर पहले चेतावनी देता है ताकि आपका डिजिटल आईडी डेटा सुरक्षित हो सके।",
    step1Title: "चरण 1: प्राथमिक इंटरनेट गेटवे",
    step1Desc: "सक्रिय 4जी/वाईफाई होने पर पुलिस नियंत्रण कक्ष को तत्काल लाइव निर्देशांक व बैटरी स्थिति भेजी जाती है।",
    step2Title: "चरण 2: एन्क्रिप्टेड संक्षिप्त एसएमएस",
    step2Desc: "इंटरनेट न होने पर एसएमएस गेटवे (भारत के लिए MSG91 / अंतर्राष्ट्रीय के लिए Twilio) से संदेश भेजा जाता है।",
    step3Title: "चरण 3: बीएलई मेश बीकन प्रसारण",
    step3Desc: "शून्य नेटवर्क पर फोन ब्लूटूथ मेश बीकन प्रसारित करता है जिसे पास से गुजरने वाले पर्यटक स्वतः रिले करते हैं।",

    helplineTitle: "पूर्वोत्तर में तत्काल सहायता की आवश्यकता है?",
    helplineDesc: "24x7 आपातकालीन संपर्क नंबर",
    call112: "📞 राष्ट्रीय आपातकाल: 112",
    call1363: "📞 पर्यटक हेल्पलाइन: 1363",

    // Dashboard
    dashboardWelcome: "स्वागत है",
    dashboardSub: "आपका 4-चरणीय ऑफलाइन आपातकालीन एसओएस नेटवर्क और डिजिटल आईडी सक्रिय रूप से सिंक हैं।",
    readySOS: "🚨 आपातकालीन एसओएस तैयार रखें",
    kycCardTitle: "डिजिटल आईडी व पासपोर्ट केवाईसी",
    kycCardDesc: "डिजिलॉकर आधार या अंतर्राष्ट्रीय पासपोर्ट ओसीआर से पहचान सत्यापित करें।",
    mapCardTitle: "इंटरैक्टिव पूर्वोत्तर सुरक्षा मानचित्र",
    mapCardDesc: "मेघालय और सिक्किम के संवेदनशील क्षेत्र, पुलिस थाने और डेड ज़ोन देखें।",
    faresCardTitle: "ओएनडीसी उचित किराया मार्गदर्शिका",
    faresCardDesc: "टैक्सी, सूमो, होमस्टे और आवश्यक वस्तुओं की वास्तविक समय दरें।",
    cascadeChecklist: "4-चरणीय सुरक्षा कैस्केड चेकलिस्ट",

    // SOS
    sosHeading: "4-चरणीय कनेक्टिविटी कैस्केड एसओएस 🚨",
    sosSubheading: "पूर्वोत्तर भारत के लिए निर्मित। इंटरनेट ➔ एन्क्रिप्टेड एसएमएस ➔ ऑफलाइन बीएलई मेश पर स्वतः स्विच होता है।",
    sosHoldPrompt: "3 सेकंड के लिए दबाकर रखें",
    sosHolding: "होल्ड कर रहे हैं...",
    sosActiveHeading: "आपातकालीन प्रोटोकॉल सक्रिय है",
    sosCancelBtn: "आपातकालीन एसओएस रीसेट करें",
    cascadeStatusTitle: "कनेक्टिविटी कैस्केड लाइव स्थिति",

    // Map
    mapHeading: "इंटरैक्टिव सुरक्षा एवं डेड-ज़ोन मानचित्र 🗺️",
    mapSubheading: "जियोफेंस्ड संवेदनशील क्षेत्र, सेलुलर डेड ज़ोन (चरण 0), पुलिस चौकियां और ट्रॉमा केंद्र।",
    locateMeBtn: "मानचित्र पर मेरी स्थिति देखें",
    allLayers: "सभी परतें",
    dangerZonesLayer: "⚠️ संवेदनशील क्षेत्र",
    deadZonesLayer: "📡 डेड ज़ोन (चरण 0)",
    policeLayer: "👮 पुलिस चौकियां",
    medicalLayer: "🏥 ट्रॉमा केंद्र",
    zonesDirectory: "⚠️ निगरानी क्षेत्र निर्देशिका",

    // Fares
    faresHeading: "वास्तविक समय उचित मूल्य व गतिशीलता मानक 💰",
    faresSubheading: "पूर्वोत्तर में कैब, सूमो, होमस्टे और आवश्यक सेवाओं के लिए सीधा ओएनडीसी ओपन कॉमर्स डेटा।",
    autoDetectBtn: "मेरी स्थिति स्वतः पहचानें",
    selectRegion: "क्षेत्र चुनें:",
    localTransportTitle: "🚗 स्थानीय परिवहन मानक",
    popularRoutesTitle: "🗺️ लोकप्रिय पर्यटक मार्ग",
    essentialsTitle: "🛒 भोजन, आवास एवं आवश्यक वस्तुएं",
    reportScamTitle: "अत्यधिक किराया या धोखाधड़ी की रिपोर्ट करें",
    reportScamSub: "सीधे पर्यटक पुलिस कमांड यूनिट को सूचित करता है।",
    submitGrievanceBtn: "पुलिस डेस्क को आधिकारिक शिकायत भेजें →",

    // Trips
    tripsHeading: "सुरक्षित यात्रा योजनाकार व भू-भाग सलाह ✈️",
    tripsSubheading: "पूर्वोत्तर भारत के लिए रीयल-टाइम मौसम जोखिम मॉडल, भू-भाग खतरा स्कोर और परमिट आवश्यकताएं।",
    destinationLabel: "पूर्वोत्तर में गंतव्य",
    datesLabel: "यात्रा की तिथियां",
    groupSizeLabel: "यात्रियों की संख्या",
    generateAdvisoryBtn: "एआई सुरक्षा सलाह उत्पन्न करें →",
    safetyScoreLabel: "सुरक्षा स्कोर",
    terrainHazardTitle: "⚠️ भू-भाग जोखिम मूल्यांकन:",
    weatherAdvisoryTitle: "🌦️ मौसम एवं मानसून सलाह:",
    packingGearTitle: "🎒 अनुशंसित यात्रा सामग्री:",
    permitStatusTitle: "📋 परमिट स्थिति:",

    // KYC
    kycHeading: "पर्यटक डिजिटल आईडी एवं केवाईसी सत्यापन 🛂",
    kycSubheading: "भारतीय नागरिकों के लिए डिजिलॉकर आधार या विदेशी पर्यटकों के लिए पासपोर्ट स्कैन करें।",
    tabDigiLocker: "🇮🇳 डिजिलॉकर आधार (घरेलू)",
    tabPassport: "✈️ अंतर्राष्ट्रीय पासपोर्ट ओसीआर (विदेशी)",
    aadhaarTitle: "डिजिलॉकर त्वरित आधार केवाईसी",
    aadhaarPrompt: "राष्ट्रीय ई-गवर्नेंस पहचान जारीकरण।",
    authDigiLockerBtn: "डिजिलॉकर से सत्यापित करें →",
    passportTitle: "पासपोर्ट फोटो पेज कैप्चर या अपलोड करें",
    passportPrompt: "सुनिश्चित करें कि नीचे की 2-लाइन मशीन पठनीय क्षेत्र (MRZ) स्पष्ट है।",
    extractMrzBtn: "एमआरजेड निकालें और डिजिटल आईडी बनाएं →",

    // Profile
    profileHeading: "पर्यटक प्रोफ़ाइल एवं प्रमाण पत्र 👤",
    citizenIdLabel: "वाना नागरिक आईडी",
    emergencyContactsTitle: "आपातकालीन संपर्क",
    addContactBtn: "+ संपर्क जोड़ें",
  },

  as: {
    skipToContent: "মুখ্য বিষয়বস্তুলৈ যাওক",
    govIndia: "ভাৰত চৰকাৰ | Government of India",
    ministryAttribution: "উত্তৰ পূৰ্বাঞ্চল উন্নয়ন মন্ত্ৰালয় (MDoNER) আৰু পৰ্যটন মন্ত্ৰালয়",
    lightMode: "☀️ লাইট",
    darkMode: "🌙 ডাৰ্ক",
    emergencySOS: "জৰুৰীকালীন SOS",
    signIn: "লগ ইন",
    register: "পঞ্জীয়ন",
    logout: "লগ আউট",
    searchPlaceholder: "নিৰাপত্তা মণ্ডল, পাৰ্মিট, ভাড়া সন্ধান কৰক...",

    home: "🏠 ঘৰ",
    touristHub: "📊 পৰ্যটক কেন্দ্ৰ",
    sosProtocol: "🚨 ৪-স্তৰীয় SOS",
    safetyMap: "🗺️ নিৰাপত্তা মানচিত্ৰ",
    fairPrices: "💰 সঠিক ভাড়া",
    tripsGuide: "✈️ ভ্ৰমণ নিৰ্দেশিকা",
    digitalId: "🛂 ডিজিটেল পৰিচয় পত্ৰ",
    profile: "👤 প্ৰফাইল",

    latestUpdates: "📢 শেহতীয়া বাতৰি",

    banner1Title: "উত্তৰ-পূৰ্বাঞ্চলত সুৰক্ষিত আৰু নিশ্চিন্ত ভ্ৰমণ",
    banner1Subtitle: "মেঘালয়, ছিকিম আৰু সমগ্ৰ উত্তৰ-পূৰ্ব ভ্ৰমণ কৰক ৪-স্তৰীয় জৰুৰীকালীন নিৰাপত্তা ব্যৱস্থাৰে, যি ইণ্টাৰনেট নোহোৱাকৈও কাম কৰে।",
    banner1Badge: "ভানা ৪-স্তৰীয় SOS প্ৰটোকল",
    bannerCta1: "জৰুৰীকালীন SOS প'ৰ্টেল",
    bannerCta2: "মানচিত্ৰ চাওক",

    accessServices: "ভানা সেৱাসমূহ ব্যৱহাৰ কৰক",
    servicesSubtitle: "নাগৰিক আৰু পৰ্যটক সেৱা",
    proceed: "আগবাঢ়ক",

    pmQuote: "উত্তৰ-পূৰ্বাঞ্চল ভাৰতৰ বিকাশ আৰু প্ৰাকৃতিক সৌন্দৰ্য্যৰ 'অষ্টলক্ষ্মী'। প্ৰতিজন যাত্ৰীক স্মাৰ্ট প্ৰযুক্তিৰে সুৰক্ষিত কৰাটো আমাৰ লক্ষ্য।",
    pmName: "শ্ৰী নৰেন্দ্ৰ মোদী",
    pmTitle: "মাননীয় প্ৰধানমন্ত্ৰী, ভাৰত",
    pmCiting: "ৰাষ্ট্ৰীয় পৰ্যটন আৰু উত্তৰ-পূৰ্ব বিকাশ সন্মিলন",

    telemetryTitle: "ভানা উত্তৰ-পূৰ্ব নিৰাপত্তা ডেচব'ৰ্ড",
    telemetrySubtitle: "প্ৰত্যক্ষ নিৰাপত্তা পৰিসংখ্যা",
    statIds: "প্ৰমাণিত ডিজিটেল পৰিচয় পত্ৰ",
    statStates: "সংযুক্ত উত্তৰ-পূৰ্ব ৰাজ্য",
    statDelivery: "SOS সফলতাৰ হাৰ",
    statZones: "চিহ্নিত বিপদজনক অঞ্চল",
    statPolice: "পৰ্যটক আৰক্ষী সংযোগ",

    personaTitle: "আপোনাৰ ভূমিকা নিৰ্বাচন কৰক",
    personaSubtitle: "ব্যক্তিগত অভিজ্ঞতা",
    trekkerTitle: "ট্ৰেকাৰ আৰু ভ্ৰমণকাৰী",
    intlTitle: "আন্তঃৰাষ্ট্ৰীয় পৰ্যটক",
    operatorTitle: "টাক্সি চালক আৰু অপাৰেটৰ",
    authorityTitle: "আৰক্ষী আৰু বন বিষয়া",

    cascadeTitle: "কানেক্টিভিটি কাস্কেড: ৪-স্তৰীয় SOS ব্যৱস্থা",
    cascadeSubtitle: "দুৰ্গম পাহাৰ আৰু গভীৰ উপত্যকাৰ বাবে প্ৰস্তুত কৰা বিশেষ নিৰাপত্তা ব্যৱস্থা।",
    step0Title: "স্তৰ ০: সতৰ্কবাণী সংকেত",
    step0Desc: "নেটৱৰ্ক নথকা অঞ্চলত প্ৰৱেশ কৰাৰ ৫০০ মিটাৰ পূৰ্বেই জি.পি.এছ-এ সতৰ্কবাণী দিয়ে।",
    step1Title: "স্তৰ ১: ইণ্টাৰনেট গেটৱে",
    step1Desc: "ইণ্টাৰনেট থাকিলে আৰক্ষী নিয়ন্ত্ৰণ কক্ষলৈ তাৎক্ষণিক বাৰ্তা প্ৰেৰণ কৰা হয়।",
    step2Title: "স্তৰ ২: সুৰক্ষিত SMS",
    step2Desc: "নেটৱৰ্ক কম থাকিলে এনক্ৰিপ্ট কৰা ক্ষুদ্ৰ বাৰ্তা (SMS) প্ৰেৰণ কৰা হয়।",
    step3Title: "স্তৰ ৩: ব্লুটুথ মেষ বীকন",
    step3Desc: "নেটৱৰ্ক সম্পূৰ্ণ বন্ধ থাকিলে ওচৰৰ পৰ্যটকৰ সহায়ত ব্লুটুথ সংকেত বিয়পাই দিয়া হয়।",

    helplineTitle: "উত্তৰ-পূৰ্বাঞ্চলত জৰুৰী সহায়ৰ প্ৰয়োজন নেকি?",
    helplineDesc: "২৪ ঘণ্টাই উপলব্ধ সাহায্য নম্বৰ",
    call112: "📞 ৰাষ্ট্ৰীয় জৰুৰীকালীন: 112",
    call1363: "📞 পৰ্যটক হেল্পলাইন: 1363",

    // Dashboard
    dashboardWelcome: "পুনৰ স্বাগতম",
    dashboardSub: "আপোনাৰ ৪-স্তৰীয় অফলাইন SOS নেটৱৰ্ক আৰু ডিজিটেল পৰিচয় সক্ৰিয় হৈ আছে।",
    readySOS: "🚨 জৰুৰীকালীন SOS সাজু ৰাখক",
    kycCardTitle: "ডিজিটেল ID আৰু পাছপ'ৰ্ট KYC",
    kycCardDesc: "ডিজিলকাৰ আধাৰ বা আন্তঃৰাষ্ট্ৰীয় পাছপ'ৰ্টৰ জৰিয়তে পৰীক্ষণ সম্পূৰ্ণ কৰক।",
    mapCardTitle: "ইণ্টাৰেক্টিভ নিৰাপত্তা মানচিত্ৰ",
    mapCardDesc: "মেঘালয় আৰু ছিকিমৰ বিপদজনক এলেকা আৰু আৰক্ষী চকী চাওক।",
    faresCardTitle: "ONDC সঠিক ভাড়া নিৰ্দেশিকা",
    faresCardDesc: "টেক্সি, সূমো আৰু হোটেলৰ প্ৰকৃত চৰকাৰী মূল্য তালিকা।",
    cascadeChecklist: "৪-স্তৰীয় নিৰাপত্তা কাস্কেড তালিকা",

    // SOS
    sosHeading: "৪-স্তৰীয় জৰুৰীকালীন SOS প্ৰটোকল 🚨",
    sosSubheading: "ইণ্টাৰনেট ➔ সুৰক্ষিত SMS ➔ অফলাইন ব্লুটুথ মেষৰ জৰিয়তে সহায় প্ৰেৰণ কৰে।",
    sosHoldPrompt: "৩ ছেকেণ্ডৰ বাবে হেঁচি ধৰি ৰাখক",
    sosHolding: "হেঁচি থকা হৈছে...",
    sosActiveHeading: "জৰুৰীকালীন সাহায্য সক্ৰিয় হৈছে",
    sosCancelBtn: "জৰুৰীকালীন SOS বাতিল কৰক",
    cascadeStatusTitle: "কানেক্টিভিটি কাস্কেডৰ শেহতীয়া স্থিতি",

    // Map
    mapHeading: "ইণ্টাৰেক্টিভ নিৰাপত্তা আৰু ডেড-জোন মানচিত্ৰ 🗺️",
    mapSubheading: "বিপদজনক স্থান, নেটৱৰ্কহীন এলেকা (স্তৰ ০) আৰু চিকিৎসালয়ৰ অৱস্থান।",
    locateMeBtn: "মানচিত্ৰত মোৰ অৱস্থান চাওক",
    allLayers: "সকলো স্তৰ",
    dangerZonesLayer: "⚠️ বিপদজনক অঞ্চল",
    deadZonesLayer: "📡 নেটৱৰ্কহীন অঞ্চল (স্তৰ ০)",
    policeLayer: "👮 আৰক্ষী থানা",
    medicalLayer: "🏥 চিকিৎসা কেন্দ্ৰ",
    zonesDirectory: "⚠️ সংৰক্ষিত অঞ্চল তালিকা",

    // Fares
    faresHeading: "প্ৰকৃত সময়ৰ সঠিক ভাড়া আৰু নিৰিখ 💰",
    faresSubheading: "উত্তৰ-পূৰ্বত বাহন আৰু সেৱাসমূহৰ বাবে চৰকাৰী ONDC মূল্য তালিকা।",
    autoDetectBtn: "মোৰ স্থান চিনাক্ত কৰক",
    selectRegion: "অঞ্চল বাছনি কৰক:",
    localTransportTitle: "🚗 স্থানীয় যাতায়াতৰ নিৰিখ",
    popularRoutesTitle: "🗺️ জনপ্ৰিয় ভ্ৰমণ পথ",
    essentialsTitle: "🛒 খাদ্য আৰু হোটেলৰ মূল্য",
    reportScamTitle: "অতিরিক্ত ভাড়া বা প্ৰতাৰণাৰ অভিযোগ জনাওক",
    reportScamSub: "পৰ্যটক আৰক্ষীক পোনপটীয়াকৈ সতৰ্ক কৰক।",
    submitGrievanceBtn: "আৰক্ষীলৈ অভিযোগ প্ৰেৰণ কৰক →",

    // Trips
    tripsHeading: "সুৰক্ষিত ভ্ৰমণ পৰিকল্পনা আৰু AI পৰামৰ্শ ✈️",
    tripsSubheading: "উত্তৰ-পূৰ্বাঞ্চলৰ বতৰ আৰু ভূ-প্ৰকৃতিৰ নিৰাপত্তা নিৰীক্ষণ।",
    destinationLabel: "ভ্ৰমণৰ স্থান",
    datesLabel: "ভ্ৰমণৰ তাৰিখ",
    groupSizeLabel: "যাত্ৰীৰ সংখ্যা",
    generateAdvisoryBtn: "AI সুৰক্ষা নিৰ্দেশনা প্ৰস্তুত কৰক →",
    safetyScoreLabel: "নিৰাপত্তা স্ক'ৰ",
    terrainHazardTitle: "⚠️ ভূ-প্ৰকৃতিৰ বিপদ নিৰূপণ:",
    weatherAdvisoryTitle: "🌦️ বতৰ আৰু বৰষুণৰ সতৰ্কবাণী:",
    packingGearTitle: "🎒 প্ৰয়োজনীয় সামগ্ৰীৰ তালিকা:",
    permitStatusTitle: "📋 পাৰ্মিট স্থিতি:",

    // KYC
    kycHeading: "পৰ্যটক ডিজিটেল ID আৰু KYC পৰীক্ষণ 🛂",
    kycSubheading: "ডিজিলকাৰ আধাৰ বা আন্তঃৰাষ্ট্ৰীয় পাছপ'ৰ্ট স্কেন কৰি পাৰ্মিট লাভ কৰক।",
    tabDigiLocker: "🇮🇳 ডিজিটেল আধাৰ (স্বদেশী)",
    tabPassport: "✈️ আন্তঃৰাষ্ট্ৰীয় পাছপ'ৰ্ট OCR (বিদেশী)",
    aadhaarTitle: "ডিজিলকাৰ তৎক্ষণাৎ আধাৰ KYC",
    aadhaarPrompt: "চৰকাৰী সুৰক্ষিত পৰিচয় ব্যৱস্থা।",
    authDigiLockerBtn: "ডিজিলকাৰেৰে প্ৰমাণিত কৰক →",
    passportTitle: "পাছপ'ৰ্টৰ ফটো তুলক বা আপলোড কৰক",
    passportPrompt: "তলৰ ২-শাৰীৰ মেচিন ৰিডেবল অংশ (MRZ) স্পষ্ট হ'ব লাগিব।",
    extractMrzBtn: "MRZ পৰীক্ষা কৰি ডিজিটেল ID সৃষ্টি কৰক →",

    // Profile
    profileHeading: "পৰ্যটক প্ৰফাইল আৰু পৰিচয় পত্ৰ 👤",
    citizenIdLabel: "ভানা নাগৰিক ID",
    emergencyContactsTitle: "জৰুৰীকালীন যোগাযোগ নম্বৰ",
    addContactBtn: "+ নম্বৰ যোগ কৰক",
  },

  bn: {
    skipToContent: "মূল বিষয়বস্তুতে যান",
    govIndia: "ভারত সরকার | Government of India",
    ministryAttribution: "উত্তর-পূর্বাঞ্চল উন্নয়ন মন্ত্রক (MDoNER) ও পর্যটন মন্ত্রক",
    lightMode: "☀️ লাইট",
    darkMode: "🌙 ডার্ক",
    emergencySOS: "জরুরীকালীন SOS",
    signIn: "লগ ইন",
    register: "নিবন্ধন",
    logout: "লগ আউট",
    searchPlaceholder: "নিরাপত্তা জোন, পারমিট, ভাড়া খুঁজুন...",

    home: "🏠 হোম",
    touristHub: "📊 পর্যটক হাব",
    sosProtocol: "🚨 ৪-ধাপের SOS",
    safetyMap: "🗺️ সুরক্ষা মানচিত্র",
    fairPrices: "💰 ন্যায্য ভাড়া",
    tripsGuide: "✈️ ভ্রমণ নির্দেশিকা",
    digitalId: "🛂 ডিজিটাল পরিচয়পত্র",
    profile: "👤 প্রোফাইল",

    latestUpdates: "📢 সাম্প্রতিক আপডেট",

    banner1Title: "উত্তর-পূর্ব ভারতে নিরাপদ ও নিশ্চিন্ত ভ্রমণ",
    banner1Subtitle: "মেঘালয়, সিকিম ও সমগ্র উত্তর-পূর্ব ভ্রমণ করুন ৪-ধাপের জরুরীকালীন সুরক্ষা ব্যবস্থার সাথে, যা ইন্টারনেট ছাড়াও কাজ করে।",
    banner1Badge: "ভানা ৪-ধাপের SOS প্রটোকল",
    bannerCta1: "জরুরী SOS পোর্টাল",
    bannerCta2: "মানচিত্র দেখুন",

    accessServices: "ভানা সেবাসমূহ ব্যবহার করুন",
    servicesSubtitle: "নাগরিক ও পর্যটক সেবা",
    proceed: "এগিয়ে যান",

    pmQuote: "উত্তর-পূর্বাঞ্চল ভারতের বিকাশ ও প্রাকৃতিক সৌন্দর্যের 'অষ্টলক্ষ্মী'। প্রতিটি পর্যটককে আধুনিক প্রযুক্তির মাধ্যমে সুরক্ষিত রাখা আমাদের অঙ্গীকার।",
    pmName: "শ্রী নরেন্দ্র মোদী",
    pmTitle: "মাননীয় প্রধানমন্ত্রী, ভারত",
    pmCiting: "জাতীয় পর্যটন ও উত্তর-পূর্ব বিকাশ সম্মেলন",

    telemetryTitle: "ভানা উত্তর-পূর্ব সুরক্ষা ড্যাশবোর্ড",
    telemetrySubtitle: "রিয়েল-টাইম নিরাপত্তা পরিসংখ্যান",
    statIds: "যাচাইকৃত ডিজিটাল আইডি",
    statStates: "সংযুক্ত উত্তর-পূর্ব রাজ্য",
    statDelivery: "SOS বার্তা প্রেরণের হার",
    statZones: "চিহ্নিত ঝুঁকিপূর্ণ এলাকা",
    statPolice: "পর্যটন পুলিশ সহায়তা",

    personaTitle: "আপনার ভূমিকা নির্বাচন করুন",
    personaSubtitle: "ব্যক্তিগত অভিজ্ঞতা",
    trekkerTitle: "ট্রেকার ও ব্যাকপ্যাকার",
    intlTitle: "আন্তর্জাতিক পর্যটক",
    operatorTitle: "ট্যাক্সি ও ট্যুর অপারেটর",
    authorityTitle: "পুলিশ ও বন কর্মকর্তা",

    cascadeTitle: "কানেক্টিভিটি ক্যাসকেড: ৪-ধাপের SOS প্রটোকল",
    cascadeSubtitle: "দুর্গম উপত্যকা এবং গভীর বনাঞ্চলের জন্য নির্মিত নির্ভরযোগ্য নিরাপত্তা ব্যবস্থা।",
    step0Title: "ধাপ ০: পূর্ব সতর্কবার্তা",
    step0Desc: "মোবাইল নেটওয়ার্কহীন এলাকায় প্রবেশের ৫০০ মিটার আগেই জিপিএস সতর্কবার্তা দেয়।",
    step1Title: "ধাপ ১: প্রাথমিক ইন্টারনেট গেটওয়ে",
    step1Desc: "ইন্টারনেট থাকলে পুলিশ কন্ট্রোল রুমে সরাসরি অবস্থান ও ব্যাটারির তথ্য পৌঁছে যায়।",
    step2Title: "ধাপ ২: এনক্রিপ্ট করা সংক্ষিপ্ত SMS",
    step2Desc: "ইন্টারনেট না থাকলে এসএমএস গেটওয়ের মাধ্যমে বার্তা পাঠানো হয়।",
    step3Title: "ধাপ ৩: অফলাইন ব্লুটুথ মেশ বীকন",
    step3Desc: "নেটওয়ার্ক সম্পূর্ণ শূন্য হলে ফোন সংকেত পাঠায় যা আশেপাশের পর্যটকরা স্বয়ংক্রিয়ভাবে পৌঁছে দেয়।",

    helplineTitle: "উত্তর-পূর্বাঞ্চলে জরুরী সাহায্যের প্রয়োজন?",
    helplineDesc: "২৪x৭ জরুরী যোগাযোগ নম্বর",
    call112: "📞 জাতীয় জরুরী নম্বর: 112",
    call1363: "📞 পর্যটন হেল্পলাইন: 1363",

    // Dashboard
    dashboardWelcome: "স্বাগতম",
    dashboardSub: "আপনার ৪-ধাপের অফলাইন SOS নেটওয়ার্ক এবং ডিজিটাল আইডি সক্রিয় রয়েছে।",
    readySOS: "🚨 জরুরী SOS প্রস্তুত রাখুন",
    kycCardTitle: "ডিজিটাল আইডি ও পাসপোর্ট KYC",
    kycCardDesc: "ডিজিলকার আধার বা আন্তর্জাতিক পাসপোর্টের মাধ্যমে যাচাইকরণ সম্পন্ন করুন।",
    mapCardTitle: "ইন্টারেক্টিভ নিরাপত্তা মানচিত্র",
    mapCardDesc: "মেঘালয় ও সিকিমের ঝুঁকিপূর্ণ এলাকা এবং পুলিশ ফাঁড়ির অবস্থান দেখুন।",
    faresCardTitle: "ONDC ন্যায্য ভাড়া নির্দেশিকা",
    faresCardDesc: "ট্যাক্সি, সুমো ও হোটেলের সরকারি ন্যায্য ভাড়ার তালিকা।",
    cascadeChecklist: "৪-ধাপের নিরাপত্তা ক্যাসকেড চেকলিস্ট",

    // SOS
    sosHeading: "৪-ধাপের জরুরীকালীন SOS প্রটোকল 🚨",
    sosSubheading: "ইন্টারনেট ➔ সুরক্ষিত SMS ➔ অফলাইন ব্লুটুথ মেশের মাধ্যমে বার্তা পাঠায়।",
    sosHoldPrompt: "৩ সেকেন্ড চেপে ধরে রাখুন",
    sosHolding: "চেপে রাখা হচ্ছে...",
    sosActiveHeading: "জরুরী উদ্ধার প্রক্রিয়া সক্রিয়",
    sosCancelBtn: "জরুরী SOS বাতিল করুন",
    cascadeStatusTitle: "কানেক্টিভিটি ক্যাসকেডের বর্তমান অবস্থা",

    // Map
    mapHeading: "ইন্টারেক্টিভ নিরাপত্তা ও ডেড-জোন মানচিত্র 🗺️",
    mapSubheading: "ঝুঁকিপূর্ণ স্থান, নেটওয়ার্কহীন এলাকা (ধাপ ০) এবং জরুরি চিকিৎসাকেন্দ্র।",
    locateMeBtn: "মানচিত্রে আমার অবস্থান দেখুন",
    allLayers: "সব স্তর",
    dangerZonesLayer: "⚠️ ঝুঁকিপূর্ণ এলাকা",
    deadZonesLayer: "📡 ডেড জোন (ধাপ ০)",
    policeLayer: "👮 পুলিশ ফাঁড়ি",
    medicalLayer: "🏥 চিকিৎসাকেন্দ্র",
    zonesDirectory: "⚠️ সংরক্ষিত এলাকা তালিকা",

    // Fares
    faresHeading: "রিয়েল-টাইম ন্যায্য ভাড়া ও দর তালিকা 💰",
    faresSubheading: "উত্তর-পূর্বে পরিবহন ও নিত্যপ্রয়োজনীয় সামগ্রীর সরকারি ONDC ন্যায্য দর।",
    autoDetectBtn: "আমার অবস্থান শনাক্ত করুন",
    selectRegion: "অঞ্চল নির্বাচন করুন:",
    localTransportTitle: "🚗 স্থানীয় পরিবহনের ন্যায্য দর",
    popularRoutesTitle: "🗺️ জনপ্রিয় পর্যটন রুট",
    essentialsTitle: "🛒 খাদ্য ও হোটেলের ন্যায্য মূল্য",
    reportScamTitle: "অতিরিক্ত ভাড়া বা প্রতারণার অভিযোগ জানান",
    reportScamSub: "সরাসরি পর্যটন পুলিশ কন্ট্রোল রুমে তথ্য পাঠায়।",
    submitGrievanceBtn: "পুলিশ ডেস্কে অভিযোগ পাঠান →",

    // Trips
    tripsHeading: "নিরাপদ ভ্রমণ পরিকল্পনা ও AI পরামর্শ ✈️",
    tripsSubheading: "উত্তর-পূর্ব ভারতের আবহাওয়া ও ভৌগোলিক ঝুঁকি বিশ্লেষণ।",
    destinationLabel: "ভ্রমণ গন্তব্য",
    datesLabel: "ভ্রমণের তারিখ",
    groupSizeLabel: "যাত্রী সংখ্যা",
    generateAdvisoryBtn: "AI নিরাপত্তা নির্দেশিকা তৈরি করুন →",
    safetyScoreLabel: "নিরাপত্তা স্কোর",
    terrainHazardTitle: "⚠️ ভৌগোলিক ঝুঁকি বিশ্লেষণ:",
    weatherAdvisoryTitle: "🌦️ আবহাওয়া ও বৃষ্টির সতর্কতা:",
    packingGearTitle: "🎒 প্রয়োজনীয় সামগ্রীর তালিকা:",
    permitStatusTitle: "📋 পারমিট অবস্থা:",

    // KYC
    kycHeading: "পর্যটক ডিজিটাল আইডি ও KYC যাচাইকরণ 🛂",
    kycSubheading: "ডিজিলকার আধার বা আন্তর্জাতিক পাসপোর্ট স্ক্যান করে পারমিট সংগ্রহ করুন।",
    tabDigiLocker: "🇮🇳 ডিজিলকার আধার (স্বদেশী)",
    tabPassport: "✈️ আন্তর্জাতিক পাসপোর্ট OCR (বিদেশী)",
    aadhaarTitle: "ডিজিলকার তাৎক্ষণিক আধার KYC",
    aadhaarPrompt: "সরকারি সুরক্ষিত পরিচয়পত্র যাচাই।",
    authDigiLockerBtn: "ডিজিলকার দিয়ে যাচাই করুন →",
    passportTitle: "পাসপোর্টের ছবি তুলুন বা আপলোড করুন",
    passportPrompt: "নিচের ২-লাইনের মেশিন রিডেবল অংশ (MRZ) পরিষ্কার হওয়া আবশ্যক।",
    extractMrzBtn: "MRZ যাচাই করে ডিজিটাল আইডি তৈরি করুন →",

    // Profile
    profileHeading: "পর্যটক প্রোফাইল ও পরিচয়পত্র 👤",
    citizenIdLabel: "ভানা নাগরিক আইডি",
    emergencyContactsTitle: "জরুরী যোগাযোগ নম্বর",
    addContactBtn: "+ নম্বর যোগ করুন",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: TRANSLATIONS.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("vana-lang") as Language;
    if (saved && TRANSLATIONS[saved]) {
      setLangState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    localStorage.setItem("vana-lang", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: TRANSLATIONS[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
