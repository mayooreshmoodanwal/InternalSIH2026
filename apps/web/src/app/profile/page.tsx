"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GovHeader } from "../../components/GovHeader";
import { GovFooter } from "../../components/GovFooter";
import { useLanguage } from "../../context/LanguageContext";

export default function ProfilePage() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [contacts, setContacts] = useState([
    { id: "1", name: "Raj Sharma (Father)", phone: "+919876500001", relationship: "Parent" },
    { id: "2", name: "Pooja Roy (Spouse)", phone: "+919876500002", relationship: "Spouse" },
  ]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relationship: "Family" });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    setContacts([...contacts, { ...newContact, id: Date.now().toString() }]);
    setNewContact({ name: "", phone: "", relationship: "Family" });
    setShowAddContact(false);
  };

  const handleRemoveContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <GovHeader />

      <main id="main-content" style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 20px 80px" }}>
        {/* Profile Card Header */}
        <div className="gov-card" style={{ padding: "36px", textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "var(--accent-gradient)", display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "36px", fontWeight: "800", color: "white", marginBottom: "14px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
          }}>
            {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "T"}
          </div>

          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-heading)" }}>
            {user?.name || user?.email || (language === "hi" ? "पंजीकृत पर्यटक" : "Registered Tourist")}
          </h1>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            {t.citizenIdLabel}: #{user?.id ? user.id.slice(0, 8) : "TOUR-8821"}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
            <span style={{
              padding: "4px 14px", borderRadius: "var(--radius-full)",
              background: "rgba(16,185,129,0.15)", color: "var(--success)",
              fontSize: "12px", fontWeight: "700",
            }}>
              ✓ {language === "hi" ? "सत्यापित पहचान (केवाईसी)" : "Verified Tourist KYC"}
            </span>
            <span style={{
              padding: "4px 14px", borderRadius: "var(--radius-full)",
              background: "rgba(59,130,246,0.15)", color: "var(--accent-primary)",
              fontSize: "12px", fontWeight: "700",
            }}>
              📡 {language === "hi" ? "4-चरणीय एसओएस सक्रिय" : "4-Step SOS Active"}
            </span>
          </div>
        </div>

        {/* ─── Emergency Contacts Section ──────────────────────── */}
        <div className="gov-card" style={{ padding: "28px", marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)" }}>
              {t.emergencyContactsTitle} 🚨
            </h2>
            <button
              onClick={() => setShowAddContact(!showAddContact)}
              style={{
                padding: "6px 14px", borderRadius: "var(--radius-md)",
                background: "var(--gov-blue)", color: "white", border: "none",
                fontSize: "12px", fontWeight: "700", cursor: "pointer",
              }}
            >
              {t.addContactBtn}
            </button>
          </div>

          {showAddContact && (
            <form onSubmit={handleAddContact} style={{
              padding: "18px", borderRadius: "var(--radius-md)",
              background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
              marginBottom: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px",
            }}>
              <input
                type="text"
                required
                placeholder="Contact Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                style={{ padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "12px" }}
              />
              <input
                type="text"
                required
                placeholder="Phone (+91...)"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                style={{ padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "12px" }}
              />
              <button
                type="submit"
                style={{ padding: "8px", borderRadius: "var(--radius-sm)", background: "var(--success)", color: "white", border: "none", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
              >
                Save Contact
              </button>
            </form>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {contacts.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: "14px 18px", borderRadius: "var(--radius-md)",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "14px" }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {c.phone} • {c.relationship}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveContact(c.id)}
                  style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "13px" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Digital Identity Details ────────────────────────── */}
        <div className="gov-card" style={{ padding: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)", marginBottom: "16px" }}>
            {t.digitalId}
          </h2>

          <div style={{
            padding: "16px", borderRadius: "var(--radius-md)",
            background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
            fontSize: "13px", lineHeight: "1.8", color: "var(--text-secondary)",
          }}>
            <div><strong>Digital ID Ref:</strong> <code style={{ color: "var(--accent-primary)" }}>{user?.digitalIdRef || "did:vana:aadhaar:8921"}</code></div>
            <div><strong>Protected Area Permit (PAP):</strong> <span style={{ color: "var(--success)", fontWeight: "700" }}>AUTHORIZED ✓</span></div>
            <div><strong>State Nodes:</strong> Meghalaya & Sikkim Pilot Nodes</div>
          </div>
        </div>
      </main>

      <GovFooter />
    </div>
  );
}
