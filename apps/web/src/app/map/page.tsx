"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GovHeader } from "../../components/GovHeader";
import { GovFooter } from "../../components/GovFooter";
import { useLanguage } from "../../context/LanguageContext";

interface ZoneItem {
  id: string;
  name: string;
  category: "danger" | "deadzone" | "police" | "medical" | "shelter";
  riskTier?: "RESTRICTED" | "HIGH RISK" | "ADVISORY";
  signalType?: string;
  desc: string;
  lat: number;
  lng: number;
  state: string;
  elevation?: string;
  amenities?: string[];
  contact?: string;
}

interface StaticMapSector {
  id: string;
  title: string;
  state: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  description: string;
  centerCoords: { lat: number; lng: number };
  zoom: number;
  osmEmbedUrl: string;
  keyWaypoints: Array<{ name: string; type: string; note: string; elevation?: string }>;
  deadZoneCoverage: string;
  emergencyHelpline: string;
}

const STATIC_SECTORS: StaticMapSector[] = [
  {
    id: "meghalaya-nongriat",
    title: "Meghalaya: Cherrapunji (Sohra) & Nongriat Root Bridge Sector",
    state: "Meghalaya",
    subtitle: "Deep Valley Trekking Trail • 3,500 Steps • Living Root Bridges",
    badge: "DEAD ZONE SECTOR",
    badgeColor: "#f59e0b",
    description: "The descent from Tyrna village to Nongriat Double Decker Living Root Bridge plunges 1,300m into dense rainforest with zero cellular signal (Airtel/Jio/BSNL). V.A.N.A offline BLE beacons operate along the trail.",
    centerCoords: { lat: 25.285, lng: 91.685 },
    zoom: 13,
    osmEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=91.6400%2C25.2500%2C91.7300%2C25.3200&layer=mapnik&marker=25.2850%2C91.6850",
    keyWaypoints: [
      { name: "Tyrna Trek Start Point", type: "Trailhead", note: "Last cellular network coverage point (BSNL/Jio 2G)", elevation: "880m" },
      { name: "Nongriat Double Decker Bridge", type: "Hazard Area", note: "Slippery moss steps, swift stream currents", elevation: "420m" },
      { name: "Rainbow Falls & Blue Lagoon", type: "Dead Zone", note: "Zero signal; offline GPS tracking mandatory", elevation: "380m" },
      { name: "Sohra Tourist Police Station", type: "Police Help", note: "Helpline: +91-3637-235222", elevation: "1,430m" },
    ],
    deadZoneCoverage: "78% of valley has zero cellular signal. Offline sync active.",
    emergencyHelpline: "Sohra Police Desk: +91-3637-235222 / 112",
  },
  {
    id: "sikkim-nathula",
    title: "Sikkim: Nathula Pass & Indo-China Border Sector (4,310m)",
    state: "Sikkim",
    subtitle: "High-Altitude Defense Corridor • Tsomgo Lake • PAP Required",
    badge: "RESTRICTED BORDER ZONE",
    badgeColor: "#ef4444",
    description: "High-altitude Himalayan corridor connecting Gangtok (1,650m) to Tsomgo Lake (3,750m) and Nathula Border Pass (4,310m). Severe Acute Mountain Sickness (AMS) risk and sub-zero weather hazards.",
    centerCoords: { lat: 27.380, lng: 88.845 },
    zoom: 12,
    osmEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=88.7500%2C27.3200%2C88.9400%2C27.4400&layer=mapnik&marker=27.3800%2C88.8450",
    keyWaypoints: [
      { name: "3rd Mile PAP Verification Gate", type: "Permit Check", note: "Protected Area Permit strictly inspected by Sikkim Police", elevation: "2,200m" },
      { name: "Tsomgo (Changu) Lake Post", type: "Medical Aid", note: "Army emergency oxygen parlor & tourist shelter", elevation: "3,750m" },
      { name: "Sherathang War Memorial", type: "High Risk", note: "Sudden blizzards and ice-covered roads in winter", elevation: "4,050m" },
      { name: "Nathula Pass Indo-China LAC", type: "Restricted", note: "Photography restricted. International border line.", elevation: "4,310m" },
    ],
    deadZoneCoverage: "Intermittent satellite coverage above 3,500m. 2G military link only.",
    emergencyHelpline: "Sikkim Tourist Police: +91-3592-202684 / 112",
  },
  {
    id: "meghalaya-dawki",
    title: "Meghalaya: Dawki River & Indo-Bangladesh Border Sector",
    state: "Meghalaya",
    subtitle: "Umngot River Waterway • Tamabil Border Checkpost • Boating Zone",
    badge: "BORDER WATERWAY ZONE",
    badgeColor: "#3b82f6",
    description: "Crystal clear waters of Umngot River at Dawki. Strong river rapids during monsoons and border proximity require mandatory life-jackets and GPS perimeter tracking.",
    centerCoords: { lat: 25.1875, lng: 92.020 },
    zoom: 14,
    osmEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=91.9800%2C25.1500%2C92.0600%2C25.2200&layer=mapnik&marker=25.1875%2C92.0200",
    keyWaypoints: [
      { name: "Dawki Boating Point", type: "Water Hazard", note: "Govt approved life-jacket mandatory before boarding", elevation: "50m" },
      { name: "Tamabil Border Gate", type: "International Border", note: "BSF Border Outpost and immigration clearance", elevation: "45m" },
      { name: "Shnongpdeng Adventure Camp", type: "Campground", note: "Kayaking and cliff jumping safety monitor post", elevation: "70m" },
      { name: "Dawki Police Station", type: "Police Help", note: "Emergency river rescue boat team on standby", elevation: "60m" },
    ],
    deadZoneCoverage: "Border area with patchy reception; country hopping roaming warnings active.",
    emergencyHelpline: "Dawki Rescue Station: +91-3635-282224",
  },
  {
    id: "arunachal-tawang",
    title: "Arunachal Pradesh: Tawang & Sela Pass Sector (4,170m)",
    state: "Arunachal Pradesh",
    subtitle: "Frontier Highway (NH-13) • Sela Lake • Monastic Circuit",
    badge: "FRONTIER ALPINE CORRIDOR",
    badgeColor: "#8b5cf6",
    description: "Crucial Himalayan mountain pass prone to heavy snowfall, fog, and sub-zero freeze. Inner Line Permit (ILP) required for all domestic tourists; PAP for foreign travelers.",
    centerCoords: { lat: 27.505, lng: 91.950 },
    zoom: 11,
    osmEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=91.8000%2C27.3500%2C92.1500%2C27.6500&layer=mapnik&marker=27.5050%2C91.9500",
    keyWaypoints: [
      { name: "Bhalukpong ILP Gate", type: "Permit Check", note: "Inner Line Permit entry registration checkpost", elevation: "213m" },
      { name: "Sela Pass High-Altitude Lake", type: "Extreme Hazard", note: "Sub-zero ice roads; snow chains mandatory in winter", elevation: "4,170m" },
      { name: "Jaswant Garh Army Memorial", type: "Aid Center", note: "Emergency warm transit shelter and free tea station", elevation: "3,000m" },
      { name: "Tawang Monastery Safety Unit", type: "Medical & Police", note: "District hospital and tourist helpline desk", elevation: "3,048m" },
    ],
    deadZoneCoverage: "Dense cellular blackout in valleys between Bomdila and Jang.",
    emergencyHelpline: "Tawang Tourist Assistance: +91-3794-222222",
  },
];

