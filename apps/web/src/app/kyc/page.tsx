"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { GovHeader } from "../../components/GovHeader";
import { GovFooter } from "../../components/GovFooter";
import { useLanguage } from "../../context/LanguageContext";

interface PassportMRZ {
  documentType: string;
  issuingCountry: string;
  lastName: string;
  firstNames: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  sex: string;
  expirationDate: string;
  isValidChecksum: boolean;
}

export default function KYCPage() {
  const { t, language } = useLanguage();
  const [tab, setTab] = useState<"digilocker" | "passport">("digilocker");
  
  // Passport OCR State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [passportLoading, setPassportLoading] = useState(false);
  const [passportError, setPassportError] = useState("");
  const [passportSuccess, setPassportSuccess] = useState<{
    digitalIdRef: string;
    passport: PassportMRZ;
  } | null>(null);

  // DigiLocker Aadhaar State
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [digiLockerStep, setDigiLockerStep] = useState<"input" | "consent" | "otp" | "verified">("input");
  const [digiLockerOtp, setDigiLockerOtp] = useState("");
  const [digiLockerLoading, setDigiLockerLoading] = useState(false);
  const [digiLockerSuccess, setDigiLockerSuccess] = useState<{
    digitalIdRef: string;
    fullName: string;
    maskedAadhaar: string;
    dob: string;
    gender: string;
    state: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Passport OCR Mock Handler ─────────────────────────────
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPassportError("");
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyPassportMock = () => {
    if (!imagePreview) {
      setPassportError("Please select or capture a passport photo page first");
      return;
    }

    setPassportLoading(true);
    setPassportError("");

    setTimeout(() => {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const emailPrefix = storedUser.email ? storedUser.email.split("@")[0] : "Tourist";
      const formattedName = storedUser.name || emailPrefix.replace(/[._0-9]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()).trim() || "Verified Tourist";

      const mockPassportNo = "E" + Math.floor(10000000 + Math.random() * 90000000);
      const mockResult = {
        digitalIdRef: `did:vana:passport:USA:${mockPassportNo}`,
        passport: {
          documentType: "P",
          issuingCountry: "USA",
          lastName: formattedName.split(" ").slice(-1)[0] || "TRAVELER",
          firstNames: formattedName.split(" ").slice(0, -1).join(" ") || "SARAH",
          passportNumber: mockPassportNo,
          nationality: "UNITED STATES OF AMERICA",
          dateOfBirth: "1995-07-22",
          sex: "F",
          expirationDate: "2033-04-15",
          isValidChecksum: true,
        },
      };

      setPassportSuccess(mockResult);
      setPassportLoading(false);

      localStorage.setItem("user", JSON.stringify({ ...storedUser, digitalIdRef: mockResult.digitalIdRef, kycVerified: true }));
    }, 1200);
  };

  // ─── DigiLocker Aadhaar Mock Handler ───────────────────────
  const handleAadhaarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = aadhaarNumber.replace(/\s+/g, "");
    if (cleanNum.length !== 12) {
      alert("Please enter a valid 12-digit Aadhaar number");
      return;
    }
    setDigiLockerStep("consent");
  };

  const handleDigiLockerConsent = () => {
    setDigiLockerLoading(true);
    setTimeout(() => {
      setDigiLockerLoading(false);
      setDigiLockerStep("otp");
    }, 800);
  };

  const handleVerifyAadhaarOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setDigiLockerLoading(true);

    setTimeout(() => {
      setDigiLockerLoading(false);
      const cleanNum = aadhaarNumber.replace(/\s+/g, "");
      const masked = `XXXX XXXX ${cleanNum.slice(-4) || "8921"}`;
      
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const emailPrefix = storedUser.email ? storedUser.email.split("@")[0] : "Tourist";
      const dynamicName = storedUser.name || emailPrefix.replace(/[._0-9]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()).trim() || "Rahul Sharma";

      const result = {
        digitalIdRef: `did:vana:aadhaar:${cleanNum.slice(-4) || "8921"}`,
        fullName: dynamicName,
        maskedAadhaar: masked,
        dob: "1996-03-14",
        gender: "Verified Citizen",
        state: "Meghalaya / NER Pilot Node",
      };

      setDigiLockerSuccess(result);
      setDigiLockerStep("verified");

      localStorage.setItem("user", JSON.stringify({ ...storedUser, name: dynamicName, digitalIdRef: result.digitalIdRef, kycVerified: true }));
    }, 1000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <GovHeader />

      <main id="main-content" style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 20px 80px" }}>
        {/* Page Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--gov-saffron)", textTransform: "uppercase" }}>
            {language === "hi" ? "पहचान आश्वासन एवं केवाईसी केंद्र" : "Identity Assurance & KYC Center"}
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-heading)", marginTop: "2px" }}>
            {t.kycHeading}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {t.kycSubheading}
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "24px" }}>
          <button
            onClick={() => setTab("digilocker")}
            style={{
              padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
              fontSize: "14px", fontWeight: tab === "digilocker" ? "700" : "500",
              color: tab === "digilocker" ? "var(--accent-primary)" : "var(--text-secondary)",
              borderBottom: tab === "digilocker" ? "3px solid var(--accent-primary)" : "3px solid transparent",
            }}
          >
            {t.tabDigiLocker}
          </button>
          <button
            onClick={() => setTab("passport")}
            style={{
              padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
              fontSize: "14px", fontWeight: tab === "passport" ? "700" : "500",
              color: tab === "passport" ? "var(--accent-primary)" : "var(--text-secondary)",
              borderBottom: tab === "passport" ? "3px solid var(--accent-primary)" : "3px solid transparent",
            }}
          >
            {t.tabPassport}
          </button>
        </div>

        {/* ─── Tab 1: DigiLocker Aadhaar Verification ──────────── */}
        {tab === "digilocker" && (
          <div>
            {digiLockerStep === "input" && (
              <div className="gov-card" style={{ padding: "32px" }}>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div style={{ fontSize: "40px", marginBottom: "8px" }}>🇮🇳</div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-heading)" }}>
                    {t.aadhaarTitle}
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    {t.aadhaarPrompt}
                  </p>
                </div>

                <form onSubmit={handleAadhaarSubmit} style={{ maxWidth: "440px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                      {language === "hi" ? "12-अंकीय आधार संख्या दर्ज करें" : language === "as" ? "১২-টা সংখ্যাৰ আধাৰ নম্বৰ দিয়ক" : language === "bn" ? "১২ সংখ্যার আধার নম্বর লিখুন" : "Enter 12-Digit Aadhaar Number"}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={14}
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      placeholder="XXXX XXXX 8921"
                      style={{
                        width: "100%", padding: "12px", borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                        color: "var(--text-primary)", fontSize: "16px", letterSpacing: "2px", outline: "none",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      padding: "12px", borderRadius: "var(--radius-md)",
                      background: "var(--gov-saffron)", color: "white", border: "none",
                      fontSize: "14px", fontWeight: "700", cursor: "pointer",
                    }}
                  >
                    {t.authDigiLockerBtn}
                  </button>
                </form>
              </div>
            )}

            {digiLockerStep === "consent" && (
              <div className="gov-card" style={{ padding: "32px", maxWidth: "520px", margin: "0 auto" }}>
                <div style={{ fontSize: "32px", textAlign: "center", marginBottom: "8px" }}>🔒</div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)", textAlign: "center", marginBottom: "12px" }}>
                  DigiLocker Consent Declaration
                </h3>
                <div style={{
                  padding: "14px", borderRadius: "var(--radius-md)",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                  fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px",
                }}>
                  I hereby provide my voluntary consent to Ministry of Development of North Eastern Region (MDoNER) & V.A.N.A to fetch my e-Aadhaar XML data from UIDAI/DigiLocker strictly for issuing my encrypted Tourist Safety Digital ID.
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setDigiLockerStep("input")}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)", background: "transparent",
                      color: "var(--text-primary)", fontSize: "13px", cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDigiLockerConsent}
                    disabled={digiLockerLoading}
                    style={{
                      flex: 2, padding: "10px", borderRadius: "var(--radius-md)",
                      background: "var(--gov-blue)", color: "white", border: "none",
                      fontSize: "13px", fontWeight: "700", cursor: "pointer",
                    }}
                  >
                    {digiLockerLoading ? "Connecting Gateway..." : "I Agree & Send UIDAI OTP →"}
                  </button>
                </div>
              </div>
            )}

            {digiLockerStep === "otp" && (
              <div className="gov-card" style={{ padding: "32px", maxWidth: "480px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <div style={{ fontSize: "32px", marginBottom: "6px" }}>📲</div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-heading)" }}>
                    Enter UIDAI Aadhaar OTP
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    OTP sent to mobile linked with Aadhaar ending in ...{aadhaarNumber.slice(-4) || "8921"}. (Test OTP: <strong>123456</strong>)
                  </p>
                </div>

                <form onSubmit={handleVerifyAadhaarOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={digiLockerOtp}
                    onChange={(e) => setDigiLockerOtp(e.target.value)}
                    placeholder="123456"
                    style={{
                      width: "100%", padding: "12px", borderRadius: "var(--radius-md)",
                      border: "2px solid var(--accent-primary)", background: "var(--bg-secondary)",
                      color: "var(--text-primary)", fontSize: "20px", fontWeight: "800",
                      letterSpacing: "6px", textAlign: "center", outline: "none",
                    }}
                  />

                  <button
                    type="submit"
                    disabled={digiLockerLoading}
                    style={{
                      padding: "12px", borderRadius: "var(--radius-md)",
                      background: "var(--success)", color: "white", border: "none",
                      fontSize: "14px", fontWeight: "700", cursor: "pointer",
                    }}
                  >
                    {digiLockerLoading ? "Verifying with UIDAI..." : "Complete Aadhaar Verification →"}
                  </button>
                </form>
              </div>
            )}

            {digiLockerStep === "verified" && digiLockerSuccess && (
              <div className="gov-card" style={{ padding: "32px", borderTop: "4px solid var(--success)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(16,185,129,0.15)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold" }}>
                    ✓
                  </div>
                  <div>
                    <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--success)" }}>
                      DigiLocker Aadhaar KYC Verified!
                    </h2>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                      {digiLockerSuccess.digitalIdRef}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: "18px", borderRadius: "var(--radius-md)",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                  fontSize: "13px", lineHeight: "1.8", marginBottom: "24px",
                }}>
                  <div><strong>Full Name:</strong> {digiLockerSuccess.fullName}</div>
                  <div><strong>Aadhaar Number:</strong> {digiLockerSuccess.maskedAadhaar}</div>
                  <div><strong>Date of Birth:</strong> {digiLockerSuccess.dob} ({digiLockerSuccess.gender})</div>
                  <div><strong>Regional Node:</strong> {digiLockerSuccess.state}</div>
                  <div><strong>Protected Area Permit (PAP) Status:</strong> <span style={{ color: "var(--success)", fontWeight: "700" }}>PRE-AUTHORIZED ✓</span></div>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <Link href="/trips" style={{
                    padding: "10px 20px", borderRadius: "var(--radius-md)",
                    background: "var(--gov-blue)", color: "white", textDecoration: "none",
                    fontSize: "13px", fontWeight: "700",
                  }}>
                    Plan Protected NER Route →
                  </Link>
                  <Link href="/dashboard" style={{
                    padding: "10px 20px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)", color: "var(--text-primary)",
                    textDecoration: "none", fontSize: "13px", fontWeight: "600",
                  }}>
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Tab 2: International Passport OCR ──────────────── */}
        {tab === "passport" && (
          <div>
            {!passportSuccess ? (
              <div className="gov-card" style={{ padding: "28px" }}>
                <div style={{
                  border: "2px dashed var(--border-active)", borderRadius: "var(--radius-lg)",
                  padding: "36px 20px", textAlign: "center", marginBottom: "20px",
                  background: "var(--bg-secondary)",
                }}>
                  {imagePreview ? (
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Passport Preview"
                        style={{ maxHeight: "240px", maxWidth: "100%", borderRadius: "var(--radius-md)", margin: "0 auto 16px", objectFit: "contain" }}
                      />
                      <div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            padding: "6px 14px", borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-subtle)", background: "transparent",
                            color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer",
                          }}
                        >
                          Change Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: "40px", marginBottom: "8px" }}>📷</div>
                      <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                        Capture or Upload Passport Bio Page
                      </h3>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
                        Ensure the 2-line Machine Readable Zone (MRZ) at the bottom is clear and well-lit.
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: "10px 20px", borderRadius: "var(--radius-md)",
                          background: "var(--gov-blue)", color: "white", border: "none",
                          fontSize: "13px", fontWeight: "700", cursor: "pointer",
                        }}
                      >
                        Choose Photo / Camera
                      </button>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageCapture}
                    accept="image/*"
                    capture="environment"
                    style={{ display: "none" }}
                  />
                </div>

                {passportError && (
                  <div style={{
                    padding: "10px 14px", borderRadius: "var(--radius-md)",
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                    color: "var(--danger)", fontSize: "12px", fontWeight: "600", marginBottom: "16px",
                  }}>
                    ⚠️ {passportError}
                  </div>
                )}

                <button
                  onClick={handleVerifyPassportMock}
                  disabled={passportLoading || !imagePreview}
                  style={{
                    width: "100%", padding: "14px", borderRadius: "var(--radius-md)",
                    background: imagePreview ? "var(--accent-gradient)" : "var(--bg-secondary)",
                    color: "white", border: "none", fontSize: "14px", fontWeight: "700",
                    cursor: imagePreview && !passportLoading ? "pointer" : "not-allowed",
                    boxShadow: imagePreview ? "var(--shadow-glow-blue)" : "none",
                  }}
                >
                  {passportLoading ? "Extracting ICAO 9303 MRZ..." : "Extract MRZ & Verify Passport Digital ID →"}
                </button>
              </div>
            ) : (
              <div className="gov-card" style={{ padding: "32px", borderTop: "4px solid var(--success)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(16,185,129,0.15)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    ✓
                  </div>
                  <div>
                    <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--success)" }}>
                      International Digital ID Verified!
                    </h2>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                      {passportSuccess.digitalIdRef}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: "18px", borderRadius: "var(--radius-md)",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                  fontSize: "13px", lineHeight: "1.7", marginBottom: "24px",
                }}>
                  <div><strong>Full Name:</strong> {passportSuccess.passport.firstNames} {passportSuccess.passport.lastName}</div>
                  <div><strong>Passport Number:</strong> {passportSuccess.passport.passportNumber}</div>
                  <div><strong>Nationality:</strong> {passportSuccess.passport.nationality}</div>
                  <div><strong>Date of Birth:</strong> {passportSuccess.passport.dateOfBirth}</div>
                  <div><strong>Expiration Date:</strong> {passportSuccess.passport.expirationDate}</div>
                  <div><strong>MRZ Checksum (7-3-1 Weight):</strong> <span style={{ color: "var(--success)", fontWeight: "700" }}>VALID ✓</span></div>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <Link href="/trips" style={{
                    padding: "10px 20px", borderRadius: "var(--radius-md)",
                    background: "var(--gov-blue)", color: "white", textDecoration: "none",
                    fontSize: "13px", fontWeight: "700",
                  }}>
                    Apply for Sikkim PAP Permit →
                  </Link>
                  <Link href="/dashboard" style={{
                    padding: "10px 20px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)", color: "var(--text-primary)",
                    textDecoration: "none", fontSize: "13px", fontWeight: "600",
                  }}>
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <GovFooter />
    </div>
  );
}
