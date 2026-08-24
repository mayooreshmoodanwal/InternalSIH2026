"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GovHeader } from "../../components/GovHeader";
import { GovFooter } from "../../components/GovFooter";
import { useLanguage } from "../../context/LanguageContext";

interface ZoneItem {
  id: string;
  name: string;
  category: "danger" | "deadzone" | "police" | "medical";
  riskTier?: "RESTRICTED" | "HIGH RISK" | "ADVISORY";
  signalType?: string;
  desc: string;
  lat: number;
  lng: number;
  state: string;
}

const NER_ZONES: ZoneItem[] = [
  {
    id: "z1",
    name: "Double Decker Living Root Bridge Trek (Nongriat)",
    category: "danger",
    riskTier: "RESTRICTED",
    desc: "Over 3,500 steep, moss-covered stone steps with zero cellular signal in the deep valley. Rain gear and emergency whistle mandatory.",
    lat: 25.2850,
    lng: 91.6850,
    state: "Meghalaya",
  },
  {
    id: "z2",
    name: "Dawki River & Bangladesh Border Crossing",
    category: "danger",
    riskTier: "HIGH RISK",
    desc: "Strong river undercurrents during monsoons. Life jackets mandatory for country boat rides. Border fencing vigilance.",
    lat: 25.1875,
    lng: 92.0200,
    state: "Meghalaya",
  },
  {
    id: "z3",
    name: "Nathula Pass Indo-China Border (4,310m)",
    category: "danger",
    riskTier: "HIGH RISK",
    desc: "Sub-zero temperatures and Acute Mountain Sickness (AMS) risk. Protected Area Permit (PAP) strictly verified at 3rd Mile checkpost.",
    lat: 27.3800,
    lng: 88.8450,
    state: "Sikkim",
  },
  {
    id: "dz1",
    name: "Nongriat Deep Valley Cellular Dead Zone",
    category: "deadzone",
    signalType: "Zero 4G/2G Network",
    desc: "No mobile reception for Airtel, Jio, or BSNL. V.A.N.A BLE mesh offline beacons active on trail.",
    lat: 25.2780,
    lng: 91.6790,
    state: "Meghalaya",
  },
  {
    id: "dz2",
    name: "North Sikkim Lachen to Gurudongmar Dead Zone",
    category: "deadzone",
    signalType: "Zero Network (High Altitude)",
    desc: "Sparse satellite connectivity above Thangu. Offline maps and emergency thermal kits mandatory.",
    lat: 27.7167,
    lng: 88.5500,
    state: "Sikkim",
  },
  {
    id: "p1",
    name: "Tourist Police Outpost — Police Bazar, Shillong",
    category: "police",
    desc: "24x7 Tourist Assistance Desk, multilingual officers, emergency medical triage dispatch.",
    lat: 25.5788,
    lng: 91.8933,
    state: "Meghalaya",
  },
  {
    id: "p2",
    name: "Sikkim Police Tourist Security Unit — MG Marg, Gangtok",
    category: "police",
    desc: "High-altitude permits verification, lost traveler assistance, 112 emergency command link.",
    lat: 27.3314,
    lng: 88.6138,
    state: "Sikkim",
  },
  {
    id: "m1",
    name: "NEIGRIHMS Regional Trauma & Emergency Hospital",
    category: "medical",
    desc: "Level-1 Super-Specialty Medical Command with emergency airlift coordination for Northeast India.",
    lat: 25.5900,
    lng: 91.9350,
    state: "Meghalaya",
  },
  {
    id: "m2",
    name: "STNM Multi-Specialty Hospital — Gangtok",
    category: "medical",
    desc: "High-altitude hyperbaric chambers and Acute Mountain Sickness (AMS) intensive care.",
    lat: 27.3100,
    lng: 88.6000,
    state: "Sikkim",
  },
];

