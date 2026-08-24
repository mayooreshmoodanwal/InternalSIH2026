"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GovHeader } from "../components/GovHeader";
import { GovFooter } from "../components/GovFooter";
import { useLanguage } from "../context/LanguageContext";

export default function GovernmentHomepage() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("announcements");
  const [selectedPersona, setSelectedPersona] = useState<string>("trekker");
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isCarouselPlaying, setIsCarouselPlaying] = useState<boolean>(true);

  // Dynamic Translated Banner Slides
  const bannerSlides = [
    {
      id: 1,
      badge: t.banner1Badge,
      title: t.banner1Title,
      subtitle: t.banner1Subtitle,
      primaryCta: { label: t.bannerCta1, href: "/sos" },
      secondaryCta: { label: t.bannerCta2, href: "/map" },
      bgGradient: "linear-gradient(135deg, rgba(14, 116, 144, 0.85) 0%, rgba(15, 23, 42, 0.92) 100%)",
      imageTag: "Double Decker Living Root Bridge • Cherrapunji",
    },
    {
      id: 2,
      badge: language === "hi" ? "डिजिटल पहचान एवं केवाईसी" : language === "as" ? "ডিজিটেল পৰিচয় আৰু KYC" : language === "bn" ? "ডিজিটাল পরিচয় ও KYC" : "Digital Identity & KYC",
      title: language === "hi" ? "पासपोर्ट ओसीआर एवं डिजिलॉकर त्वरित सत्यापन" : language === "as" ? "পাছপ'ৰ্ট OCR আৰু ডিজিটেল পৰীক্ষণ" : language === "bn" ? "পাসপোর্ট OCR ও ডিজিলকার তাৎক্ষণিক যাচাইকরণ" : "Instant Passport OCR & DigiLocker Verification",
      subtitle: language === "hi" ? "सुरक्षित एवं सत्यापित डिजिटल आईडी प्राप्त करें। संरक्षित क्षेत्र परमिट (PAP) के लिए तत्काल पात्रता।" : language === "as" ? "সুৰক্ষিত ডিজিটেল পৰিচয় পত্ৰ লাভ কৰক আৰু সংৰক্ষিত এলেকা পাৰ্মিটৰ বাবে তৎক্ষণাৎ আবেদন কৰক।" : language === "bn" ? "নিরাপদ ডিজিটাল আইডি পান এবং সংরক্ষিত এলাকা পারমিটের (PAP) জন্য তাত্ক্ষণিক অনুমোদন লাভ করুন।" : "Extract ICAO 9303 machine-readable zones with camera capture. Get your verified Digital ID for seamless Protected Area Permits (PAP).",
      primaryCta: { label: language === "hi" ? "डिजिटल आईडी सत्यापित करें" : language === "as" ? "পৰিচয় পৰীক্ষা কৰক" : language === "bn" ? "ডিজিটাল আইডি যাচাই করুন" : "Verify Digital ID", href: "/kyc" },
      secondaryCta: { label: language === "hi" ? "संरक्षित क्षेत्र परमिट" : language === "as" ? "সংৰক্ষিত অঞ্চল পাৰ্মিট" : language === "bn" ? "সংরক্ষিত এলাকা পারমিট" : "Protected Area Permits", href: "/trips" },
      bgGradient: "linear-gradient(135deg, rgba(30, 58, 138, 0.85) 0%, rgba(15, 23, 42, 0.92) 100%)",
      imageTag: "High Altitude Pass • Nathula & East Sikkim",
    },
    {
      id: 3,
      badge: language === "hi" ? "सक्रिय डेड-ज़ोन चेतावनी (चरण 0)" : language === "as" ? "সতৰ্কবাণী সংকেত (স্তৰ ০)" : language === "bn" ? "পূর্ব সতর্কবার্তা (ধাপ ০)" : "Proactive Dead-Zone Warnings (Step 0)",
      title: language === "hi" ? "सिग्नल समाप्त होने से 500 मीटर पहले जीपीएस अलर्ट" : language === "as" ? "নেটৱৰ্ক বন্ধ হোৱাৰ পূৰ্বেই জি.পি.এছ সংকেত" : language === "bn" ? "নেটওয়ার্ক হারানোর আগেই জিপিএস সংকেত" : "GPS Dead-Zone Alerts Before Signal Drops",
      subtitle: language === "hi" ? "हार्डवेयर जीपीएस आपके मार्ग को ट्रैक करता है और घाटी में नेटवर्क जाने से पहले आपको सूचित करता है।" : language === "as" ? "হাৰ্ডৱেৰ জি.পি.এছ-এ আপোনাৰ পথ নিৰীক্ষণ কৰে আৰু বিপদজনক এলেকাত আগতীয়াকৈ সঁহাৰি জনায়।" : language === "bn" ? "হার্ডওয়্যার জিপিএস আপনার পথ ট্র্যাক করে এবং নেটওয়ার্কহীন উপত্যকায় পৌঁছানোর আগেই সতর্ক করে।" : "Hardware GPS logs your path and warns you 500m before entering valley dead zones. Automatically caches your safety itinerary locally.",
      primaryCta: { label: language === "hi" ? "डेड ज़ोन देखें" : language === "as" ? "নেটৱৰ্কহীন এলেকা চাওক" : language === "bn" ? "ডেড জোন দেখুন" : "Check Dead Zones", href: "/map" },
      secondaryCta: { label: language === "hi" ? "प्रोटोकॉल कैसे काम करता है" : language === "as" ? "প্ৰণালীটো কেনেকৈ কাম কৰে" : language === "bn" ? "প্রটোকল কিভাবে কাজ করে" : "How Cascade Works", href: "#cascade-section" },
      bgGradient: "linear-gradient(135deg, rgba(124, 45, 18, 0.85) 0%, rgba(15, 23, 42, 0.92) 100%)",
      imageTag: "Crystal Clear Waters • Dawki & Umngot River",
    },
    {
      id: 4,
      badge: language === "hi" ? "उचित मूल्य व एंटी-स्कैम शील्ड" : language === "as" ? "সঠিক মূল্য আৰু নিৰাপত্তা" : language === "bn" ? "ন্যায্য মূল্য ও প্রতারণা প্রতিরোধ" : "Anti-Scam Fare Shield",
      title: language === "hi" ? "पारदर्शी किराया एवं ओवरचार्जिंग से बचाव" : language === "as" ? "স্বচ্ছ ভাড়া আৰু অতিরিক্ত মূল্যৰ পৰা সুৰক্ষা" : language === "bn" ? "স্বচ্ছ ভাড়া ও অতিরিক্ত মূল্য প্রতিরোধ" : "Transparent Fares & Anti-Overcharging Guide",
      subtitle: language === "hi" ? "शिलांग, गंगटोक और चेरापूंजी में टैक्सी, सूमो और आवश्यक वस्तुओं की आधिकारिक दरें जानें।" : language === "as" ? "শ্বিলং, গেংটক আৰু চেৰাপুঞ্জীত চৰকাৰীভাৱে নিৰ্ধাৰিত টেক্সি আৰু সূমোৰ সঠিক ভাড়া জানক।" : language === "bn" ? "শিলং, গ্যাংটক এবং চেরাপুঞ্জিতে ট্যাক্সি, সুমো ও প্রয়োজনীয় সামগ্রীর সরকারি ন্যায্য ভাড়া জানুন।" : "Know official taxi rates per km, shared sumo seats, and meal costs in Shillong, Gangtok, and Cherrapunji. Never get overcharged.",
      primaryCta: { label: language === "hi" ? "उचित दरें देखें" : language === "as" ? "সঠিক দৰ চাওক" : language === "bn" ? "ন্যায্য দর দেখুন" : "Check Fair Rates", href: "/fares" },
      secondaryCta: { label: language === "hi" ? "शिकायत दर्ज करें" : language === "as" ? "অভিযোগ দাখিল কৰক" : language === "bn" ? "অভিযোগ জানান" : "Report Overcharging", href: "/fares" },
      bgGradient: "linear-gradient(135deg, rgba(19, 78, 74, 0.85) 0%, rgba(15, 23, 42, 0.92) 100%)",
      imageTag: "Mountain Roadways • Gangtok to Tsomgo Lake",
    },
  ];

  // Carousel autoplay
  useEffect(() => {
    if (!isCarouselPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isCarouselPlaying, bannerSlides.length]);

  const keyServices = [
    {
      icon: "🚨",
      title: language === "hi" ? "4-चरणीय एसओएस प्रोटोकॉल" : language === "as" ? "৪-স্তৰীয় SOS প্ৰটোকল" : language === "bn" ? "৪-ধাপের SOS প্রটোকল" : "4-Step SOS Protocol",
      desc: language === "hi" ? "इंटरनेट ➔ एसएमएस ➔ बीएलई मेश ऑफलाइन कैस्केड।" : language === "as" ? "ইণ্টাৰনেট ➔ SMS ➔ ব্লুটুথ মেষ জৰুৰীকালীন সাহায্য।" : language === "bn" ? "ইন্টারনেট ➔ SMS ➔ ব্লুটুথ মেশ অফলাইন সাহায্য।" : "Emergency trigger with Internet → SMS → BLE Mesh offline cascade.",
      href: "/sos",
      tag: language === "hi" ? "शून्य-नेटवर्क समर्थित" : language === "as" ? "নেটৱৰ্কহীনভাৱে উপলব্ধ" : language === "bn" ? "নেটওয়ার্কহীন উপযোগী" : "Zero-Network Ready",
    },
    {
      icon: "🛂",
      title: language === "hi" ? "डिजिटल आईडी व पासपोर्ट ओसीआर" : language === "as" ? "ডিজিটেল ID আৰু পাছপ'ৰ্ট পৰীক্ষণ" : language === "bn" ? "ডিজিটাল ID ও পাসপোর্ট OCR" : "Digital ID & Passport OCR",
      desc: language === "hi" ? "डिजिलॉकर या पासपोर्ट स्कैन द्वारा त्वरित सत्यापन।" : language === "as" ? "ডিজিলকাৰ বা পাছপ'ৰ্টৰ জৰিয়তে পৰীক্ষণ।" : language === "bn" ? "ডিজিলকার বা পাসপোর্ট স্ক্যানের মাধ্যমে তাৎক্ষণিক যাচাই।" : "Scan passport photo page or connect DigiLocker for instant verifiable KYC.",
      href: "/kyc",
      tag: "ICAO 9303 / Aadhaar",
    },
    {
      icon: "📡",
      title: language === "hi" ? "डेड-ज़ोन सक्रिय चेतावनी" : language === "as" ? "নেটৱৰ্কহীন এলেকাৰ আগতীয়া সংকেত" : language === "bn" ? "ডেড-জোন পূর্ব সতর্কবার্তা" : "Dead-Zone Proactive Alerts",
      desc: language === "hi" ? "सिग्नल जाने से 500 मीटर पहले जीपीएस चेतावनी।" : language === "as" ? "নেটৱৰ্ক নাইকীয়া হোৱাৰ ৫০০ মিটাৰ আগতেই সংকেত।" : language === "bn" ? "নেটওয়ার্ক বিচ্ছিন্ন হওয়ার ৫০০ মিটার আগেই সতর্কতা।" : "Step 0 GPS warnings notify you 500m before entering low-signal trails.",
      href: "/map",
      tag: "Hardware GPS",
    },
    {
      icon: "🗺️",
      title: language === "hi" ? "सुरक्षा एवं खतरा मानचित्र" : language === "as" ? "নিৰাপত্তা আৰু বিপদজনক এলেকা মানচিত্ৰ" : language === "bn" ? "সুরক্ষা ও ঝুঁকিপূর্ণ এলাকা মানচিত্র" : "Safety & Hazard Map",
      desc: language === "hi" ? "संवेदनशील क्षेत्र, पुलिस थाने और चिकित्सा केंद्र।" : language === "as" ? "বিপদজনক স্থান, আৰক্ষী থানা আৰু জৰুৰীকালীন কেন্দ্ৰ।" : language === "bn" ? "ঝুঁকিপূর্ণ স্থান, পুলিশ থানা এবং জরুরি চিকিৎসাকেন্দ্র।" : "Interactive map with danger zones, police stations, and medical outposts.",
      href: "/map",
      tag: "Meghalaya & Sikkim",
    },
    {
      icon: "💰",
      title: language === "hi" ? "उचित किराया व मूल्य जांच" : language === "as" ? "সঠিক নিৰ্ধাৰিত ভাড়া নিৰীক্ষণ" : language === "bn" ? "ন্যায্য ভাড়া ও মূল্য যাচাই" : "ONDC Anti-Scam Fare Checker",
      desc: language === "hi" ? "टैक्सी, सूमो, होमस्टे और आवश्यक वस्तुओं का उचित मूल्य।" : language === "as" ? "টেক্সি, সূমো আৰু হোটেলৰ চৰকাৰী নিৰ্ধাৰিত মূল্য।" : language === "bn" ? "ট্যাক্সি, সুমো ও হোটেলের সরকারি নির্ধারিত ন্যায্য দর।" : "Official fare benchmarks for cabs, sumos, homestays, and essentials.",
      href: "/fares",
      tag: "ONDC Open Commerce",
    },
    {
      icon: "📋",
      title: language === "hi" ? "संरक्षित क्षेत्र परमिट (PAP)" : language === "as" ? "সংৰক্ষিত অঞ্চল পাৰ্মিট (PAP)" : language === "bn" ? "সংরক্ষিত এলাকা পারমিট (PAP)" : "Protected Area Permits",
      desc: language === "hi" ? "नाथुला पास और सीमावर्ती क्षेत्रों हेतु डिजिटल आवेदन।" : language === "as" ? "নাথুলা আৰু সীমান্ত অঞ্চল ভ্ৰমণৰ বাবে ডিজিটেল পাৰ্মিট।" : language === "bn" ? "নাথুলা ও সীমান্তবর্তী অঞ্চলে ভ্রমণের জন্য ডিজিটাল পারমিট।" : "Digital application and validation for Nathula Pass, Tsomgo, and border zones.",
      href: "/trips",
      tag: "PAP / ILP Support",
    },
    {
      icon: "🏛️",
      title: language === "hi" ? "पर्यटक पुलिस कमांड डेस्क" : language === "as" ? "পৰ্যটক আৰক্ষী কমাণ্ড কেন্দ্ৰ" : language === "bn" ? "পর্যটন পুলিশ কমান্ড ডেস্ক" : "Police & Authority Desk",
      desc: language === "hi" ? "राज्य पुलिस व वन अधिकारियों हेतु आपातकालीन पोर्टल।" : language === "as" ? "ৰাজ্যিক আৰক্ষী আৰু বন বিষয়াৰ জৰুৰীকালীন কেন্দ্ৰ।" : language === "bn" ? "রাজ্য পুলিশ ও বন কর্মকর্তাদের জন্য জরুরি পোর্টাল।" : "Command dashboard for state police and forest rangers with live incident triage.",
      href: "/authority/dashboard",
      tag: "Official Access 🔒",
    },
    {
      icon: "✈️",
      title: language === "hi" ? "एआई यात्रा व मौसम सलाहकार" : language === "as" ? "AI ভ্ৰমণ আৰু বতৰ নিৰ্দেশনা" : language === "bn" ? "AI ভ্রমণ ও আবহাওয়া নির্দেশিকা" : "AI Trip Planner & Advisory",
      desc: language === "hi" ? "पूर्वोत्तर हेतु विशेष मौसम, भू-भाग जोखिम व पैकिंग सलाह।" : language === "as" ? "উত্তৰ-পূৰ্বাঞ্চলৰ বিশেষ বতৰ আৰু ভূ-প্ৰকৃতিৰ নিৰাপত্তা পৰামৰ্শ।" : language === "bn" ? "উত্তর-পূর্বের বিশেষ আবহাওয়া ও ভৌগোলিক নিরাপত্তা নির্দেশিকা।" : "Get customized weather, terrain hazard, and packing advice tailored for NER.",
      href: "/trips",
      tag: "AI Intelligence",
    },
  ];

  const announcements = [
    {
      date: "23 AUG 2026",
      title: language === "hi" ? "मानसून चेतावनी: चेरापूंजी रूट ब्रिज मार्ग पर गीले पत्थरों पर फिसलने से बचें।" : language === "as" ? "বৰষুণৰ সতৰ্কবাণী: চেৰাপুঞ্জী ৰুট ব্ৰীজৰ বাটত পিচল শিলৰ পৰা সাৱধান হওক।" : language === "bn" ? "বর্ষার সতর্কতা: চেরাপুঞ্জি রুট ব্রিজ ট্রেইলে পিচ্ছিল পাথরে সতর্ক থাকুন।" : "Monsoon Advisory: Living Root Bridge trek requires high-traction footwear due to wet stone steps.",
      tag: "Weather Alert",
      link: "/map",
    },
    {
      date: "22 AUG 2026",
      title: language === "hi" ? "नाथुला पास मार्ग सीमा सड़क संगठन (BRO) द्वारा सुचारू रूप से खोल दिया गया है।" : language === "as" ? "নাথুলা পাছৰ পথ সম্পূৰ্ণৰূপে মুকলি কৰা হৈছে।" : language === "bn" ? "নাথুলা পাস রাস্তা সম্পূর্ণভাবে চলাচলের জন্য উন্মুক্ত করা হয়েছে।" : "Nathula Pass road clearance completed by BRO; tourist permits operational for registered vehicles.",
      tag: "Permit Status",
      link: "/trips",
    },
    {
      date: "20 AUG 2026",
      title: language === "hi" ? "ईस्ट खासी हिल्स में दावकी कॉरिडोर के साथ 4 नए ऑफलाइन बीएलई मेश रिले नोड सक्रिय।" : language === "as" ? "ডাউকী অঞ্চলত ৪ টা নতুন ব্লুটুথ মেষ নিৰাপত্তা নোড স্থাপন।" : language === "bn" ? "ডাওকি করিডোরে ৪টি নতুন ব্লুটুথ মেশ সুরক্ষা নোড সক্রিয় করা হয়েছে।" : "Tourist Police East Khasi Hills establishes 4 new offline BLE mesh relay nodes along Dawki corridor.",
      tag: "Safety Mesh",
      link: "/sos",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <GovHeader />

      <main id="main-content" style={{ maxWidth: "1380px", margin: "0 auto", padding: "24px 20px" }}>
        {/* ─── Top Banner Carousel ─────────────────────────────── */}
        <section style={{ position: "relative", marginBottom: "36px" }}>
          <div style={{
            borderRadius: "var(--radius-xl)", overflow: "hidden", minHeight: "440px",
            background: bannerSlides[currentSlide].bgGradient, color: "white",
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "50px 60px", position: "relative", boxShadow: "var(--shadow-lg)",
            transition: "background 0.5s ease",
          }}>
            <div style={{
              position: "absolute", inset: 0, opacity: 0.12,
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px", pointerEvents: "none",
            }} />

            <div style={{ position: "relative", zIndex: 10, maxWidth: "780px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "6px 14px", borderRadius: "var(--radius-full)",
                background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)",
                fontSize: "12px", fontWeight: "700", marginBottom: "18px", letterSpacing: "0.5px",
              }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80" }} />
                {bannerSlides[currentSlide].badge}
              </div>

              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "800", lineHeight: "1.15", marginBottom: "16px" }}>
                {bannerSlides[currentSlide].title}
              </h2>

              <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.9)", lineHeight: "1.6", marginBottom: "28px", maxWidth: "680px" }}>
                {bannerSlides[currentSlide].subtitle}
              </p>

              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <Link href={bannerSlides[currentSlide].primaryCta.href} style={{
                  padding: "12px 26px", borderRadius: "var(--radius-md)",
                  background: "white", color: "#0f172a", textDecoration: "none",
                  fontSize: "14px", fontWeight: "700", boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                }}>
                  {bannerSlides[currentSlide].primaryCta.label} →
                </Link>
                <Link href={bannerSlides[currentSlide].secondaryCta.href} style={{
                  padding: "12px 26px", borderRadius: "var(--radius-md)",
                  background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
                  color: "white", textDecoration: "none", fontSize: "14px", fontWeight: "600",
                  backdropFilter: "blur(8px)",
                }}>
                  {bannerSlides[currentSlide].secondaryCta.label}
                </Link>
              </div>
            </div>

            <div style={{
              position: "absolute", bottom: "24px", right: "32px",
              fontSize: "12px", color: "rgba(255,255,255,0.8)",
              background: "rgba(0,0,0,0.35)", padding: "4px 12px", borderRadius: "var(--radius-full)",
              backdropFilter: "blur(4px)",
            }}>
              📍 {bannerSlides[currentSlide].imageTag}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "14px" }}>
            {bannerSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: currentSlide === idx ? "28px" : "10px", height: "10px",
                  borderRadius: "var(--radius-full)", border: "none", cursor: "pointer",
                  background: currentSlide === idx ? "var(--gov-saffron)" : "var(--border-subtle)",
                  transition: "all 0.3s ease",
                }}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
            <button
              onClick={() => setIsCarouselPlaying(!isCarouselPlaying)}
              style={{
                marginLeft: "8px", background: "none", border: "none",
                cursor: "pointer", fontSize: "14px", color: "var(--text-muted)",
              }}
            >
              {isCarouselPlaying ? "⏸️" : "▶️"}
            </button>
          </div>
        </section>

        {/* ─── Key Offerings & Services ────────────────────────── */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--gov-saffron)", textTransform: "uppercase" }}>
                {t.servicesSubtitle}
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-heading)", marginTop: "2px" }}>
                {t.accessServices}
              </h2>
            </div>
            <Link href="/map" style={{
              fontSize: "13px", fontWeight: "600", color: "var(--accent-primary)",
              textDecoration: "none", display: "flex", alignItems: "center", gap: "4px",
            }}>
              {t.proceed} →
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
            {keyServices.map((svc, i) => (
              <Link
                key={i}
                href={svc.href}
                className="gov-card"
                style={{
                  padding: "24px", textDecoration: "none", display: "flex",
                  flexDirection: "column", justifyContent: "space-between", minHeight: "180px",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <span style={{ fontSize: "32px" }}>{svc.icon}</span>
                    <span style={{
                      fontSize: "11px", padding: "3px 8px", borderRadius: "var(--radius-full)",
                      background: "rgba(59,130,246,0.1)", color: "var(--accent-primary)", fontWeight: "600",
                    }}>
                      {svc.tag}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
                    {svc.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                    {svc.desc}
                  </p>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  fontSize: "13px", fontWeight: "600", color: "var(--accent-primary)", marginTop: "16px",
                }}>
                  <span>{t.proceed}</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── Live Telemetry & Statistics ─────────────────────── */}
        <section style={{
          background: "linear-gradient(135deg, #0d7a46 0%, #064e2b 100%)",
          borderRadius: "var(--radius-xl)", color: "white", padding: "36px 40px",
          marginBottom: "48px", boxShadow: "var(--shadow-lg)", position: "relative", overflow: "hidden",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
            <div>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9 }}>
                {t.telemetrySubtitle}
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginTop: "2px" }}>
                {t.telemetryTitle}
              </h2>
            </div>
            <Link href="/authority/dashboard" style={{
              padding: "8px 18px", borderRadius: "var(--radius-full)",
              background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)",
              color: "white", textDecoration: "none", fontSize: "13px", fontWeight: "600",
            }}>
              {language === "hi" ? "कमांड डेस्क देखें →" : language === "as" ? "আৰক্ষী কেন্দ্ৰ চাওক →" : language === "bn" ? "কমান্ড ডেস্ক দেখুন →" : "Authority Live Desk →"}
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
            {[
              { num: "18,520+", label: t.statIds, sub: "DigiLocker & Passport" },
              { num: "8 States", label: t.statStates, sub: "Meghalaya & Sikkim Pilot" },
              { num: "99.8%", label: t.statDelivery, sub: "Internet / SMS / BLE Mesh" },
              { num: "42 Zones", label: t.statZones, sub: "Step 0 Warnings Active" },
              { num: "24 / 7", label: t.statPolice, sub: "112 National Emergency" },
            ].map((stat, i) => (
              <div key={i} style={{ borderLeft: "2px solid rgba(255,255,255,0.3)", paddingLeft: "16px" }}>
                <div style={{ fontSize: "32px", fontWeight: "900", letterSpacing: "-0.5px" }}>{stat.num}</div>
                <div style={{ fontSize: "14px", fontWeight: "600", marginTop: "2px" }}>{stat.label}</div>
                <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "2px" }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 4-Step SOS Protocol Visual ─────────────────────── */}
        <section id="cascade-section" style={{ marginBottom: "48px" }}>
          <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 32px" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--gov-saffron)", textTransform: "uppercase" }}>
              {language === "hi" ? "आपातकालीन सुरक्षा तंत्र" : language === "as" ? "নিৰাপত্তা প্ৰণালী" : language === "bn" ? "জরুরী নিরাপত্তা ব্যবস্থা" : "Fail-Safe Architecture"}
            </div>
            <h2 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-heading)", marginTop: "4px" }}>
              {t.cascadeTitle}
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "8px" }}>
              {t.cascadeSubtitle}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {[
              { step: "Step 0", title: t.step0Title, desc: t.step0Desc, color: "var(--info)", icon: "📡" },
              { step: "Step 1", title: t.step1Title, desc: t.step1Desc, color: "var(--success)", icon: "🌐" },
              { step: "Step 2", title: t.step2Title, desc: t.step2Desc, color: "var(--warning)", icon: "📱" },
              { step: "Step 3", title: t.step3Title, desc: t.step3Desc, color: "var(--danger)", icon: "📶" },
            ].map((s, i) => (
              <div key={i} className="gov-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <span style={{
                    fontSize: "12px", fontWeight: "800", padding: "3px 10px",
                    borderRadius: "var(--radius-full)", background: `${s.color}20`, color: s.color,
                  }}>
                    {s.step}
                  </span>
                  <span style={{ fontSize: "24px" }}>{s.icon}</span>
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Hon'ble PM Quote Section ───────────────────────── */}
        <section style={{
          background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-subtle)", padding: "36px 40px", marginBottom: "48px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "36px", flexWrap: "wrap" }}>
            <div style={{
              width: "100px", height: "100px", borderRadius: "50%",
              background: "linear-gradient(135deg, #ea580c, #f59e0b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "44px", color: "white", flexShrink: 0,
            }}>
              🇮🇳
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "36px", color: "var(--gov-saffron)", lineHeight: "1", fontFamily: "serif" }}>
                “
              </div>
              <blockquote style={{ fontSize: "16px", fontWeight: "500", color: "var(--text-primary)", fontStyle: "italic", lineHeight: "1.6", marginTop: "-12px" }}>
                {t.pmQuote}
              </blockquote>
              <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <strong style={{ fontSize: "14px", color: "var(--text-heading)", display: "block" }}>
                    {t.pmName}
                  </strong>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {t.pmTitle}
                  </span>
                </div>
                <span style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: "500" }}>
                  {t.pmCiting}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Emergency Helplines ────────────────────────────── */}
        <section style={{
          background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)", padding: "24px 28px", marginBottom: "48px",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px",
        }}>
          <div>
            <div style={{ fontSize: "12px", color: "var(--danger)", fontWeight: "700", textTransform: "uppercase" }}>
              {t.helplineDesc}
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginTop: "2px" }}>
              {t.helplineTitle}
            </h3>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href="tel:112" style={{
              padding: "10px 20px", borderRadius: "var(--radius-full)",
              background: "var(--danger)", color: "white", textDecoration: "none",
              fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px",
            }}>
              {t.call112}
            </a>
            <a href="tel:1363" style={{
              padding: "10px 20px", borderRadius: "var(--radius-full)",
              background: "var(--accent-primary)", color: "white", textDecoration: "none",
              fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px",
            }}>
              {t.call1363}
            </a>
          </div>
        </section>
      </main>

      <GovFooter />
    </div>
  );
}
