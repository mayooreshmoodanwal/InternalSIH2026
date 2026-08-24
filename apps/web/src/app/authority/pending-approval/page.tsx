"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GovHeader } from "../../../components/GovHeader";
import { GovFooter } from "../../../components/GovFooter";

export default function AuthorityPendingApprovalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isApproved, setIsApproved] = useState(false);

  const checkStatus = async (email: string) => {
    if (!email) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/check-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (data.data?.user?.status === "active") {
        setIsApproved(true);
        const updated = { ...user, status: "active" };
        localStorage.setItem("user", JSON.stringify(updated));
        setTimeout(() => {
          router.push("/authority/dashboard");
        }, 1500);
      }
    } catch {}
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        if (parsed.status === "active") {
          router.push("/authority/dashboard");
          return;
        }
        checkStatus(parsed.email);
        const interval = setInterval(() => {
          checkStatus(parsed.email);
        }, 3000);
        return () => clearInterval(interval);
      } catch {}
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <GovHeader />

      <main id="main-content" style={{ maxWidth: "680px", margin: "60px auto", padding: "0 20px 80px" }}>
        <div className="gov-card" style={{ padding: "40px", textAlign: "center", borderTop: "4px solid var(--warning)" }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>{isApproved ? "✅" : "⏳"}</div>

          <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--gov-saffron)", textTransform: "uppercase", letterSpacing: "1px" }}>
            State Police & Forest Authority Verification
          </div>

          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-heading)", marginTop: "4px" }}>
            {isApproved ? "Clearance Granted by Super-Admin!" : "Application Under Ministry Review"}
          </h1>

          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6", marginTop: "12px", maxWidth: "520px", margin: "12px auto 24px" }}>
            {isApproved
              ? "Your official jurisdiction credentials have been verified and access has been authorized. Redirecting to Command Desk..."
              : `Your official authority registration (${user?.email || "Officer ID"}) has been submitted to the Super-Admin dashboard. Access to the Emergency Command Desk will activate automatically once approved.`}
          </p>

          <div style={{
            padding: "20px", borderRadius: "var(--radius-md)",
            background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
            fontSize: "13px", textAlign: "left", display: "flex", flexDirection: "column", gap: "10px",
            marginBottom: "28px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Application ID:</span>
              <span style={{ fontWeight: "700", fontFamily: "monospace", color: "var(--text-primary)" }}>
                #NER-AUTH-{user?.id ? user.id.slice(0, 6) : "881420"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Current Status:</span>
              <span style={{ fontWeight: "700", color: isApproved ? "var(--success)" : "var(--warning)" }}>
                {isApproved ? "APPROVED / ACTIVE ✓" : "PENDING SUPER-ADMIN REVIEW ⏳"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Super-Admin Reviewer:</span>
              <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                ayushsingh1772004@gmail.com
              </span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <button
              onClick={() => checkStatus(user?.email)}
              style={{
                padding: "10px 20px", borderRadius: "var(--radius-md)",
                background: "var(--gov-blue)", color: "white", border: "none",
                fontSize: "13px", fontWeight: "700", cursor: "pointer",
              }}
            >
              🔄 Check Approval Status Now
            </button>
            <Link
              href="/"
              style={{
                padding: "10px 20px", borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)", background: "transparent",
                color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: "600",
              }}
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>

      <GovFooter />
    </div>
  );
}