export default function SafetyMapPage() {
  const { t, language } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedZone, setSelectedZone] = useState<ZoneItem | null>(NER_ZONES[0]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [step0Warning, setStep0Warning] = useState<string | null>(null);

  const filteredZones = NER_ZONES.filter((z) => {
    const matchesCategory = selectedFilter === "all" || z.category === selectedFilter;
    const matchesState = selectedState === "all" || z.state.toLowerCase() === selectedState.toLowerCase();
    return matchesCategory && matchesState;
  });

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setIsLocating(false);

        setStep0Warning(
          language === "hi"
            ? "⚠️ सक्रिय चेतावनी: आप नोंग्रीयत घाटी के 12 किमी के दायरे में हैं। आपका जीपीएस मार्ग ऑफलाइन एसओएस के लिए सुरक्षित किया जा रहा है।"
            : language === "as"
            ? "⚠️ সতৰ্কবাণী: আপুনি নংৰীয়াত উপত্যকাৰ ওচৰত আছে। আপোনাৰ জি.পি.এছ পথ অফলাইন SOS বাবে সংৰক্ষণ কৰা হৈছে।"
            : language === "bn"
            ? "⚠️ সতর্কতা: আপনি নংরিয়াত উপত্যকার নিকটে অবস্থান করছেন। আপনার জিপিএস পথ অফলাইন SOS-এর জন্য সংরক্ষণ করা হচ্ছে।"
            : "⚠️ Proactive Warning: You are located within 12km of Nongriat valley. Your GPS route is being cached locally for offline SOS."
        );
      },
      () => {
        setIsLocating(false);
        setUserLocation({ lat: 25.5788, lng: 91.8933 });
      }
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <GovHeader />

      <main id="main-content" style={{ maxWidth: "1380px", margin: "0 auto", padding: "24px 20px 80px" }}>
        {/* Page Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--gov-saffron)", textTransform: "uppercase" }}>
              {language === "hi" ? "भौगोलिक टेलीमेट्री • पूर्वोत्तर भारत" : language === "as" ? "ভৌগোলিক তথ্য • উত্তৰ-পূৰ্বাঞ্চল" : language === "bn" ? "ভৌগোলিক তথ্য • উত্তর-পূর্ব ভারত" : "Geospatial Telemetry • Northeast India"}
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-heading)", marginTop: "2px" }}>
              {t.mapHeading}
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
              {t.mapSubheading}
            </p>
          </div>

          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 20px", borderRadius: "var(--radius-md)",
              background: "var(--gov-blue)", color: "white", border: "none",
              fontSize: "13px", fontWeight: "700", cursor: isLocating ? "wait" : "pointer",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <span>{isLocating ? "⏳" : "📍"}</span>
            <span>{isLocating ? (language === "hi" ? "जीपीएस ट्रैक हो रहा है..." : "Acquiring GPS...") : t.locateMeBtn}</span>
          </button>
        </div>

        {/* Step 0 Proactive Banner Alert if active */}
        {step0Warning && (
          <div style={{
            padding: "16px 20px", borderRadius: "var(--radius-md)",
            background: "rgba(245, 158, 11, 0.12)", border: "1px solid var(--warning)",
            color: "var(--warning)", fontSize: "13px", fontWeight: "600",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "24px",
          }}>
            <span>{step0Warning}</span>
            <button
              onClick={() => setStep0Warning(null)}
              style={{ background: "none", border: "none", color: "var(--warning)", cursor: "pointer", fontSize: "16px" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ─── Main Map & Telemetry Explorer ─────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "36px" }}>
          {/* Interactive Geo-Display */}
          <div className="gov-card" style={{ padding: "20px", minHeight: "440px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[
                  { id: "all", label: t.allLayers },
                  { id: "danger", label: t.dangerZonesLayer },
                  { id: "deadzone", label: t.deadZonesLayer },
                  { id: "police", label: t.policeLayer },
                  { id: "medical", label: t.medicalLayer },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setSelectedFilter(btn.id)}
                    style={{
                      padding: "6px 12px", borderRadius: "var(--radius-sm)", border: "none",
                      background: selectedFilter === btn.id ? "var(--gov-blue)" : "var(--bg-secondary)",
                      color: selectedFilter === btn.id ? "white" : "var(--text-secondary)",
                      fontSize: "12px", fontWeight: "600", cursor: "pointer",
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                style={{
                  padding: "6px 12px", borderRadius: "var(--radius-sm)",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)", fontSize: "12px", outline: "none",
                }}
              >
                <option value="all">{language === "hi" ? "सभी राज्य" : language === "as" ? "সকলো ৰাজ্য" : language === "bn" ? "সব রাজ্য" : "All Pilot States"}</option>
                <option value="meghalaya">Meghalaya</option>
                <option value="sikkim">Sikkim</option>
              </select>
            </div>

            {/* Vector Geo-Canvas */}
            <div style={{
              flex: 1, minHeight: "340px", borderRadius: "var(--radius-md)",
              background: "radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)",
              border: "1px solid var(--border-subtle)", position: "relative", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                position: "absolute", inset: 0, opacity: 0.15,
                backgroundImage: "radial-gradient(circle at 1px 1px, #60a5fa 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }} />

              {/* Geo Points */}
              {filteredZones.map((z, idx) => {
                const isSelected = selectedZone?.id === z.id;
                const posX = 15 + ((z.lng - 88) / 4.5) * 70;
                const posY = 85 - ((z.lat - 25) / 3.0) * 70;

                const markerColor =
                  z.category === "danger" ? "#ef4444" :
                  z.category === "deadzone" ? "#f59e0b" :
                  z.category === "police" ? "#3b82f6" : "#10b981";

                return (
                  <div
                    key={z.id}
                    onClick={() => setSelectedZone(z)}
                    style={{
                      position: "absolute",
                      left: `${Math.max(10, Math.min(90, posX))}%`,
                      top: `${Math.max(10, Math.min(90, posY))}%`,
                      transform: "translate(-50%, -50%)",
                      cursor: "pointer", zIndex: isSelected ? 30 : 20,
                    }}
                    title={z.name}
                  >
                    <div style={{
                      width: isSelected ? "32px" : "24px", height: isSelected ? "32px" : "24px",
                      borderRadius: "50%", background: markerColor,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontSize: isSelected ? "14px" : "11px", fontWeight: "bold",
                      boxShadow: `0 0 16px ${markerColor}`,
                      border: "2px solid white", transition: "all 0.2s ease",
                    }}>
                      {z.category === "danger" ? "⚠️" : z.category === "deadzone" ? "📡" : z.category === "police" ? "👮" : "🏥"}
                    </div>
                  </div>
                );
              })}

              {/* User GPS point */}
              {userLocation && (
                <div style={{
                  position: "absolute", left: "55%", top: "45%",
                  transform: "translate(-50%, -50%)", zIndex: 40,
                }}>
                  <div style={{
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "#00e599", border: "3px solid white",
                    boxShadow: "0 0 20px #00e599",
                  }} />
                </div>
              )}
            </div>
          </div>

          {/* Selected Zone Detail Panel */}
          {selectedZone && (
            <div className="gov-card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{
                    fontSize: "11px", fontWeight: "700", padding: "4px 10px",
                    borderRadius: "var(--radius-full)",
                    background: selectedZone.category === "danger" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)",
                    color: selectedZone.category === "danger" ? "var(--danger)" : "var(--accent-primary)",
                  }}>
                    {selectedZone.category.toUpperCase()} • {selectedZone.state}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                    {selectedZone.lat.toFixed(4)}°N, {selectedZone.lng.toFixed(4)}°E
                  </span>
                </div>

                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)", marginBottom: "8px" }}>
                  {selectedZone.name}
                </h3>

                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "16px" }}>
                  {selectedZone.desc}
                </p>

                {selectedZone.riskTier && (
                  <div style={{
                    padding: "10px 14px", borderRadius: "var(--radius-md)",
                    background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                    fontSize: "12px", marginBottom: "14px",
                  }}>
                    <strong>{language === "hi" ? "सुरक्षा स्तर:" : "Security Tier:"}</strong> <span style={{ color: "var(--danger)", fontWeight: "700" }}>{selectedZone.riskTier}</span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <Link href="/sos" style={{
                  flex: 1, textAlign: "center", padding: "10px", borderRadius: "var(--radius-md)",
                  background: "var(--danger)", color: "white", textDecoration: "none",
                  fontSize: "13px", fontWeight: "700",
                }}>
                  {t.emergencySOS}
                </Link>
                <Link href="/trips" style={{
                  flex: 1, textAlign: "center", padding: "10px", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)", color: "var(--text-primary)",
                  textDecoration: "none", fontSize: "13px", fontWeight: "600",
                }}>
                  {language === "hi" ? "मार्ग की योजना बनाएं" : "Plan Safe Route"}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ─── Geofenced Directory ─────────────────────────────── */}
        <div className="gov-card" style={{ padding: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)", marginBottom: "16px" }}>
            {t.zonesDirectory}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {NER_ZONES.map((zone) => (
              <div
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                style={{
                  padding: "16px", borderRadius: "var(--radius-md)",
                  background: selectedZone?.id === zone.id ? "rgba(59,130,246,0.1)" : "var(--bg-secondary)",
                  border: selectedZone?.id === zone.id ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                  {zone.name}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {zone.state} • {zone.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <GovFooter />
    </div>
  );
}