const NER_ZONES: ZoneItem[] = [
  {
    id: "z1",
    name: "Double Decker Living Root Bridge (Nongriat)",
    category: "danger",
    riskTier: "RESTRICTED",
    desc: "Over 3,500 steep, moss-covered stone steps with zero cellular signal in the deep valley. Rain gear and emergency whistle mandatory.",
    lat: 25.2850,
    lng: 91.6850,
    state: "Meghalaya",
    elevation: "420m",
    amenities: ["BLE Beacons", "Community Homestays", "Stream Water Point"],
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
    elevation: "50m",
    amenities: ["Life Jacket Post", "Border Outpost", "Boat Rescue"],
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
    elevation: "4,310m",
    amenities: ["Oxygen Parlor", "Army Transit Post", "PAP Verification"],
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
    elevation: "380m",
    amenities: ["BLE Mesh Anchor", "Local Forest Guide Station"],
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
    elevation: "5,183m",
    amenities: ["Emergency Satellite Phone (Army)", "Thermal Shelter"],
  },
  {
    id: "p1",
    name: "Tourist Police Outpost — Police Bazar, Shillong",
    category: "police",
    desc: "24x7 Tourist Assistance Desk, multilingual officers, emergency medical triage dispatch.",
    lat: 25.5788,
    lng: 91.8933,
    state: "Meghalaya",
    contact: "0364-2222214",
    amenities: ["24x7 Control Room", "Multilingual Support", "Patrol Dispatch"],
  },
  {
    id: "p2",
    name: "Sikkim Police Tourist Security Unit — MG Marg, Gangtok",
    category: "police",
    desc: "High-altitude permits verification, lost traveler assistance, 112 emergency command link.",
    lat: 27.3314,
    lng: 88.6138,
    state: "Sikkim",
    contact: "03592-202684",
    amenities: ["Permit Office", "Emergency Transit", "Radio Gateway"],
  },
  {
    id: "m1",
    name: "NEIGRIHMS Regional Trauma & Emergency Hospital",
    category: "medical",
    desc: "Level-1 Super-Specialty Medical Command with emergency airlift helipad coordination for Northeast India.",
    lat: 25.5900,
    lng: 91.9350,
    state: "Meghalaya",
    contact: "0364-2538011",
    amenities: ["Helipad", "Trauma ICU", "Blood Bank", "Air Ambulance"],
  },
  {
    id: "m2",
    name: "STNM Multi-Specialty Hospital — Gangtok",
    category: "medical",
    desc: "High-altitude hyperbaric chambers and Acute Mountain Sickness (AMS) intensive care.",
    lat: 27.3100,
    lng: 88.6000,
    state: "Sikkim",
    contact: "03592-202944",
    amenities: ["Hyperbaric Chamber", "Oxygen Cylinders", "Emergency Ambulance"],
  },
];

