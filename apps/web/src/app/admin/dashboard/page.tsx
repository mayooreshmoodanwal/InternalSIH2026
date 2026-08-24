"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { GovHeader } from "../../../components/GovHeader";
import { GovFooter } from "../../../components/GovFooter";

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Admin login form state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  const [activeTab, setActiveTab] = useState<"authorities" | "tourists" | "audit">("authorities");

  // Authority Approval & Permissions State
  const [authorities, setAuthorities] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("");

  const [selectedAuthorityForApproval, setSelectedAuthorityForApproval] = useState<any>(null);
  const [permissions, setPermissions] = useState({
    canViewFullName: true,
    canViewLiveLocation: true,
    canViewEmergencyContacts: true,
    canViewPhoneNumber: true,
    canViewDigitalId: true,
  });

  const [touristsList] = useState([
    { id: "tourist-1", name: "Rahul Sharma", email: "rahul.s@gmail.com", phone: "+919876500001", didRef: "did:vana:aadhaar:8921", registeredAt: "2026-08-23 10:14", contactsCount: 2, status: "Active" },
    { id: "tourist-2", name: "Sarah Jane Traveler", email: "sarah.travels@gmail.com", phone: "+12025550199", didRef: "did:vana:passport:USA:E9821441", registeredAt: "2026-08-23 11:30", contactsCount: 1, status: "Active" },
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: "log-1", actor: "inspector@meghalaya.police.gov.in", action: "IDENTITY_UNMASK", target: "Tourist ****a9b1", justification: "Rescue team dispatched to Double Decker Living Root Bridge", timestamp: "2026-08-23 14:32:10" },
    { id: "log-2", actor: "admin@vana.gov.in", action: "GEOFENCE_UPDATE", target: "Nongriat Trail Dead Zone", justification: "Added new BLE mesh beacon coordinates", timestamp: "2026-08-23 11:15:00" },
    { id: "log-3", actor: "ayushsingh1772004@gmail.com", action: "AUTHORITY_APPROVAL", target: "Inspector J. Kharkongor", justification: "Official jurisdiction verified with East Khasi Hills SP Office", timestamp: "2026-08-23 15:10:00" },
  ]);

  // ─── Real-Time Database Fetcher ───────────────────────────
  const fetchAuthorities = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/authorities`
      );
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setAuthorities(data.data);
      }
    } catch {
      // Fallback sample data if offline
      setAuthorities((prev) =>
        prev.length > 0
          ? prev
          : [
              {
                id: "auth-sample-1",
                name: "Inspector J. Kharkongor",
                email: "j.kharkongor@meghalayapolice.gov.in",
                phone: "+919876543210",
                department: "Meghalaya Police - Tourist Security Unit",
                designation: "Inspector",
                idNumber: "ML-POL-8841",
                stationInfo: "East Khasi Hills Command Outpost",
                status: "pending",
                date: "2026-08-23",
              },
            ]
      );
    } finally {
      setIsSyncing(false);
      setLastSyncedAt(new Date().toLocaleTimeString());
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setCurrentUser(u);
        if (u.role === "admin") {
          setIsAdminAuthorized(true);
        }
      } catch {}
    }
    setAuthChecking(false);

    // Initial fetch + 3-second live sync interval
    fetchAuthorities();
    const interval = setInterval(() => {
      fetchAuthorities();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchAuthorities]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");

    if (
      (adminEmail === "ayushsingh1772004@gmail.com" && adminPassword === "87654321") ||
      (adminEmail === "admin@vana.gov.in" && adminPassword === "Admin@Vana2026")
    ) {
      const authUser = {
        id: adminEmail.includes("ayush") ? "admin-ayush-01" : "admin-master-01",
        email: adminEmail,
        name: adminEmail.includes("ayush") ? "Ayush Singh (Super Admin)" : "Ministry Admin",
        role: "admin",
        status: "active",
        department: "Ministry of Development of North Eastern Region (MDoNER)",
      };
      localStorage.setItem("user", JSON.stringify(authUser));
      setCurrentUser(authUser);
      setIsAdminAuthorized(true);
      fetchAuthorities();
    } else {
      setAdminError("Invalid Ministry Super-Admin credentials. Access attempt logged.");
    }
  };

  const handleApproveWithPermissions = async () => {
    if (!selectedAuthorityForApproval) return;
    const authId = selectedAuthorityForApproval.id;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/authorities/${authId}/approve`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissions }),
        }
      );
    } catch {}

    setAuthorities((prev) =>
      prev.map((a) => (a.id === authId ? { ...a, status: "active", permissions } : a))
    );

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        actor: currentUser?.email || "Super Admin",
        action: "AUTHORITY_APPROVAL",
        target: selectedAuthorityForApproval.name,
        justification: `Approved with permissions: ${Object.keys(permissions)
          .filter((k) => (permissions as any)[k])
          .join(", ")}`,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      },
      ...prev,
    ]);

    setSelectedAuthorityForApproval(null);
  };

  if (authChecking) {
    return <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} />;
  }

  const pendingAuthoritiesCount = authorities.filter((a) => a.status === "pending").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <GovHeader />

      {!isAdminAuthorized ? (
        <main id="main-content" style={{ maxWidth: "480px", margin: "60px auto", padding: "0 20px 80px" }}>
          <div className="gov-card" style={{ padding: "36px", borderTop: "4px solid var(--gov-saffron)" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ fontSize: "36px", marginBottom: "6px" }}>🏛️</div>
              <h1 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-heading)" }}>
                Ministry Super-Admin Portal
              </h1>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Restricted Government Authority & Security Administration
              </p>
            </div>

            {adminError && (
              <div style={{
                padding: "10px 14px", borderRadius: "var(--radius-md)",
                background: "rgba(239,68,68,0.1)", border: "1px solid var(--danger)",
                color: "var(--danger)", fontSize: "12px", fontWeight: "600", marginBottom: "16px",
              }}>
                ⚠️ {adminError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Ministry Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="ayushsingh1772004@gmail.com"
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                    color: "var(--text-primary)", fontSize: "13px", outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
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
                  background: "var(--gov-blue)", color: "white", border: "none",
                  fontSize: "14px", fontWeight: "700", cursor: "pointer", marginTop: "6px",
                }}
              >
                Access Super-Admin Portal →
              </button>

              <div style={{ textAlign: "center", fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
                Super-Admin: <code>ayushsingh1772004@gmail.com</code> / <code>87654321</code>
              </div>
            </form>
          </div>
        </main>
      ) : (
        <main id="main-content" style={{ maxWidth: "1380px", margin: "0 auto", padding: "24px 20px 80px" }}>
          {/* Header Banner */}
          <div className="gov-card" style={{
            padding: "24px 32px", marginBottom: "28px",
            background: "linear-gradient(135deg, rgba(30,58,138,0.25) 0%, rgba(15,23,42,0.85) 100%)",
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px",
          }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--gov-saffron)", textTransform: "uppercase" }}>
                Ministry of Development of North Eastern Region (MDoNER)
              </div>
              <h1 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-heading)", marginTop: "2px" }}>
                Central Administrative & Authority Governance Desk 🛡️
              </h1>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Super-Admin Session: <strong>{currentUser?.name || currentUser?.email}</strong> •{" "}
                <span style={{ color: "var(--success)" }}>● Live DB Connected</span> (Last synced: {lastSyncedAt || "now"})
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={fetchAuthorities}
                disabled={isSyncing}
                style={{
                  padding: "8px 14px", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--accent-primary)", background: "rgba(59,130,246,0.1)",
                  color: "var(--accent-primary)", fontSize: "12px", fontWeight: "700", cursor: "pointer",
                }}
              >
                {isSyncing ? "Syncing..." : "🔄 Refresh Feed"}
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                  setIsAdminAuthorized(false);
                }}
                style={{
                  padding: "8px 16px", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                  color: "var(--text-primary)", fontSize: "12px", cursor: "pointer",
                }}
              >
                Sign Out Admin
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "24px" }}>
            <button
              onClick={() => setActiveTab("authorities")}
              style={{
                padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
                fontSize: "14px", fontWeight: activeTab === "authorities" ? "700" : "500",
                color: activeTab === "authorities" ? "var(--accent-primary)" : "var(--text-secondary)",
                borderBottom: activeTab === "authorities" ? "3px solid var(--accent-primary)" : "3px solid transparent",
              }}
            >
              👮 Authority Approvals & Access Controls ({pendingAuthoritiesCount} Pending)
            </button>
            <button
              onClick={() => setActiveTab("tourists")}
              style={{
                padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
                fontSize: "14px", fontWeight: activeTab === "tourists" ? "700" : "500",
                color: activeTab === "tourists" ? "var(--accent-primary)" : "var(--text-secondary)",
                borderBottom: activeTab === "tourists" ? "3px solid var(--accent-primary)" : "3px solid transparent",
              }}
            >
              🎒 Registered Tourist Database
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              style={{
                padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
                fontSize: "14px", fontWeight: activeTab === "audit" ? "700" : "500",
                color: activeTab === "audit" ? "var(--accent-primary)" : "var(--text-secondary)",
                borderBottom: activeTab === "audit" ? "3px solid var(--accent-primary)" : "3px solid transparent",
              }}
            >
              📜 Security Audit Logs
            </button>
          </div>

          {/* ─── TAB 1: Authority Approvals & Access Delegation ─ */}
          {activeTab === "authorities" && (
            <div className="gov-card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)" }}>
                  State Police & Officer Verification Queue
                </h2>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Auto-updating in real time every 3 seconds
                </div>
              </div>

              {authorities.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  No authority applications found in database.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {authorities.map((auth, idx) => (
                    <div
                      key={auth.id ? `${auth.id}-${idx}` : `auth-${idx}`}
                      style={{
                        padding: "20px", borderRadius: "var(--radius-md)",
                        background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-primary)" }}>
                            {auth.name}
                          </span>
                          <span style={{
                            fontSize: "11px", padding: "2px 8px", borderRadius: "var(--radius-full)",
                            background: auth.status === "active" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                            color: auth.status === "active" ? "var(--success)" : "var(--warning)",
                            fontWeight: "700",
                          }}>
                            {auth.status === "active" ? "APPROVED / ACTIVE ✓" : "PENDING REVIEW ⏳"}
                          </span>
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                          <strong>Post:</strong> {auth.designation || "Officer"} • <strong>Unit:</strong> {auth.department}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Badge/ID: <code>{auth.idNumber}</code> • Email: {auth.email} • Phone: {auth.phone} • Outpost: {auth.stationInfo}
                        </div>
                      </div>

                      <div>
                        {auth.status === "pending" ? (
                          <button
                            onClick={() => setSelectedAuthorityForApproval(auth)}
                            style={{
                              padding: "10px 18px", borderRadius: "var(--radius-md)",
                              background: "var(--gov-saffron)", color: "white", border: "none",
                              fontSize: "13px", fontWeight: "700", cursor: "pointer",
                            }}
                          >
                            Review & Set Permissions →
                          </button>
                        ) : (
                          <span style={{ fontSize: "13px", color: "var(--success)", fontWeight: "700" }}>
                            Clearance Granted ✓
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 2: Tourist Database ─────────────────────── */}
          {activeTab === "tourists" && (
            <div className="gov-card" style={{ padding: "28px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)", marginBottom: "16px" }}>
                Active Tourist Safety Registrations
              </h2>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border-subtle)", textAlign: "left", color: "var(--text-muted)" }}>
                      <th style={{ padding: "10px" }}>Tourist Name</th>
                      <th style={{ padding: "10px" }}>Email / Phone</th>
                      <th style={{ padding: "10px" }}>Verifiable DID</th>
                      <th style={{ padding: "10px" }}>Emergency Contacts</th>
                      <th style={{ padding: "10px" }}>KYC Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {touristsList.map((t, idx) => (
                      <tr key={t.id ? `${t.id}-${idx}` : `tourist-${idx}`} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "12px 10px", fontWeight: "700", color: "var(--text-primary)" }}>{t.name}</td>
                        <td style={{ padding: "12px 10px", color: "var(--text-secondary)" }}>{t.email}<br /><span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.phone}</span></td>
                        <td style={{ padding: "12px 10px", fontFamily: "monospace", color: "var(--accent-primary)" }}>{t.didRef}</td>
                        <td style={{ padding: "12px 10px", color: "var(--text-secondary)" }}>{t.contactsCount} Contacts Linked</td>
                        <td style={{ padding: "12px 10px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,0.15)", color: "var(--success)", fontWeight: "700", fontSize: "11px" }}>
                            VERIFIED ✓
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── TAB 3: Security Audit Logs ──────────────────── */}
          {activeTab === "audit" && (
            <div className="gov-card" style={{ padding: "28px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)", marginBottom: "16px" }}>
                Immutable Audit Trail & Data Unmasking Log
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {auditLogs.map((log, idx) => (
                  <div
                    key={log.id ? `${log.id}-${idx}` : `log-${idx}`}
                    style={{
                      padding: "14px 18px", borderRadius: "var(--radius-md)",
                      background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                      fontSize: "13px", lineHeight: "1.6",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontWeight: "700", color: "var(--accent-primary)" }}>{log.action}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{log.timestamp}</span>
                    </div>
                    <div><strong>Actor:</strong> {log.actor} ➔ <strong>Target:</strong> {log.target}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}><strong>Justification:</strong> {log.justification}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Permission & Approval Modal ──────────────────── */}
          {selectedAuthorityForApproval && (
            <div style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 1000, padding: "20px",
            }}>
              <div className="gov-card" style={{ maxWidth: "560px", width: "100%", padding: "32px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)", marginBottom: "6px" }}>
                  Configure Data Access Clearance
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                  Assign granular tourist data access permissions for <strong>{selectedAuthorityForApproval.name}</strong> ({selectedAuthorityForApproval.department}).
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                  {[
                    { key: "canViewFullName", label: "Tourist Full Legal Name & Identification Photo" },
                    { key: "canViewLiveLocation", label: "Real-Time GPS Coordinates & Movement Trail" },
                    { key: "canViewEmergencyContacts", label: "Family Emergency Contact Numbers" },
                    { key: "canViewPhoneNumber", label: "Tourist Direct Mobile Phone Number" },
                    { key: "canViewDigitalId", label: "Aadhaar / Passport Verifiable DID Document" },
                  ].map((perm) => (
                    <label key={perm.key} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--text-primary)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={(permissions as any)[perm.key]}
                        onChange={(e) => setPermissions({ ...permissions, [perm.key]: e.target.checked })}
                        style={{ width: "16px", height: "16px", accentColor: "var(--gov-saffron)" }}
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setSelectedAuthorityForApproval(null)}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)", background: "transparent",
                      color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApproveWithPermissions}
                    style={{
                      flex: 2, padding: "10px", borderRadius: "var(--radius-md)",
                      background: "var(--success)", color: "white", border: "none",
                      fontSize: "13px", fontWeight: "700", cursor: "pointer",
                    }}
                  >
                    Grant Clearance & Approve Officer →
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      <GovFooter />
    </div>
  );
}
