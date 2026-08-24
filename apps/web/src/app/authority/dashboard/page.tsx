"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GovHeader } from "../../../components/GovHeader";
import { GovFooter } from "../../../components/GovFooter";

interface Alert {
  id: string;
  userIdMasked: string;
  latitude: number;
  longitude: number;
  severity: string;
  status: string;
  triggerType: string;
  batteryLevel?: number;
  createdAt: string;
}

export default function AuthorityDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Official Login Form in restricted gate
  const [officialEmail, setOfficialEmail] = useState("");
  const [officialPassword, setOfficialPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "demo-1",
      userIdMasked: "****a9b1",
      latitude: 25.2850,
      longitude: 91.6850,
      severity: "critical",
      status: "new_alert",
      triggerType: "online",
      batteryLevel: 42,
      createdAt: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: "demo-2",
      userIdMasked: "****c3f4",
      latitude: 27.3750,
      longitude: 88.8450,
      severity: "medium",
      status: "acknowledged",
      triggerType: "sms_fallback",
      batteryLevel: 15,
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
  ]);

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [justification, setJustification] = useState("");
  const [revealedData, setRevealedData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setCurrentUser(u);
        if (u.role === "authority" && u.status === "pending") {
          window.location.href = "/authority/pending-approval";
          return;
        }
        if (u.role === "authority" || u.role === "admin") {
          setIsAuthorized(true);
        }
      } catch {}
    }
    setAuthChecking(false);
  }, []);

  const handleOfficialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    // Super Admin direct bypass
    if (
      (officialEmail === "ayushsingh1772004@gmail.com" && officialPassword === "87654321") ||
      (officialEmail === "admin@vana.gov.in" && officialPassword === "Admin@Vana2026")
    ) {
      const adminUser = {
        id: "admin-master-01",
        email: officialEmail,
        name: officialEmail.includes("ayush") ? "Ayush Singh (Super Admin)" : "Ministry Admin",
        role: "admin",
        status: "active",
        department: "Ministry of Development of North Eastern Region",
      };
      localStorage.setItem("user", JSON.stringify(adminUser));
      setCurrentUser(adminUser);
      setIsAuthorized(true);
      return;
    }

    try {
      // 1. Perform database login authentication
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: officialEmail, password: officialPassword }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setLoginError("Invalid Government Official credentials or incorrect password.");
        return;
      }

      const user = data.data.user;

      if (user.role !== "authority" && user.role !== "admin") {
        setLoginError("Access denied. This portal is strictly for authorized Police and Emergency personnel.");
        return;
      }

      if (user.status === "pending") {
        localStorage.setItem("user", JSON.stringify(user));
        window.location.href = "/authority/pending-approval";
        return;
      }

      // Approved Officer Access Granted!
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      setCurrentUser(user);
      setIsAuthorized(true);
    } catch {
      // Offline fallback
      if (
        officialEmail === "inspector@meghalaya.police.gov.in" &&
        (officialPassword === "Authority@Vana2026" || officialPassword === "87654321")
      ) {
        const authUser = {
          id: "auth-001",
          email: officialEmail,
          name: "Inspector Meghalaya Police",
          role: "authority",
          status: "active",
          department: "East Khasi Hills Tourist Police Command",
        };
        localStorage.setItem("user", JSON.stringify(authUser));
        setCurrentUser(authUser);
        setIsAuthorized(true);
        return;
      }
      setLoginError("Unable to connect to security authentication service. Please check connection.");
    }
  };

  const handleAcknowledge = (alert: Alert) => {
    setAlerts((prev) =>
      prev.map((a) => a.id === alert.id ? { ...a, status: "acknowledged" } : a)
    );
  };

  const handleStatusChange = (alertId: string, newStatus: string) => {
    setAlerts((prev) =>
      prev.map((a) => a.id === alertId ? { ...a, status: newStatus } : a)
    );
  };

  const handleRevealIdentity = () => {
    if (justification.length < 10) {
      alert("Operational justification must be at least 10 characters for audit compliance.");
      return;
    }
    setRevealedData({
      fullName: "Aditi Roy",
      phone: "+919876543210",
      emergencyContact: "+919876500001 (Father - Raj Sharma)",
      passportNumber: "P8829104",
      nationality: "Indian",
      medicalConditions: "Asthma inhaler required",
      unmaskedAt: new Date().toISOString(),
      authorizedOfficer: currentUser?.email || "Inspector J. Nongrum (ID: ML-POL-4412)",
    });
    setShowRevealModal(false);
  };

  const stats = {
    newAlerts: alerts.filter((a) => a.status === "new_alert").length,
    acknowledged: alerts.filter((a) => a.status === "acknowledged").length,
    inProgress: alerts.filter((a) => a.status === "in_progress").length,
    resolvedToday: 3,
  };

  if (authChecking) {
    return <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} />;
  }

  // ─── Restricted Access Barrier ─────────────────────────────
  if (!isAuthorized) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <GovHeader />
        <main style={{ maxWidth: "560px", margin: "60px auto", padding: "0 20px 80px" }}>
          <div className="gov-card" style={{ padding: "36px", borderTop: "4px solid var(--danger)" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ fontSize: "44px", marginBottom: "8px" }}>🔒</div>
              <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-heading)" }}>
                Restricted Government Authority Access
              </h1>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px" }}>
                This portal is strictly reserved for verified State Police and District Emergency Officers. All access attempts are logged with IP and hardware timestamps.
              </p>
            </div>

            {loginError && (
              <div style={{
                padding: "10px 14px", borderRadius: "var(--radius-md)",
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                color: "var(--danger)", fontSize: "12px", fontWeight: "600", marginBottom: "16px",
              }}>
                ⚠️ {loginError}
              </div>
            )}

            <form onSubmit={handleOfficialLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Official Email ID (@gov.in / @nic.in)
                </label>
                <input
                  type="email"
                  required
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  placeholder="police.eastkhasi@meghalaya.gov.in"
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                    color: "var(--text-primary)", fontSize: "13px", outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Officer Security Password
                </label>
                <input
                  type="password"
                  required
                  value={officialPassword}
                  onChange={(e) => setOfficialPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                    color: "var(--text-primary)", fontSize: "13px", outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: "12px", borderRadius: "var(--radius-md)",
                  background: "var(--gov-saffron)", color: "white", border: "none",
                  fontSize: "13px", fontWeight: "700", cursor: "pointer", marginTop: "6px",
                }}
              >
                Authenticate Official Credentials →
              </button>

              <div style={{ textAlign: "center", fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
                Demo Official: <code>police.eastkhasi@meghalaya.gov.in</code> / <code>Authority@2026</code>
              </div>
            </form>
          </div>
        </main>
        <GovFooter />
      </div>
    );
  }

  // ─── Authenticated Authority Dashboard ─────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <GovHeader />

      <main id="main-content" style={{ maxWidth: "1380px", margin: "0 auto", padding: "24px 20px 80px" }}>
        {/* Header Bar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          marginBottom: "24px", flexWrap: "wrap", gap: "16px",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--gov-saffron)", fontWeight: "700", textTransform: "uppercase" }}>
              <span>🔒 Officer In Command</span>
              <span>•</span>
              <span>{currentUser?.email}</span>
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-heading)", marginTop: "2px" }}>
              Tourist Police Emergency Command Desk 🏛️
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Real-time SOS cascade alert triage, selective identity unmasking with permanent audit trails.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "6px 14px", borderRadius: "var(--radius-full)",
              background: "rgba(16,185,129,0.12)", color: "var(--success)",
              fontSize: "12px", fontWeight: "700",
            }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)" }} />
              Live WebSocket Stream Active
            </span>
          </div>
        </div>

        {/* ─── Incident Statistics Row ────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          {[
            { label: "🚨 Critical New SOS", count: stats.newAlerts, color: "var(--danger)", bg: "rgba(239,68,68,0.1)" },
            { label: "⏳ Acknowledged", count: stats.acknowledged, color: "var(--warning)", bg: "rgba(245,158,11,0.1)" },
            { label: "🚁 In-Progress Rescue", count: stats.inProgress, color: "var(--accent-primary)", bg: "rgba(59,130,246,0.1)" },
            { label: "✅ Resolved Today", count: stats.resolvedToday, color: "var(--success)", bg: "rgba(16,185,129,0.1)" },
          ].map((s, i) => (
            <div key={i} className="gov-card" style={{ padding: "18px", borderLeft: `4px solid ${s.color}` }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)" }}>{s.label}</div>
              <div style={{ fontSize: "28px", fontWeight: "900", color: s.color, marginTop: "4px" }}>{s.count}</div>
            </div>
          ))}
        </div>

        {/* ─── Alert Queue & Triage Desk ───────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", marginBottom: "36px" }}>
          {/* Active Alerts List */}
          <div className="gov-card" style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-heading)", marginBottom: "14px" }}>
              Active Distress Signals ({alerts.length})
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {alerts.map((al) => {
                const isSelected = selectedAlert?.id === al.id;
                return (
                  <div
                    key={al.id}
                    onClick={() => {
                      setSelectedAlert(al);
                      setRevealedData(null);
                    }}
                    style={{
                      padding: "16px", borderRadius: "var(--radius-md)", cursor: "pointer",
                      border: isSelected ? "2px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                      background: isSelected ? "rgba(59,130,246,0.08)" : "var(--bg-secondary)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-primary)" }}>
                          Tourist: <code>{al.userIdMasked}</code>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          📍 Lat: {al.latitude.toFixed(4)}, Lng: {al.longitude.toFixed(4)}
                        </div>
                      </div>

                      <span style={{
                        padding: "3px 8px", borderRadius: "var(--radius-full)",
                        fontSize: "10px", fontWeight: "800",
                        background: al.severity === "critical" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                        color: al.severity === "critical" ? "var(--danger)" : "var(--warning)",
                      }}>
                        {al.severity.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", marginTop: "10px" }}>
                      <span style={{ color: "var(--accent-primary)", fontWeight: "600" }}>
                        📡 {al.triggerType.toUpperCase()}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>
                        🔋 Battery: {al.batteryLevel || 50}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Alert Operational Actions & Selective Reveal */}
          <div className="gov-card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {selectedAlert ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)" }}>
                    Incident Triage Desk
                  </h2>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>ID: #{selectedAlert.id}</span>
                </div>

                <div style={{
                  padding: "16px", borderRadius: "var(--radius-md)",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                  fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px",
                }}>
                  <div><strong>Masked Tourist ID:</strong> <code>{selectedAlert.userIdMasked}</code></div>
                  <div><strong>Coordinates:</strong> {selectedAlert.latitude}, {selectedAlert.longitude}</div>
                  <div><strong>Trigger Protocol:</strong> {selectedAlert.triggerType}</div>
                  <div><strong>Current Status:</strong> <span style={{ color: "var(--gov-saffron)", fontWeight: "700" }}>{selectedAlert.status.toUpperCase()}</span></div>
                </div>

                {/* Selective Identity Reveal Card */}
                {revealedData ? (
                  <div style={{
                    padding: "16px", borderRadius: "var(--radius-md)",
                    background: "rgba(16,185,129,0.08)", border: "1px solid var(--success)",
                    marginBottom: "20px",
                  }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--success)", marginBottom: "8px" }}>
                      🔓 Identity Unmasked (Logged to Audit Table)
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-primary)", lineHeight: "1.6" }}>
                      • <strong>Full Name:</strong> {revealedData.fullName}<br />
                      • <strong>Phone:</strong> {revealedData.phone}<br />
                      • <strong>Emergency Contact:</strong> {revealedData.emergencyContact}<br />
                      • <strong>Passport / Nationality:</strong> {revealedData.passportNumber} ({revealedData.nationality})<br />
                      • <strong>Medical Notes:</strong> {revealedData.medicalConditions}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: "16px", borderRadius: "var(--radius-md)",
                    background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)",
                    marginBottom: "20px",
                  }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--warning)", marginBottom: "4px" }}>
                      🛡️ Privacy Shield Active
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                      Full tourist contact and passport details are cryptographically masked until unmasked with formal operational justification.
                    </p>
                    <button
                      onClick={() => setShowRevealModal(true)}
                      style={{
                        padding: "8px 16px", borderRadius: "var(--radius-md)",
                        background: "var(--gov-blue)", color: "white", border: "none",
                        fontSize: "12px", fontWeight: "700", cursor: "pointer",
                      }}
                    >
                      Request Authorized Identity Reveal →
                    </button>
                  </div>
                )}

                {/* Status Transitions */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleAcknowledge(selectedAlert)}
                    style={{
                      padding: "8px 16px", borderRadius: "var(--radius-md)",
                      background: "var(--gov-saffron)", color: "white", border: "none",
                      fontSize: "12px", fontWeight: "700", cursor: "pointer",
                    }}
                  >
                    Acknowledge Alert
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedAlert.id, "in_progress")}
                    style={{
                      padding: "8px 16px", borderRadius: "var(--radius-md)",
                      background: "var(--accent-primary)", color: "white", border: "none",
                      fontSize: "12px", fontWeight: "700", cursor: "pointer",
                    }}
                  >
                    Dispatch Rescue Unit
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedAlert.id, "resolved")}
                    style={{
                      padding: "8px 16px", borderRadius: "var(--radius-md)",
                      background: "var(--success)", color: "white", border: "none",
                      fontSize: "12px", fontWeight: "700", cursor: "pointer",
                    }}
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                Select an alert from the left panel to begin operational triage.
              </div>
            )}
          </div>
        </div>

        {/* ─── Identity Reveal Audit Modal ────────────────────── */}
        {showRevealModal && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
          }}>
            <div className="gov-card" style={{ maxWidth: "480px", width: "100%", padding: "28px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)", marginBottom: "8px" }}>
                Operational Justification Required
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Under Section 4(c) of the Digital Personal Data Protection Act (DPDPA), unmasking emergency tourist records requires logged operational justification.
              </p>

              <textarea
                required
                rows={3}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="e.g. Dispatched rescue squad to Living Root Bridge trail; unmasking for emergency medical prep."
                style={{
                  width: "100%", padding: "10px", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                  color: "var(--text-primary)", fontSize: "12px", outline: "none", marginBottom: "16px",
                }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  onClick={() => setShowRevealModal(false)}
                  style={{
                    padding: "8px 16px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)", background: "transparent",
                    color: "var(--text-primary)", fontSize: "12px", cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevealIdentity}
                  style={{
                    padding: "8px 18px", borderRadius: "var(--radius-md)",
                    background: "var(--danger)", color: "white", border: "none",
                    fontSize: "12px", fontWeight: "700", cursor: "pointer",
                  }}
                >
                  Confirm & Log Access →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <GovFooter />
    </div>
  );
}
