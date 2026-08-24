"use client";

import { useState } from "react";
import Link from "next/link";
import { GovHeader } from "../../components/GovHeader";
import { GovFooter } from "../../components/GovFooter";
import { useLanguage } from "../../context/LanguageContext";

export default function TripsPage() {
  const { t, language } = useLanguage();
  const [selectedDestination, setSelectedDestination] = useState("Cherrapunji & Living Root Bridges, Meghalaya");
  const [selectedDates, setSelectedDates] = useState("2026-09-10 to 2026-09-15");
  const [groupSize, setGroupSize] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);

  const getTranslatedReport = (dest: string) => {
    if (dest.includes("Sikkim") || dest.includes("Nathula")) {
      return {
        safetyScore: 78,
        hazardAssessment:
          language === "hi"
            ? "नाथुला पास (4,310 मी) की अत्यधिक ऊंचाई पर तीव्र पर्वतीय बीमारी (AMS) का जोखिम है। शून्य से नीचे तापमान और अचानक बर्फबारी की संभावना।"
            : language === "as"
            ? "নাথুলা পাছৰ (৪,৩১০ মি) উচ্চতাত শ্বাস-প্ৰশ্বাসৰ সমস্যা (AMS) হ'ব পাৰে। নিশাৰ তাপমাত্ৰা শূন্যৰ তললৈ নামিব পাৰে।"
            : language === "bn"
            ? "নাথুলা পাসের (৪,৩১০ মি) উচ্চতায় হাই-অল্টিটিউড সিকনেস (AMS) হতে পারে। রাতে হিমাঙ্কের নিচে তাপমাত্রা এবং তুষারপাতের সম্ভাবনা।"
            : "High altitude (4,310m) at Nathula Pass carries moderate risk of Acute Mountain Sickness (AMS). Sub-zero night temperatures and sudden snowfall.",
        weatherAdvisory:
          language === "hi"
            ? "सुबह का मौसम साफ रहेगा; दोपहर बाद कोहरा और ठंड बढ़ेगी। सीमा सड़क संगठन (BRO) द्वारा मार्ग खुला रखा गया है।"
            : language === "as"
            ? "ৰাতিপুৱা বতৰ পৰিষ্কাৰ থাকিব; আবেলি ঘন কুঁৱলী আৰু ঠাণ্ডা হ'ব।"
            : language === "bn"
            ? "সকালে আবহাওয়া পরিষ্কার থাকবে; বিকেলে ঘন কুয়াশা ও শৈত্যপ্রবাহের সম্ভাবনা।"
            : "Clear morning windows; afternoon fog and sub-zero frost expected. BRO road clearance verified.",
        packingChecklist:
          language === "hi"
            ? [
                "भारी थर्मल विंडचीटर और इंसुलेटेड दस्ताने",
                "पोर्टेबल 10L ऑक्सीजन कैनिस्टर",
                "ऊंचाई संबंधी आपातकालीन दवाइयां",
                "संरक्षित क्षेत्र परमिट (PAP) की हार्ड कॉपी",
                "यूवी पोलराइज्ड धूप का चश्मा",
              ]
            : language === "as"
            ? [
                "গৰম উইণ্ডচিটাৰ আৰু গ্লভ্‌ছ",
                "পৰ্টেবল অক্সিজেন চিলিণ্ডাৰ",
                "পাহাৰীয়া উচ্চতাৰ প্ৰয়োজনীয় ঔষধ",
                "সংৰক্ষিত অঞ্চল পাৰ্মিট (PAP)",
                "ৰ'দৰ পৰা ৰক্ষা পোৱা চশমা",
              ]
            : language === "bn"
            ? [
                "ভারী উইন্ডচিটার ও গ্লাভস",
                "বহনযোগ্য অক্সিজেন ক্যানিস্টার",
                "উচ্চতাজনিত অসুস্থতার ওষুধ",
                "সংরক্ষিত এলাকা পারমিটের (PAP) কপি",
                "ইউভি সানগ্লাস",
              ]
            : [
                "Heavy thermal windcheater & insulated gloves",
                "Portable 10L oxygen canister",
                "Acetazolamide / AMS emergency meds",
                "Physical copy of Protected Area Permit (PAP)",
                "High-UV polarized sunglasses",
              ],
        papStatus:
          language === "hi"
            ? "संरक्षित क्षेत्र परमिट (PAP) अनिवार्य (48 घंटे पूर्व आवेदन करें)"
            : language === "as"
            ? "সংৰক্ষিত অঞ্চল পাৰ্মিট (PAP) বাধ্যতামূলক"
            : language === "bn"
            ? "সংরক্ষিত এলাকা পারমিট (PAP) বাধ্যতামূলক"
            : "Protected Area Permit (PAP) Strictly Required (Apply 48h in advance)",
      };
    }

    return {
      safetyScore: 88,
      hazardAssessment:
        language === "hi"
          ? "नोंग्रीयत 3,500 सीढ़ियों के उतरने वाले मार्ग पर मानसून की बारिश से फिसलन भरी चूना पत्थर की सीढ़ियां हैं। उमशियांग रूट ब्रिज पर स्थानीय गाइड का ध्यान रखना आवश्यक है।"
          : language === "as"
          ? "নংৰীয়াত ৩,৫০০ চিৰিৰ বাটত বৰষুণৰ ফলত পিচল শিলৰ পৰা সাৱধান হওক। স্থানীয় নিৰ্দেশকৰ সহায় লোৱা উচিত।"
          : language === "bn"
          ? "নংরিয়াত ৩,৫০০ সিঁড়ির ট্রেইলে বর্ষার কারণে পাথর অত্যন্ত পিচ্ছিল। স্থানীয় গাইড সাথে রাখা বাঞ্ছনীয়।"
          : "Monsoon rainfall causes slippery limestone steps on the 3,500-step Nongriat descent. River crossing at Umshiang double-decker requires local guide vigilance.",
      weatherAdvisory:
        language === "hi"
          ? "भारी वर्षा (180 मिमी अनुमानित)। वाटरप्रूफ रेनकोट और आपातकालीन एलईडी टॉर्च अवश्य साथ रखें।"
          : language === "as"
          ? "প্ৰচুৰ বৰষুণ (১৮০ মি.মি)। ৱাটাৰপ্ৰুফ কাপোৰ আৰু জৰুৰীকালীন লাইট লগত ৰাখক।"
          : language === "bn"
          ? "ভারী বৃষ্টিপাত (১৮০ মিমি)। ওয়াটারপ্রুফ পোশাক এবং ইমার্জেন্সি টর্চ সাথে রাখুন।"
          : "High precipitation (180mm expected). Carry high-grade waterproof gear and emergency LED flashlights.",
      packingChecklist:
        language === "hi"
          ? [
              "मजबूत ग्रिप वाले ट्रैकिंग जूते",
              "कॉम्पैक्ट ऑफलाइन बैटरी पावरबैंक (10,000+ mAh)",
              "पानी शुद्धीकरण की गोलियां",
              "आपातकालीन सीटी और वाटरप्रूफ पोंचो",
              "वाना सुरक्षित डिजिटल आईडी व ऑफलाइन मैप",
            ]
          : language === "as"
          ? [
              "পিচল ৰোধক ট্ৰেকিং জোতা",
              "পাৱাৰবেংক (১০,০০০+ mAh)",
              "পানী বিশুদ্ধকৰণ টেবলেট",
              "জৰুৰীকালীন হুইছেল আৰু ৰেইনকোট",
              "ভানা অফলাইন ডিজিটেল ID আৰু মানচিত্ৰ",
            ]
          : language === "bn"
          ? [
              "গ্রিপযুক্ত ট্রেকিং জুতো",
              "পাওয়ারব্যাংক (১০,০০০+ mAh)",
              "পানি বিশুদ্ধকরণ ট্যাবলেট",
              "ইমার্জেন্সি বাঁশি ও রেইনকোট",
              "ভানা অফলাইন ডিজিটাল আইডি ও ম্যাপ",
            ]
          : [
              "High-traction trekking shoes with deep rubber lugs",
              "Compact offline battery powerbank (10,000+ mAh)",
              "Hydration tablets & sealed water purification straws",
              "Emergency whistle & waterproof poncho",
              "V.A.N.A Pre-cached Digital ID & Trail Map",
            ],
      papStatus:
        language === "hi"
          ? "घरेलू पर्यटकों के लिए आवश्यक नहीं / इनर लाइन पंजीकरण अनुशंसित"
          : language === "as"
          ? "স্বদেশী পৰ্যটকৰ বাবে প্ৰয়োজন নাই"
          : language === "bn"
          ? "দেশীয় পর্যটকদের জন্য প্রয়োজন নেই"
          : "Not Required (Domestic Tourist) / Inner Line Registration Recommended",
    };
  };

  const [aiReport, setAiReport] = useState<any>(getTranslatedReport(selectedDestination));

  const handleGenerateAdvisory = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setAiReport(getTranslatedReport(selectedDestination));
    }, 1000);
  };

  // Re-sync when language changes
  const activeReport = getTranslatedReport(selectedDestination);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <GovHeader />

      <main id="main-content" style={{ maxWidth: "1080px", margin: "0 auto", padding: "32px 20px 80px" }}>
        {/* Page Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--gov-saffron)", textTransform: "uppercase" }}>
            {language === "hi" ? "एआई सुरक्षा सलाहकार" : language === "as" ? "AI সুৰক্ষা নিৰ্দেশনা" : language === "bn" ? "AI নিরাপত্তা উপদেষ্টা" : "AI Travel Risk Advisory"}
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-heading)", marginTop: "2px" }}>
            {t.tripsHeading}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {t.tripsSubheading}
          </p>
        </div>

        {/* Input Form Card */}
        <div className="gov-card" style={{ padding: "28px", marginBottom: "32px" }}>
          <form onSubmit={handleGenerateAdvisory} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                {t.destinationLabel}
              </label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                style={{
                  width: "100%", padding: "10px", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                  color: "var(--text-primary)", fontSize: "13px", outline: "none",
                }}
              >
                <option value="Cherrapunji & Living Root Bridges, Meghalaya">Cherrapunji & Living Root Bridges, Meghalaya</option>
                <option value="Dawki & Shnongpdeng River, Meghalaya">Dawki & Shnongpdeng River, Meghalaya</option>
                <option value="Nathula Pass & Tsomgo Lake, East Sikkim">Nathula Pass & Tsomgo Lake, East Sikkim</option>
                <option value="Gurudongmar & North Sikkim High Plateau">Gurudongmar & North Sikkim High Plateau</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                {t.datesLabel}
              </label>
              <input
                type="text"
                value={selectedDates}
                onChange={(e) => setSelectedDates(e.target.value)}
                style={{
                  width: "100%", padding: "10px", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                  color: "var(--text-primary)", fontSize: "13px", outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                {t.groupSizeLabel}
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                style={{
                  width: "100%", padding: "10px", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                  color: "var(--text-primary)", fontSize: "13px", outline: "none",
                }}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isGenerating}
                style={{
                  width: "100%", padding: "12px", borderRadius: "var(--radius-md)",
                  background: "var(--gov-blue)", color: "white", border: "none",
                  fontSize: "13px", fontWeight: "700", cursor: isGenerating ? "wait" : "pointer",
                }}
              >
                {isGenerating ? (language === "hi" ? "सलाह तैयार हो रही है..." : "Generating Risk Model...") : t.generateAdvisoryBtn}
              </button>
            </div>
          </form>
        </div>

        {/* AI Advisory Report Output */}
        <div className="gov-card" style={{ padding: "32px", borderTop: "4px solid var(--accent-primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--gov-saffron)", textTransform: "uppercase" }}>
                {language === "hi" ? "आधिकारिक यात्रा रिपोर्ट" : language === "as" ? "চৰকাৰী ভ্ৰমণ নিৰ্দেশনা" : language === "bn" ? "সরকারি ভ্রমণ নির্দেশিকা" : "Generated Safety Dossier"}
              </span>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-heading)", marginTop: "2px" }}>
                {selectedDestination}
              </h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>{t.safetyScoreLabel}</div>
                <div style={{ fontSize: "24px", fontWeight: "900", color: "var(--success)" }}>{activeReport.safetyScore} / 100</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "28px" }}>
            <div style={{ padding: "18px", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
                {t.terrainHazardTitle}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {activeReport.hazardAssessment}
              </p>
            </div>

            <div style={{ padding: "18px", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
                {t.weatherAdvisoryTitle}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {activeReport.weatherAdvisory}
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "12px" }}>
              {t.packingGearTitle}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
              {activeReport.packingChecklist.map((item: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
                  <span style={{ color: "var(--success)" }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            padding: "14px", borderRadius: "var(--radius-md)",
            background: "rgba(59,130,246,0.1)", border: "1px solid var(--accent-primary)",
            fontSize: "13px", color: "var(--accent-primary)", fontWeight: "600",
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px",
          }}>
            <span><strong>{t.permitStatusTitle}</strong> {activeReport.papStatus}</span>
            <Link href="/kyc" style={{ color: "var(--accent-primary)", textDecoration: "underline", fontSize: "12px" }}>
              {t.tabPassport} →
            </Link>
          </div>
        </div>
      </main>

      <GovFooter />
    </div>
  );
}
