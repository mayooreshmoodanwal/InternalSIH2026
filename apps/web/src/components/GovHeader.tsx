"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage, Language } from "../context/LanguageContext";

interface GovHeaderProps {
  currentRole?: string;
}

export function GovHeader({ currentRole }: GovHeaderProps) {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check saved theme
    const savedTheme = localStorage.getItem("vana-theme") as "light" | "dark" || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Check logged in user
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("vana-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const adjustFontSize = (delta: number) => {
    if (delta === 0) {
      setFontSizeMultiplier(1);
      document.documentElement.style.fontSize = "16px";
    } else {
      setFontSizeMultiplier((prev) => {
        const next = Math.min(1.2, Math.max(0.85, prev + delta));
        document.documentElement.style.fontSize = `${next * 16}px`;
        return next;
      });
    }
  };

  const getNavLinks = () => {
    if (user?.role === "admin") {
      return [
        { label: "🏛️ Admin Desk", href: "/admin/dashboard" },
        { label: "👮 Authority Approvals", href: "/admin/dashboard" },
        { label: "🎒 Tourist Registry", href: "/admin/dashboard" },
        { label: "🗺️ Safety Map", href: "/map" },
        { label: "💰 Regional Tariffs", href: "/fares" },
        { label: "🚨 Emergency SOS Gateway", href: "/sos" },
      ];
    }
    if (user?.role === "authority") {
      return [
        { label: "🚨 Police Command Desk", href: "/authority/dashboard" },
        { label: "🗺️ Tactical Safety Map", href: "/map" },
        { label: "💰 ONDC Mobility Desk", href: "/fares" },
        { label: "👤 Officer Profile", href: "/authority/dashboard" },
      ];
    }
    return [
      { label: t.home, href: "/" },
      { label: t.touristHub, href: "/dashboard" },
      { label: t.sosProtocol, href: "/sos" },
      { label: t.safetyMap, href: "/map" },
      { label: t.fairPrices, href: "/fares" },
      { label: t.tripsGuide, href: "/trips" },
      { label: t.digitalId, href: "/kyc" },
      { label: t.profile, href: "/profile" },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header style={{ position: "relative", zIndex: 100 }}>
      {/* ─── Top Tricolor National Stripe ─────────────────── */}
      <div className="tricolor-stripe" />

      {/* ─── Top Accessibility & Government Attribution Bar ─── */}
      <div style={{
        background: "var(--gov-blue-dark)", color: "#e2e8f0", padding: "6px 24px",
        fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="#main-content" style={{ color: "#93c5fd", textDecoration: "none", fontWeight: "600" }}>
            {t.skipToContent}
          </a>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            🏛️ <strong>{t.govIndia}</strong>
          </span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ color: "#cbd5e1" }}>
            {t.ministryAttribution}
          </span>
        </div>

        {/* Accessibility Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Font Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              onClick={() => adjustFontSize(-0.05)}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", padding: "2px 6px", borderRadius: "3px", cursor: "pointer", fontSize: "11px" }}
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => adjustFontSize(0)}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", padding: "2px 6px", borderRadius: "3px", cursor: "pointer", fontSize: "11px", fontWeight: "bold" }}
              title="Reset Font Size"
            >
              A
            </button>
            <button
              onClick={() => adjustFontSize(0.05)}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", padding: "2px 6px", borderRadius: "3px", cursor: "pointer", fontSize: "11px" }}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          <span style={{ opacity: 0.4 }}>|</span>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
              color: "white", padding: "3px 10px", borderRadius: "var(--radius-full)",
              cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px",
            }}
          >
            {theme === "dark" ? t.lightMode : t.darkMode}
          </button>

          <span style={{ opacity: 0.4 }}>|</span>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            style={{
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
              color: "white", padding: "2px 8px", borderRadius: "4px", fontSize: "11px",
              cursor: "pointer", outline: "none",
            }}
          >
            <option value="en" style={{ color: "#000" }}>English (English)</option>
            <option value="hi" style={{ color: "#000" }}>हिन्दी (Hindi)</option>
            <option value="as" style={{ color: "#000" }}>অসমীয়া (Assamese)</option>
            <option value="bn" style={{ color: "#000" }}>বাংলা (Bengali)</option>
          </select>
        </div>
      </div>

      {/* ─── Main Branding Header ─────────────────────────────── */}
      <div style={{
        background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)",
        padding: "14px 24px",
      }}>
        <div style={{
          maxWidth: "1380px", margin: "0 auto", display: "flex",
          justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px",
        }}>
          {/* Logo & Title */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "10px",
              background: "linear-gradient(135deg, #f97316 0%, #10b981 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: "900", fontSize: "22px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}>
              V
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--gov-saffron)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {language === "hi" ? "विजिलेंट असिस्टेंस फॉर एनईआर एरियाज" : language === "as" ? "ভিজিলেণ্ট এছিষ্টেন্স ফৰ এন.ই.আৰ এৰিয়াজ" : language === "bn" ? "ভিজিলেন্ট অ্যাসিস্ট্যান্স ফর এন.ই.আর এরিয়াজ" : "Vigilant Assistance for NER Areas"}
              </div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)", lineHeight: "1.2", letterSpacing: "-0.3px" }}>
                V.A.N.A — {language === "hi" ? "पूर्वोत्तर पर्यटक सुरक्षा पोर्टल" : language === "as" ? "উত্তৰ-পূৰ্বাঞ্চল পৰ্যটক সুৰক্ষা প'ৰ্টেল" : language === "bn" ? "উত্তর-পূর্ব পর্যটন সুরক্ষা পোর্টাল" : "Vigilant Assistance for NER Areas"}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
                Smart Tourist Safety Portal • Pilot: Meghalaya & Sikkim
              </div>
            </div>
          </Link>

          {/* Quick Emergency Button & User Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/sos" style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "9px 16px", borderRadius: "var(--radius-md)",
              background: "radial-gradient(circle, #ef4444, #dc2626)",
              color: "white", textDecoration: "none", fontSize: "13px", fontWeight: "700",
              boxShadow: "0 0 14px rgba(239, 68, 68, 0.4)",
            }}>
              <span style={{ fontSize: "14px" }}>🚨</span>
              <span>{t.emergencySOS}</span>
            </Link>

            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link
                  href={
                    user.role === "admin"
                      ? "/admin/dashboard"
                      : user.role === "authority"
                      ? user.status === "pending"
                        ? "/authority/pending-approval"
                        : "/authority/dashboard"
                      : "/profile"
                  }
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "6px 14px", borderRadius: "var(--radius-full)",
                    background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)", textDecoration: "none", fontSize: "13px", fontWeight: "600",
                  }}
                >
                  <div style={{
                    width: "26px", height: "26px", borderRadius: "50%",
                    background: user.role === "admin" ? "var(--gov-saffron)" : "var(--accent-gradient)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "white",
                    fontSize: "12px", fontWeight: "bold",
                  }}>
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span>{user.name || user.email?.split("@")[0]}</span>
                </Link>

                <button
                  onClick={() => {
                    localStorage.removeItem("user");
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    window.location.href = "/";
                  }}
                  style={{
                    padding: "6px 12px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)", background: "transparent",
                    color: "var(--text-muted)", fontSize: "12px", cursor: "pointer",
                  }}
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <Link href="/login" style={{
                  padding: "9px 16px", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)", background: "var(--bg-card)",
                  color: "var(--text-primary)", textDecoration: "none", fontSize: "13px", fontWeight: "600",
                }}>
                  {t.signIn}
                </Link>
                <Link href="/register" style={{
                  padding: "9px 16px", borderRadius: "var(--radius-md)",
                  background: "var(--accent-gradient)", color: "white",
                  textDecoration: "none", fontSize: "13px", fontWeight: "600",
                }}>
                  {t.register}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Sticky Main Navigation Bar ───────────────────────── */}
      <nav style={{
        background: "var(--gov-blue)", color: "white", padding: "0 24px",
        position: "sticky", top: 0, zIndex: 40, boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}>
        <div style={{
          maxWidth: "1380px", margin: "0 auto", display: "flex",
          alignItems: "center", overflowX: "auto", whiteSpace: "nowrap", gap: "2px",
        }}>
          {navLinks.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={idx}
                href={item.href}
                style={{
                  display: "inline-block", padding: "12px 16px", color: "white",
                  textDecoration: "none", fontSize: "13px", fontWeight: "500",
                  borderBottom: isActive ? "3px solid var(--gov-saffron)" : "3px solid transparent",
                  background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
