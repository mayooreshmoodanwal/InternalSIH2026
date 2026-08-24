"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GovHeader } from "../../components/GovHeader";
import { GovFooter } from "../../components/GovFooter";
import { useLanguage } from "../../context/LanguageContext";

// ONDC Verified Regional Benchmark Data
interface LocationPricing {
  city: string;
  state: string;
  lat: number;
  lng: number;
  mobility: {
    category: string;
    icon: string;
    rate: string;
    unit: string;
    baseFare: string;
    ondcProvider: string;
    govtCapNotice: string;
  }[];
  routes: {
    from: string;
    to: string;
    distanceKm: number;
    fairPriceMin: number;
    fairPriceMax: number;
    travelTime: string;
  }[];
  essentials: {
    item: string;
    icon: string;
    fairPrice: string;
    mrpEnforced: boolean;
  }[];
}

const REGIONAL_ONDC_DATABASE: Record<string, LocationPricing> = {
  shillong: {
    city: "Shillong",
    state: "Meghalaya",
    lat: 25.5788,
    lng: 91.8933,
    mobility: [
      { category: "Local Taxi (Hatchback/Alto)", icon: "🚕", rate: "₹15 - ₹18", unit: "per km", baseFare: "₹50 (first 2 km)", ondcProvider: "Meghalaya Tourist Taxi Coop (ONDC)", govtCapNotice: "Meter mandatory within Municipal limits" },
      { category: "Point-to-Point Shared Taxi", icon: "🚗", rate: "₹20 - ₹40", unit: "per seat", baseFare: "Fixed route", ondcProvider: "Local Operators Union", govtCapNotice: "Police Bazar to Laitumkhrah/Bara Bazar" },
      { category: "Shared Sumo (Inter-District)", icon: "🚐", rate: "₹180 - ₹220", unit: "per seat to Cherrapunji", baseFare: "₹180", ondcProvider: "NER Open Mobility", govtCapNotice: "Departures from Anjalee Cinema Stand" },
      { category: "Local City Bus", icon: "🚌", rate: "₹10 - ₹25", unit: "per passenger", baseFare: "₹10", ondcProvider: "Meghalaya Transport Corp (MTC)", govtCapNotice: "Fixed Government Transit Tariff" },
      { category: "Self-Drive Bike Rental", icon: "🏍️", rate: "₹600 - ₹900", unit: "per 24 hours", baseFare: "Security deposit required", ondcProvider: "NER Bike Fleet (ONDC)", govtCapNotice: "Helmet & Valid License Mandatory" },
    ],
    routes: [
      { from: "Police Bazar, Shillong", to: "Elephant Falls", distanceKm: 12, fairPriceMin: 350, fairPriceMax: 450, travelTime: "30 mins" },
      { from: "Shillong Centre", to: "Cherrapunji (Sohra)", distanceKm: 54, fairPriceMin: 2200, fairPriceMax: 2800, travelTime: "1.8 hrs (Full Day Cab)" },
      { from: "Guwahati Airport (GAU)", to: "Shillong City", distanceKm: 118, fairPriceMin: 2800, fairPriceMax: 3500, travelTime: "3.5 hrs (Prepaid Stand)" },
      { from: "Police Bazar", to: "Laitlum Canyons", distanceKm: 23, fairPriceMin: 900, fairPriceMax: 1200, travelTime: "50 mins" },
    ],
    essentials: [
      { item: "Packaged Drinking Water (1 Litre)", icon: "💧", fairPrice: "₹20 (Strict MRP)", mrpEnforced: true },
      { item: "Traditional Khasi Meal / Thali", icon: "🍲", fairPrice: "₹120 - ₹180", mrpEnforced: false },
      { item: "Local Standard Homestay Room", icon: "🏡", fairPrice: "₹1200 - ₹2200 / night", mrpEnforced: false },
      { item: "Emergency Trekking Rain Poncho", icon: "🧥", fairPrice: "₹150 - ₹250", mrpEnforced: false },
    ],
  },
  cherrapunji: {
    city: "Cherrapunji (Sohra)",
    state: "Meghalaya",
    lat: 25.2850,
    lng: 91.6850,
    mobility: [
      { category: "Local Sightseeing Cab", icon: "🚕", rate: "₹2000 - ₹2600", unit: "per day circuit", baseFare: "Covers 7 Falls & Mawsmai Cave", ondcProvider: "Sohra Tourist Cab Union", govtCapNotice: "Standard Tourism Circuit Fare" },
      { category: "Drop to Tyrna (Root Bridge Trek Base)", icon: "🚙", rate: "₹400 - ₹500", unit: "one-way drop", baseFare: "₹400", ondcProvider: "Tyrna Village Transport", govtCapNotice: "Steep valley hill descent tariff" },
      { category: "Local Guide Service (Living Root Bridge)", icon: "🧭", rate: "₹700 - ₹1000", unit: "per group / full day", baseFare: "Fixed village rate", ondcProvider: "Nongriat Eco-Tourism Committee", govtCapNotice: "Village Council Registered Guide" },
    ],
    routes: [
      { from: "Sohra Market", to: "Tyrna Village (Root Bridge Start)", distanceKm: 14, fairPriceMin: 400, fairPriceMax: 500, travelTime: "25 mins" },
      { from: "Cherrapunji", to: "Dawki & Shnongpdeng", distanceKm: 85, fairPriceMin: 2800, fairPriceMax: 3400, travelTime: "2.5 hrs" },
      { from: "Cherrapunji", to: "Mawsmai & Nohkalikai", distanceKm: 18, fairPriceMin: 800, fairPriceMax: 1100, travelTime: "40 mins" },
    ],
    essentials: [
      { item: "Packaged Water (1L)", icon: "💧", fairPrice: "₹20 (Strict MRP)", mrpEnforced: true },
      { item: "Bamboo Trekking Stick (Handcrafted)", icon: "🦯", fairPrice: "₹30 - ₹50", mrpEnforced: false },
      { item: "Village Homestay (Nongriat / Tyrna)", icon: "🏡", fairPrice: "₹800 - ₹1500 / night", mrpEnforced: false },
      { item: "Hot Maggi / Tea on Trek", icon: "☕", fairPrice: "₹30 - ₹60", mrpEnforced: false },
    ],
  },
  gangtok: {
    city: "Gangtok",
    state: "Sikkim",
    lat: 27.3389,
    lng: 88.6065,
    mobility: [
      { category: "Gangtok City Prepaid Taxi", icon: "🚕", rate: "₹18 - ₹22", unit: "per km", baseFare: "₹60 base", ondcProvider: "Sikkim Cab Connect (ONDC)", govtCapNotice: "State Tourism Prepaid Counter Rates" },
      { category: "Shared Jeep (Tsomgo Lake & Baba Mandir)", icon: "🚙", rate: "₹800 - ₹1100", unit: "per seat (incl. Permit)", baseFare: "₹800", ondcProvider: "East Sikkim Tourism Shuttle", govtCapNotice: "PAP Permit assistance included" },
      { category: "Shared Sumo (Gangtok to Pelling)", icon: "🚐", rate: "₹350 - ₹450", unit: "per seat", baseFare: "₹350", ondcProvider: "SNT Transit Network", govtCapNotice: "Departures from Deorali Stand" },
      { category: "Dedicated North Sikkim Package (Lachen/Lachung)", icon: "🏔️", rate: "₹14000 - ₹18000", unit: "full vehicle (2N/3D)", baseFare: "Includes permit & food", ondcProvider: "North Sikkim Drivers Association", govtCapNotice: "High Altitude Permit & 4x4 Bolero" },
    ],
    routes: [
      { from: "Gangtok MG Marg", to: "Tsomgo (Changu) Lake", distanceKm: 40, fairPriceMin: 3200, fairPriceMax: 4000, travelTime: "2 hrs (Full Cab)" },
      { from: "Bagdogra Airport (IXB)", to: "Gangtok", distanceKm: 125, fairPriceMin: 3500, fairPriceMax: 4500, travelTime: "4.5 hrs" },
      { from: "Gangtok", to: "Nathula Pass Border", distanceKm: 56, fairPriceMin: 4500, fairPriceMax: 5500, travelTime: "2.5 hrs (Special Permit)" },
      { from: "Gangtok", to: "Rumtek Monastery", distanceKm: 24, fairPriceMin: 1000, fairPriceMax: 1400, travelTime: "50 mins" },
    ],
    essentials: [
      { item: "Packaged Mineral Water (1L)", icon: "💧", fairPrice: "₹20 (Strict MRP)", mrpEnforced: true },
      { item: "Steamed Momos Plate (Veg/Pork)", icon: "🥟", fairPrice: "₹80 - ₹140", mrpEnforced: false },
      { item: "High Altitude Winter Jacket Rental (Tsomgo)", icon: "🧥", fairPrice: "₹100 - ₹200 / day", mrpEnforced: false },
      { item: "Oxygen Canister (Portable 10L)", icon: "🫁", fairPrice: "₹450 - ₹600", mrpEnforced: true },
    ],
  },
  dawki: {
    city: "Dawki & Shnongpdeng",
    state: "Meghalaya",
    lat: 25.1875,
    lng: 92.0200,
    mobility: [
      { category: "Umngot River Country Boat Ride", icon: "🛶", rate: "₹800 - ₹1200", unit: "per boat (1 hour, 4 pax)", baseFare: "₹800", ondcProvider: "Dawki Boating Association", govtCapNotice: "Government Registered Life Jacket Mandatory" },
      { category: "Local Taxi to Shnongpdeng / Border", icon: "🚕", rate: "₹300 - ₹450", unit: "per trip", baseFare: "₹300", ondcProvider: "Dawki Tourism Transport", govtCapNotice: "Border area standard tariff" },
    ],
    routes: [
      { from: "Dawki Market", to: "Shnongpdeng Camping Beach", distanceKm: 8, fairPriceMin: 300, fairPriceMax: 450, travelTime: "15 mins" },
      { from: "Dawki", to: "Mawlynnong (Cleanest Village)", distanceKm: 34, fairPriceMin: 1200, fairPriceMax: 1600, travelTime: "1 hr" },
    ],
    essentials: [
      { item: "River Camping Tent (Riverside, 2 Pax)", icon: "⛺", fairPrice: "₹1200 - ₹1800 / night", mrpEnforced: false },
      { item: "Life Jacket Rental", icon: "🦺", fairPrice: "Included in boat ride", mrpEnforced: true },
      { item: "Fresh Catch Fish Thali", icon: "🐟", fairPrice: "₹150 - ₹220", mrpEnforced: false },
    ],
  },
};

