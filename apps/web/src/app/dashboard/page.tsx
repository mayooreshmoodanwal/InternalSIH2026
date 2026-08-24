"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GovHeader } from "../../components/GovHeader";
import { GovFooter } from "../../components/GovFooter";
import { useLanguage } from "../../context/LanguageContext";

export default function TouristDashboard() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        if (parsed.role === "admin") {
          router.push("/admin/dashboard");
          return;
        }
        if (parsed.role === "authority") {
          if (parsed.status === "pending") {
            router.push("/authority/pending-approval");
          } else {
            router.push("/authority/dashboard");
          }
          return;
        }
      } catch {}
    }
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <GovHeader />

      <main id="main-content" style={{ maxWidth: "1380px", margin: "0 auto", padding: "24px 20px 80px" }}>
        {/* Welcome Banner */}
        <div className="gov-card" style={{
          padding: "32px", marginBottom: "32px",
          background: "linear-gradient(135deg, rgba(30,58,138,0.2) 0%, rgba(21,29,48,0.9) 100%)",
          border: "1px solid var(--border-active)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--gov-saffron)", textTransform: "uppercase" }}>
                {language === "hi" ? "सक्रिय पर्यटक सुरक्षा सत्र" : language === "as" ? "সক্ৰিয় পৰ্যটক সুৰক্ষা সত্ৰ" : language === "bn" ? "সক্রিয় পর্যটক সুরক্ষা সেশন" : "Active Tourist Safety Session"}
              </div>
              <h1 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-heading)", marginTop: "2px" }}>
                {t.dashboardWelcome}, {user?.name || user?.email?.split("@")[0] || (language === "hi" ? "यात्री" : language === "as" ? "ভ্ৰমণকাৰী" : language === "bn" ? "যাত্রী" : "Traveler")} 👋
              </h1>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
                {t.dashboardSub}
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <Link href="/sos" style={{
                padding: "12px 24px", borderRadius: "var(--radius-md)",
                background: "var(--danger)", color: "white", textDecoration: "none",
                fontSize: "14px", fontWeight: "700", boxShadow: "0 0 16px rgba(239,68,68,0.4)",
              }}>
                {t.readySOS}
              </Link>
            </div>
          </div>
        </div>

        {/* ─── 3-Column Quick Status Cards ─────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "36px" }}>
          {/* Card 1: Digital ID & KYC */}
          <div className="gov-card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "28px" }}>🛂</span>
                <span style={{
                  fontSize: "11px", padding: "3px 8px", borderRadius: "var(--radius-full)",
                  background: user?.digitalIdRef ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  color: user?.digitalIdRef ? "var(--success)" : "var(--danger)", fontWeight: "700",
                }}>
                  {user?.digitalIdRef ? (language === "hi" ? "सत्यापित ✓" : language === "as" ? "প্ৰমাণিত ✓" : language === "bn" ? "যাচাইকৃত ✓" : "VERIFIED ✓") : (language === "hi" ? "लंबित" : language === "as" ? "বাকী আছে" : language === "bn" ? "অসম্পূর্ণ" : "PENDING")}
                </span>
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                {t.kycCardTitle}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {t.kycCardDesc}
              </p>
            </div>
            <Link href="/kyc" style={{
              marginTop: "16px", fontSize: "13px", fontWeight: "600", color: "var(--accent-primary)",
              textDecoration: "none", display: "flex", alignItems: "center", gap: "4px",
            }}>
              <span>{t.proceed}</span> <span>→</span>
            </Link>
          </div>

          {/* Card 2: Offline Safety Map */}
          <div className="gov-card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "28px" }}>🗺️</span>
                <span style={{
                  fontSize: "11px", padding: "3px 8px", borderRadius: "var(--radius-full)",
                  background: "rgba(59,130,246,0.15)", color: "var(--accent-primary)", fontWeight: "700",
                }}>
                  {language === "hi" ? "मेघालय व सिक्किम" : language === "as" ? "মেঘালয় আৰু ছিকিম" : language === "bn" ? "মেঘালয় ও সিকিম" : "Meghalaya & Sikkim"}
                </span>
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                {t.mapCardTitle}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {t.mapCardDesc}
              </p>
            </div>
            <Link href="/map" style={{
              marginTop: "16px", fontSize: "13px", fontWeight: "600", color: "var(--accent-primary)",
              textDecoration: "none", display: "flex", alignItems: "center", gap: "4px",
            }}>
              <span>{t.proceed}</span> <span>→</span>
            </Link>
          </div>

          {/* Card 3: Anti-Scam Fares */}
          <div className="gov-card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "28px" }}>💰</span>
                <span style={{
                  fontSize: "11px", padding: "3px 8px", borderRadius: "var(--radius-full)",
                  background: "rgba(245,158,11,0.15)", color: "var(--warning)", fontWeight: "700",
                }}>
                  ONDC Live
                </span>
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                {t.faresCardTitle}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {t.faresCardDesc}
              </p>
            </div>
            <Link href="/fares" style={{
              marginTop: "16px", fontSize: "13px", fontWeight: "600", color: "var(--accent-primary)",
              textDecoration: "none", display: "flex", alignItems: "center", gap: "4px",
            }}>
              <span>{t.proceed}</span> <span>→</span>
            </Link>
          </div>
        </div>

        {/* ─── 4-Step Safety Cascade Checklist ─────────────────── */}
        <div className="gov-card" style={{ padding: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)", marginBottom: "16px" }}>
            {t.cascadeChecklist}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "16px", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--info)", marginBottom: "4px" }}>
                {t.step0Title}
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {t.step0Desc}
              </p>
            </div>

            <div style={{ padding: "16px", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--success)", marginBottom: "4px" }}>
                {t.step1Title}
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {t.step1Desc}
              </p>
            </div>

            <div style={{ padding: "16px", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--warning)", marginBottom: "4px" }}>
                {t.step2Title}
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {t.step2Desc}
              </p>
            </div>

            <div style={{ padding: "16px", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--danger)", marginBottom: "4px" }}>
                {t.step3Title}
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {t.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </main>

      <GovFooter />
    </div>
  );
}
