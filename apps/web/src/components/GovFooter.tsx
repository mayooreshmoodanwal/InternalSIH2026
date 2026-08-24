"use client";

import { useState } from "react";
import Link from "next/link";

export function GovFooter() {
  const [showAskVanaModal, setShowAskVanaModal] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: "Namaste! 🙏 I am V.A.N.A AI, your tourist safety assistant for Northeast India. How can I help your journey today?",
    },
  ]);
  const [chatInput, setChatInput] = useState<string>("");

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatInput("");

    setTimeout(() => {
      let botReply = "I am checking NER safety telemetry. Please download your offline map before heading to remote areas in Meghalaya or Sikkim.";
      const lower = userText.toLowerCase();
      if (lower.includes("sos") || lower.includes("emergency") || lower.includes("help")) {
        botReply = "🚨 IN EMERGENCY: Hold the SOS button for 3 seconds on the /sos page. Your phone will cascade from Internet → Encrypted SMS → Bluetooth Mesh Relay to nearby tourists & police.";
      } else if (lower.includes("fare") || lower.includes("taxi") || lower.includes("cost") || lower.includes("price") || lower.includes("ondc")) {
        botReply = "🚕 ONDC Live Integration: In Shillong, fair taxi rates are ₹15/km, and shared Sumos to Cherrapunji cost ~₹200 per seat. Check the ONDC Fair Prices page for real-time rates.";
      } else if (lower.includes("passport") || lower.includes("kyc") || lower.includes("id")) {
        botReply = "🛂 You can upload your passport photo page on the /kyc page. Our OCR instantly parses the MRZ lines to generate your cryptographic Digital ID.";
      } else if (lower.includes("permit") || lower.includes("nathula")) {
        botReply = "📋 Nathula Pass & Gurudongmar Lake require Protected Area Permits (PAP). Apply via your V.A.N.A dashboard 48 hours prior to your journey.";
      }

      setChatMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    }, 600);
  };

  return (
    <>
      {/* ─── Footer Initiatives Carousel ──────────────────────── */}
      <div style={{
        background: "var(--bg-secondary)", borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)", padding: "16px 24px",
      }}>
        <div style={{
          maxWidth: "1380px", margin: "0 auto", display: "flex",
          justifyContent: "space-around", alignItems: "center", flexWrap: "wrap", gap: "20px",
          color: "var(--text-muted)", fontSize: "13px", fontWeight: "600",
        }}>
          <span>🇮🇳 Digital India</span>
          <span>•</span>
          <span>🏔️ Incredible India</span>
          <span>•</span>
          <span>🏛️ Ministry of Tourism</span>
          <span>•</span>
          <span>🌲 MDoNER</span>
          <span>•</span>
          <span>👮 Meghalaya Police</span>
          <span>•</span>
          <span>👮 Sikkim Police</span>
          <span>•</span>
          <span>💡 Smart India Hackathon</span>
        </div>
      </div>

      {/* ─── Official Government Footer ───────────────────────── */}
      <footer style={{
        background: "var(--gov-blue-dark)", color: "#cbd5e1", padding: "40px 24px 20px",
        fontSize: "13px", lineHeight: "1.7",
      }}>
        <div style={{
          maxWidth: "1380px", margin: "0 auto", display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "32px", marginBottom: "36px",
        }}>
          <div>
            <h4 style={{ color: "white", fontSize: "15px", fontWeight: "700", marginBottom: "12px" }}>
              About V.A.N.A
            </h4>
            <p style={{ fontSize: "12px", color: "#94a3b8" }}>
              Vigilant Assistance for NER Areas (V.A.N.A) is an AI-powered tourist safety portal and 4-step emergency connectivity cascade developed for the North Eastern Region of India.
            </p>
          </div>

          <div>
            <h4 style={{ color: "white", fontSize: "15px", fontWeight: "700", marginBottom: "12px" }}>
              Essential Portals
            </h4>
            <ul style={{ listStyle: "none", padding: 0, fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li><Link href="/sos" style={{ color: "#94a3b8", textDecoration: "none" }}>4-Step SOS Protocol</Link></li>
              <li><Link href="/kyc" style={{ color: "#94a3b8", textDecoration: "none" }}>Passport OCR Digital ID</Link></li>
              <li><Link href="/map" style={{ color: "#94a3b8", textDecoration: "none" }}>Safety & Dead Zones Map</Link></li>
              <li><Link href="/fares" style={{ color: "#94a3b8", textDecoration: "none" }}>ONDC Anti-Scam Price Shield</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: "white", fontSize: "15px", fontWeight: "700", marginBottom: "12px" }}>
              Official & Authority Access
            </h4>
            <ul style={{ listStyle: "none", padding: 0, fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li><Link href="/authority/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}>State Police Emergency Desk 🔒</Link></li>
              <li><Link href="/admin/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}>Ministry Admin Portal 🔒</Link></li>
              <li><Link href="/login" style={{ color: "#94a3b8", textDecoration: "none" }}>Official Credential Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: "white", fontSize: "15px", fontWeight: "700", marginBottom: "12px" }}>
              Contact & Helplines
            </h4>
            <p style={{ fontSize: "12px", color: "#94a3b8" }}>
              National Emergency: <strong style={{ color: "#f87171" }}>112</strong><br />
              Tourist Police Helpline: <strong style={{ color: "#60a5fa" }}>1363</strong><br />
              Email: <strong>support@vana.gov.in</strong><br />
              Pilot Node: East Khasi Hills, Meghalaya & Gangtok, Sikkim
            </p>
          </div>
        </div>

        <div style={{
          maxWidth: "1380px", margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "10px", fontSize: "12px", color: "#94a3b8",
        }}>
          <div>
            © 2026 V.A.N.A (Vigilant Assistance for NER Areas). Designed for Government of India (MDoNER & Ministry of Tourism).
          </div>
          <div>
            Last Updated On: <strong>23 August 2026</strong> • Compliance: GIGW 3.0 / W3C WCAG 2.1 AA
          </div>
        </div>
      </footer>

      {/* ─── Floating "Ask VANA" Mascot / AI Assistant ────────── */}
      <div className="ask-vana-badge" onClick={() => setShowAskVanaModal(true)}>
        <span style={{ fontSize: "24px" }}>🤖</span>
        <div>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-heading)", lineHeight: "1" }}>
            Ask V.A.N.A
          </div>
          <div style={{ fontSize: "10px", color: "var(--gov-saffron)", fontWeight: "600" }}>
            AI Safety Assistant
          </div>
        </div>
      </div>

      {/* "Ask VANA" Chat Modal */}
      {showAskVanaModal && (
        <div style={{
          position: "fixed", bottom: "80px", right: "24px", width: "360px",
          maxHeight: "520px", zIndex: 1000, background: "var(--bg-card)",
          borderRadius: "var(--radius-lg)", border: "2px solid var(--border-active)",
          boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{
            background: "var(--gov-blue)", color: "white", padding: "14px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>🤖</span>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700" }}>Ask V.A.N.A Assistant</div>
                <div style={{ fontSize: "10px", opacity: 0.8 }}>Online • NER Safety Telemetry</div>
              </div>
            </div>
            <button
              onClick={() => setShowAskVanaModal(false)}
              style={{ background: "none", border: "none", color: "white", fontSize: "18px", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", maxHeight: "340px" }}>
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%", padding: "10px 14px", borderRadius: "var(--radius-md)",
                  background: msg.sender === "user" ? "var(--accent-primary)" : "var(--bg-secondary)",
                  color: msg.sender === "user" ? "white" : "var(--text-primary)",
                  fontSize: "12px", lineHeight: "1.4",
                  border: msg.sender === "bot" ? "1px solid var(--border-subtle)" : "none",
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} style={{ padding: "10px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about fares, permits, root bridges..."
              style={{
                flex: 1, padding: "8px 12px", borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)", background: "var(--bg-primary)",
                color: "var(--text-primary)", fontSize: "12px", outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 14px", borderRadius: "var(--radius-md)",
                background: "var(--gov-saffron)", color: "white", border: "none",
                fontWeight: "700", fontSize: "12px", cursor: "pointer",
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