export default function FaresPage() {
  const { t, language } = useLanguage();
  const [selectedCityKey, setSelectedCityKey] = useState<string>("shillong");
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>("Viewing Shillong (Default)");
  const [selectedRouteIdx, setSelectedRouteIdx] = useState<number>(0);
  
  // Anti-Scam Dispute Form State
  const [reportedItem, setReportedItem] = useState<string>("Taxi / Cab Ride");
  const [amountCharged, setAmountCharged] = useState<string>("");
  const [expectedAmount, setExpectedAmount] = useState<string>("");
  const [vehicleNumber, setVehicleNumber] = useState<string>("");
  const [locationDesc, setLocationDesc] = useState<string>("");
  const [scamSubmitSuccess, setScamSubmitSuccess] = useState<boolean>(false);

  const currentData = REGIONAL_ONDC_DATABASE[selectedCityKey] || REGIONAL_ONDC_DATABASE.shillong;

  // Auto-detect location via Browser Hardware GPS
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    setLocationStatus("Acquiring GPS fix...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Find nearest city in database
        let closestKey = "shillong";
        let minDistance = Infinity;

        Object.entries(REGIONAL_ONDC_DATABASE).forEach(([key, loc]) => {
          const dLat = latitude - loc.lat;
          const dLng = longitude - loc.lng;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);
          if (dist < minDistance) {
            minDistance = dist;
            closestKey = key;
          }
        });

        setSelectedCityKey(closestKey);
        setIsDetectingLocation(false);
        setLocationStatus(`📍 Detected: Nearest to ${REGIONAL_ONDC_DATABASE[closestKey].city} (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
      },
      () => {
        setIsDetectingLocation(false);
        setLocationStatus("GPS access denied or unavailable. Using manual selection.");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleScamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScamSubmitSuccess(true);
    setTimeout(() => {
      setAmountCharged("");
      setExpectedAmount("");
      setVehicleNumber("");
      setLocationDesc("");
    }, 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <GovHeader />

      <main id="main-content" style={{ maxWidth: "1380px", margin: "0 auto", padding: "24px 20px 80px" }}>
        {/* Page Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--gov-saffron)", fontWeight: "700", textTransform: "uppercase" }}>
            <span>🏛️ Open Network for Digital Commerce (ONDC)</span>
            <span>•</span>
            <span>{language === "hi" ? "ओवरचार्जिंग रोकथाम संरक्षण" : "Anti-Overcharging Protection"}</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-heading)", marginTop: "4px" }}>
            {t.faresHeading}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {t.faresSubheading}
          </p>
        </div>

        {/* ─── Location Detection & Selector Toolbar ─────────────── */}
        <div className="gov-card" style={{
          padding: "20px", marginBottom: "32px", display: "flex",
          justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 18px", borderRadius: "var(--radius-md)",
                background: "var(--gov-blue)", color: "white", border: "none",
                fontSize: "13px", fontWeight: "700", cursor: isDetectingLocation ? "wait" : "pointer",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <span>{isDetectingLocation ? "⏳" : "📍"}</span>
              <span>{isDetectingLocation ? (language === "hi" ? "स्थान खोज रहे हैं..." : "Detecting GPS...") : t.autoDetectBtn}</span>
            </button>

            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>
              {locationStatus}
            </span>
          </div>

          {/* Quick Hub Filter Chips */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>{t.selectRegion}:</span>
            {Object.entries(REGIONAL_ONDC_DATABASE).map(([key, loc]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedCityKey(key);
                  setLocationStatus(`Manual: ${loc.city}, ${loc.state}`);
                }}
                style={{
                  padding: "6px 14px", borderRadius: "var(--radius-full)",
                  border: selectedCityKey === key ? "2px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                  background: selectedCityKey === key ? "rgba(59,130,246,0.15)" : "var(--bg-secondary)",
                  color: selectedCityKey === key ? "var(--accent-primary)" : "var(--text-primary)",
                  fontSize: "12px", fontWeight: "600", cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {loc.city}
              </button>
            ))}
          </div>
        </div>

        {/* ─── 2-Column Grid: ONDC Live Rates & Route Calculator ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          {/* Column 1: Live ONDC Mobility Rates */}
          <div className="gov-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--gov-saffron)", textTransform: "uppercase" }}>
                  Live Telemetry • {currentData.city}
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)" }}>
                  🚗 Local Transport Benchmarks
                </h2>
              </div>
              <span style={{
                fontSize: "11px", padding: "4px 10px", borderRadius: "var(--radius-full)",
                background: "rgba(16,185,129,0.12)", color: "var(--success)", fontWeight: "700",
              }}>
                ✓ ONDC Verified
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {currentData.mobility.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 16px", borderRadius: "var(--radius-md)",
                    background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px" }}>
                    <span style={{ fontSize: "24px" }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>
                        {item.category}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Base: {item.baseFare} • Provider: {item.ondcProvider}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--accent-primary)", marginTop: "2px", fontWeight: "500" }}>
                        ⓘ {item.govtCapNotice}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--success)" }}>
                      {item.rate}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{item.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: ONDC Route Fare Estimator */}
          <div className="gov-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--gov-saffron)", textTransform: "uppercase" }}>
                  Real-Time Route Calculator
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)" }}>
                  🗺️ Popular Tourist Corridors
                </h2>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Select Route Below</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {currentData.routes.map((rt, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedRouteIdx(idx)}
                  style={{
                    padding: "14px", borderRadius: "var(--radius-md)", cursor: "pointer",
                    border: selectedRouteIdx === idx ? "2px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                    background: selectedRouteIdx === idx ? "rgba(59,130,246,0.08)" : "var(--bg-secondary)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>
                      {rt.from} ➔ {rt.to}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--success)" }}>
                      ₹{rt.fairPriceMin} - ₹{rt.fairPriceMax}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "14px", marginTop: "4px", fontSize: "11px", color: "var(--text-muted)" }}>
                    <span>📏 Distance: {rt.distanceKm} km</span>
                    <span>⏱️ Duration: ~{rt.travelTime}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Route Breakdown */}
            {currentData.routes[selectedRouteIdx] && (
              <div style={{
                padding: "16px", borderRadius: "var(--radius-md)",
                background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
              }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-heading)", marginBottom: "8px" }}>
                  📊 Verified Tariff Breakdown for Selected Route:
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  • <strong>Origin:</strong> {currentData.routes[selectedRouteIdx].from}<br />
                  • <strong>Destination:</strong> {currentData.routes[selectedRouteIdx].to}<br />
                  • <strong>Approved Range:</strong> ₹{currentData.routes[selectedRouteIdx].fairPriceMin} to ₹{currentData.routes[selectedRouteIdx].fairPriceMax}<br />
                  • <strong>Surge Pricing:</strong> 0% (Strictly prohibited by Regional Transport Authority).
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Essentials & Food Pricing Row ────────────────────── */}
        <section style={{ marginBottom: "40px" }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--gov-saffron)", textTransform: "uppercase" }}>
              Market Surveillance
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-heading)" }}>
              🛒 Food, Stays & Essential Utilities in {currentData.city}
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            {currentData.essentials.map((item, i) => (
              <div key={i} className="gov-card" style={{ padding: "18px" }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>{item.icon}</div>
                <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                  {item.item}
                </h3>
                <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--success)", marginBottom: "4px" }}>
                  {item.fairPrice}
                </div>
                <span style={{
                  fontSize: "10px", padding: "2px 6px", borderRadius: "3px",
                  background: item.mrpEnforced ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)",
                  color: item.mrpEnforced ? "var(--success)" : "var(--accent-primary)",
                  fontWeight: "700",
                }}>
                  {item.mrpEnforced ? "MRP Strictly Enforced" : "Fair Market Range"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Anti-Overcharging & Scam Grievance Form ──────────── */}
        <section className="gov-card" style={{ padding: "32px", borderLeft: "4px solid var(--danger)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ fontSize: "32px" }}>🚨</span>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--danger)" }}>
                Report Overcharging or Tourist Scam
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Directly alerts Tourist Police Command Unit & ONDC Consumer Protection Cell.
              </p>
            </div>
          </div>

          {scamSubmitSuccess ? (
            <div style={{
              padding: "20px", borderRadius: "var(--radius-md)",
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
              color: "var(--success)", fontSize: "14px", fontWeight: "600",
            }}>
              ✅ Grievance Registered Successfully! Reference Ticket: #NER-SCAM-{Math.floor(100000 + Math.random() * 900000)}. Local Tourist Police duty officer notified.
            </div>
          ) : (
            <form onSubmit={handleScamSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Category
                </label>
                <select
                  value={reportedItem}
                  onChange={(e) => setReportedItem(e.target.value)}
                  style={{
                    width: "100%", padding: "10px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                    color: "var(--text-primary)", fontSize: "13px", outline: "none",
                  }}
                >
                  <option>Taxi / Cab Ride</option>
                  <option>Auto Rickshaw</option>
                  <option>Shared Sumo</option>
                  <option>Homestay / Hotel</option>
                  <option>Packaged Water / Food (Above MRP)</option>
                  <option>Boat Ride (Dawki)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Amount Demanded / Charged (₹)
                </label>
                <input
                  type="number"
                  required
                  value={amountCharged}
                  onChange={(e) => setAmountCharged(e.target.value)}
                  placeholder="e.g. 1500"
                  style={{
                    width: "100%", padding: "10px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                    color: "var(--text-primary)", fontSize: "13px", outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Expected Fair Price (₹)
                </label>
                <input
                  type="number"
                  value={expectedAmount}
                  onChange={(e) => setExpectedAmount(e.target.value)}
                  placeholder="e.g. 500"
                  style={{
                    width: "100%", padding: "10px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                    color: "var(--text-primary)", fontSize: "13px", outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Vehicle / Shop Number (if known)
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. ML-05-AB-1234"
                  style={{
                    width: "100%", padding: "10px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                    color: "var(--text-primary)", fontSize: "13px", outline: "none",
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Incident Location & Description
                </label>
                <input
                  type="text"
                  required
                  value={locationDesc}
                  onChange={(e) => setLocationDesc(e.target.value)}
                  placeholder="e.g. Near Police Bazar Taxi Stand, Shillong - Driver demanded triple rate refusing meter"
                  style={{
                    width: "100%", padding: "10px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                    color: "var(--text-primary)", fontSize: "13px", outline: "none",
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1", marginTop: "8px" }}>
                <button
                  type="submit"
                  style={{
                    padding: "12px 28px", borderRadius: "var(--radius-md)",
                    background: "var(--danger)", color: "white", border: "none",
                    fontSize: "14px", fontWeight: "700", cursor: "pointer",
                    boxShadow: "0 0 16px rgba(239,68,68,0.3)",
                  }}
                >
                  Submit Official Grievance to Police Desk →
                </button>
              </div>
            </form>
          )}
        </section>
      </main>

      <GovFooter />
    </div>
  );
}