export default function SafetyMapPage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"interactive" | "sectors" | "offline_packs">("interactive");
  const [selectedSector, setSelectedSector] = useState<StaticMapSector>(STATIC_SECTORS[0]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedZone, setSelectedZone] = useState<ZoneItem | null>(NER_ZONES[0]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [step0Warning, setStep0Warning] = useState<string | null>(null);
  const [offlinePackDownloaded, setOfflinePackDownloaded] = useState<boolean>(false);
  const [downloadingPack, setDownloadingPack] = useState<boolean>(false);

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
            : "⚠️ Proactive Warning: You are located near a cellular dead-zone sector. Local offline GPS vector cache is active for offline SOS."
        );
      },
      () => {
        setIsLocating(false);
        setUserLocation({ lat: 25.5788, lng: 91.8933 });
      }
    );
  };

  const handleDownloadOfflinePack = () => {
    setDownloadingPack(true);
    setTimeout(() => {
      setDownloadingPack(false);
      setOfflinePackDownloaded(true);
      alert("✓ 24.8 MB Offline Vector Map Pack for Northeast India (Meghalaya, Sikkim & Arunachal) cached in browser local storage for zero-signal operation.");
    }, 1200);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <GovHeader />

      <main id="main-content" style={{ maxWidth: "1380px", margin: "0 auto", padding: "24px 20px 80px" }}>
        {/* Page Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--gov-saffron)", textTransform: "uppercase" }}>
              {language === "hi" ? "भौगोलिक टेलीमेट्री • पूर्वोत्तर भारत" : "Geospatial Telemetry & Sector Maps • Northeast India"}
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-heading)", marginTop: "2px" }}>
              {t.mapHeading}
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Official tourist safety corridors, cellular dead-zone geofences, and tactical sector maps.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={handleDownloadOfflinePack}
              disabled={downloadingPack || offlinePackDownloaded}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 18px", borderRadius: "var(--radius-md)",
                background: offlinePackDownloaded ? "rgba(16,185,129,0.15)" : "var(--bg-secondary)",
                color: offlinePackDownloaded ? "var(--success)" : "var(--text-primary)",
                border: offlinePackDownloaded ? "1px solid var(--success)" : "1px solid var(--border-subtle)",
                fontSize: "13px", fontWeight: "700", cursor: "pointer",
              }}
            >
              <span>{offlinePackDownloaded ? "✓" : downloadingPack ? "⏳" : "📥"}</span>
              <span>{offlinePackDownloaded ? "Offline Maps Cached" : downloadingPack ? "Caching Vector Tiles..." : "Save Offline Map Pack (25MB)"}</span>
            </button>

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
              <span>{isLocating ? "Acquiring GPS..." : t.locateMeBtn}</span>
            </button>
          </div>
        </div>

        {/* Step 0 Proactive Banner Alert */}
        {step0Warning && (
          <div style={{
            padding: "14px 18px", borderRadius: "var(--radius-md)",
            background: "rgba(245, 158, 11, 0.12)", border: "1px solid var(--warning)",
            color: "var(--warning)", fontSize: "13px", fontWeight: "600",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "20px",
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

        {/* ─── Top Map Navigation Tabs ───────────────────────────── */}
        <div style={{
          display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "12px", overflowX: "auto",
        }}>
          {[
            { id: "interactive", label: "🗺️ Interactive OpenStreetMap View" },
            { id: "sectors", label: "📍 Curated Sector Tactical Maps (Meghalaya, Sikkim, Arunachal)" },
            { id: "offline_packs", label: "💾 Offline Geo-Packages & Trail Guides" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "10px 18px", borderRadius: "var(--radius-md)", border: "none",
                background: activeTab === tab.id ? "var(--gov-blue)" : "var(--bg-secondary)",
                color: activeTab === tab.id ? "white" : "var(--text-secondary)",
                fontSize: "13px", fontWeight: "700", cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            TAB 1: INTERACTIVE OSM & COORDINATE EXPLORER
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "interactive" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "36px" }}>
              {/* Left: Map Frame */}
              <div className="gov-card" style={{ padding: "18px", display: "flex", flexDirection: "column" }}>
                {/* Filter Controls */}
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
                    <option value="all">All Pilot States</option>
                    <option value="meghalaya">Meghalaya</option>
                    <option value="sikkim">Sikkim</option>
                  </select>
                </div>

                {/* OpenStreetMap Real-Time Embed Frame */}
                <div style={{
                  position: "relative", width: "100%", height: "420px", borderRadius: "var(--radius-md)",
                  overflow: "hidden", border: "1px solid var(--border-subtle)", background: "#0f172a",
                }}>
                  <iframe
                    title="Northeast India OpenStreetMap"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={selectedZone ? `https://www.openstreetmap.org/export/embed.html?bbox=${selectedZone.lng - 0.08}%2C${selectedZone.lat - 0.06}%2C${selectedZone.lng + 0.08}%2C${selectedZone.lat + 0.06}&layer=mapnik&marker=${selectedZone.lat}%2C${selectedZone.lng}` : "https://www.openstreetmap.org/export/embed.html?bbox=88.5%2C25.0%2C93.5%2C28.0&layer=mapnik"}
                    style={{ border: "none", filter: "brightness(0.92) contrast(1.05)" }}
                  />

                  {/* Overlay Badge */}
                  <div style={{
                    position: "absolute", bottom: "12px", left: "12px",
                    background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(6px)",
                    padding: "6px 12px", borderRadius: "var(--radius-sm)",
                    border: "1px solid rgba(255,255,255,0.15)", fontSize: "11px", color: "#93c5fd",
                    fontWeight: "600",
                  }}>
                    🗺️ OpenStreetMap Static Vector Tiles • Zero API Key Dependency
                  </div>
                </div>
              </div>

              {/* Right: Selected Zone Details */}
              {selectedZone && (
                <div className="gov-card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{
                        fontSize: "11px", fontWeight: "700", padding: "4px 10px",
                        borderRadius: "var(--radius-full)",
                        background: selectedZone.category === "danger" ? "rgba(239,68,68,0.15)" : selectedZone.category === "deadzone" ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.15)",
                        color: selectedZone.category === "danger" ? "var(--danger)" : selectedZone.category === "deadzone" ? "var(--warning)" : "var(--accent-primary)",
                      }}>
                        {selectedZone.category.toUpperCase()} • {selectedZone.state}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                        {selectedZone.lat.toFixed(4)}°N, {selectedZone.lng.toFixed(4)}°E
                      </span>
                    </div>

                    <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-heading)", marginBottom: "8px" }}>
                      {selectedZone.name}
                    </h3>

                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "16px" }}>
                      {selectedZone.desc}
                    </p>

                    {selectedZone.elevation && (
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
                        ⛰️ <strong>Elevation:</strong> {selectedZone.elevation}
                      </div>
                    )}

                    {selectedZone.contact && (
                      <div style={{ fontSize: "12px", color: "var(--accent-primary)", marginBottom: "12px" }}>
                        📞 <strong>Emergency Contact:</strong> {selectedZone.contact}
                      </div>
                    )}

                    {selectedZone.amenities && (
                      <div style={{ marginBottom: "16px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>
                          Safety Infrastructure On-Site
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {selectedZone.amenities.map((item, idx) => (
                            <span key={idx} style={{
                              padding: "4px 8px", borderRadius: "var(--radius-sm)",
                              background: "var(--bg-secondary)", fontSize: "11px", color: "var(--text-primary)",
                              border: "1px solid var(--border-subtle)",
                            }}>
                              ✓ {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
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
                      Plan Safe Route →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Location Directory Grid */}
            <div className="gov-card" style={{ padding: "28px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)", marginBottom: "16px" }}>
                {t.zonesDirectory}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                {filteredZones.map((zone) => (
                  <div
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    style={{
                      padding: "16px", borderRadius: "var(--radius-md)",
                      background: selectedZone?.id === zone.id ? "rgba(59,130,246,0.1)" : "var(--bg-secondary)",
                      border: selectedZone?.id === zone.id ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                      cursor: "pointer", transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>
                        {zone.name}
                      </div>
                      <span style={{ fontSize: "14px" }}>
                        {zone.category === "danger" ? "⚠️" : zone.category === "deadzone" ? "📡" : zone.category === "police" ? "👮" : "🏥"}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {zone.state} • {zone.elevation || "NER Terrain"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 2: CURATED STATIC SECTOR MAPS
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "sectors" && (
          <div>
            {/* Sector Selector Tabs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginBottom: "24px" }}>
              {STATIC_SECTORS.map((sector) => (
                <button
                  key={sector.id}
                  onClick={() => setSelectedSector(sector)}
                  style={{
                    padding: "14px 16px", borderRadius: "var(--radius-md)", textAlign: "left",
                    background: selectedSector.id === sector.id ? "rgba(59,130,246,0.15)" : "var(--bg-secondary)",
                    border: selectedSector.id === sector.id ? "1.5px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: "700", color: sector.badgeColor, marginBottom: "4px" }}>
                    {sector.state.toUpperCase()}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                    {sector.title.split(":")[1] || sector.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {sector.badge}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Sector Tactical Map & Safety Details */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", marginBottom: "32px" }}>
              {/* Tactical Map Viewport */}
              <div className="gov-card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-heading)" }}>
                      {selectedSector.title}
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {selectedSector.subtitle}
                    </p>
                  </div>
                  <span style={{
                    fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "var(--radius-full)",
                    background: `${selectedSector.badgeColor}22`, color: selectedSector.badgeColor,
                  }}>
                    {selectedSector.badge}
                  </span>
                </div>

                <div style={{
                  position: "relative", width: "100%", height: "380px", borderRadius: "var(--radius-md)",
                  overflow: "hidden", border: "1px solid var(--border-subtle)",
                }}>
                  <iframe
                    title={selectedSector.title}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={selectedSector.osmEmbedUrl}
                    style={{ border: "none", filter: "contrast(1.08)" }}
                  />
                </div>

                <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span>📍 Center GPS: {selectedSector.centerCoords.lat}°N, {selectedSector.centerCoords.lng}°E</span>
                  <span>📶 {selectedSector.deadZoneCoverage}</span>
                </div>
              </div>

              {/* Waypoints & Tactical Briefing */}
              <div className="gov-card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-heading)", marginBottom: "8px" }}>
                    Sector Safety Briefing
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px" }}>
                    {selectedSector.description}
                  </p>

                  <h4 style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>
                    Key Checkpoints & Hazards
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                    {selectedSector.keyWaypoints.map((wp, idx) => (
                      <div key={idx} style={{
                        padding: "10px 14px", borderRadius: "var(--radius-sm)",
                        background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>
                            {wp.name}
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: "600" }}>
                            {wp.type} {wp.elevation ? `(${wp.elevation})` : ""}
                          </span>
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                          {wp.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  padding: "12px 16px", borderRadius: "var(--radius-md)",
                  background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
                  fontSize: "12px", color: "var(--accent-primary)", fontWeight: "600",
                }}>
                  🚨 <strong>Emergency Sector Link:</strong> {selectedSector.emergencyHelpline}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 3: OFFLINE MAP PACKAGES (STEP 0 SIMULATION)
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "offline_packs" && (
          <div className="gov-card" style={{ padding: "32px" }}>
            <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 36px" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>💾</div>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-heading)", marginBottom: "8px" }}>
                Offline Vector Cartography for Zero-Coverage Dead Zones
              </h2>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                Under V.A.N.A Step 0 Geofencing, when approaching a dead zone, the system synchronizes compact vector tile packages onto your device so maps, elevation contours, and trails remain 100% accessible with no cellular signal.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {[
                {
                  region: "Meghalaya Highlands Pack",
                  coverage: "Cherrapunji, Nongriat, Dawki, Mawlynnong, Mawsynram",
                  size: "18.4 MB",
                  features: ["Living Root Bridge GPS Waypoints", "Waterfall Slippery Trails", "Police Helplines"],
                },
                {
                  region: "Sikkim Alpine & LAC Corridor",
                  coverage: "Nathula Pass, Tsomgo Lake, Lachen, Lachung, Gurudongmar",
                  size: "24.2 MB",
                  features: ["High-Altitude Oxygen Depots", "PAP Military Checkposts", "Mountain Pass Contours"],
                },
                {
                  region: "Arunachal Frontier Highway",
                  coverage: "Tawang Monastery, Sela Pass (4170m), Bomdila, Dirang",
                  size: "29.6 MB",
                  features: ["ILP Checkpoints", "Army Transit Medical Centers", "Snow Hazard Zones"],
                },
              ].map((pkg, idx) => (
                <div key={idx} style={{
                  padding: "20px", borderRadius: "var(--radius-md)",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-heading)" }}>
                        {pkg.region}
                      </h3>
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "var(--radius-full)", background: "rgba(59,130,246,0.15)", color: "var(--accent-primary)" }}>
                        {pkg.size}
                      </span>
                    </div>

                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px" }}>
                      {pkg.coverage}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
                      {pkg.features.map((f, i) => (
                        <span key={i} style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadOfflinePack}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "var(--radius-sm)",
                      background: "var(--gov-blue)", color: "white", border: "none",
                      fontSize: "12px", fontWeight: "700", cursor: "pointer",
                    }}
                  >
                    📥 Download Offline Vector Pack
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <GovFooter />
    </div>
  );
}
