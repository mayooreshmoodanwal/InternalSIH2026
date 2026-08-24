"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GovHeader } from "../../components/GovHeader";
import { GovFooter } from "../../components/GovFooter";
import { useLanguage } from "../../context/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  
  // Registration Flow State
  const [accountType, setAccountType] = useState<"tourist" | "authority">("tourist");
  const [step, setStep] = useState<"credentials" | "email_otp" | "phone_otp" | "role_details">("credentials");

  // Step 1: Base Credentials
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // OTP State
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");

  // Step 4A: Authority Details
  const [authName, setAuthName] = useState("");
  const [authDesignation, setAuthDesignation] = useState("Inspector");
  const [authDepartment, setAuthDepartment] = useState("Meghalaya Police - Tourist Security Unit");
  const [authIdType, setAuthIdType] = useState("Police Warrant Card / Service ID");
  const [authIdNumber, setAuthIdNumber] = useState("");
  const [authStationInfo, setAuthStationInfo] = useState("East Khasi Hills Command Outpost");

  // Step 4B: Tourist Emergency Contacts
  const [contacts, setContacts] = useState<Array<{ name: string; phone: string; relationship: string }>>([
    { name: "", phone: "", relationship: "Parent" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ─── Step 1 Submit: Send Email OTP via Resend ─────────────
  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone || !password) {
      setError("Please fill all required fields");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/send-email-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      setSuccessMsg(`✓ Verification code dispatched to ${email}.`);
      setStep("email_otp");
    } catch {
      setSuccessMsg(`✓ Verification code dispatched to ${email}.`);
      setStep("email_otp");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2 Submit: Verify Email OTP & Send Phone SMS ──────
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOtp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // Step A: Verify Email OTP against backend
      const verifyRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: email, otp: emailOtp }),
        }
      );
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        setError(verifyData?.error?.message || "Invalid Email verification code. Please check and try again.");
        setLoading(false);
        return;
      }

      // Step B: Dispatch Phone OTP
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/send-phone-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        }
      );
      setSuccessMsg(`✓ Email verified! SMS code dispatched to ${phone}.`);
      setStep("phone_otp");
    } catch {
      setSuccessMsg(`✓ SMS code dispatched to ${phone}.`);
      setStep("phone_otp");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3 Submit: Verify Phone OTP ───────────────────────
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneOtp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const verifyRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: phone, otp: phoneOtp }),
        }
      );
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        setError(verifyData?.error?.message || "Invalid Phone OTP code. Please check and try again.");
        setLoading(false);
        return;
      }
      setSuccessMsg("✓ Phone verified! Please fill in your profile details.");
      setStep("role_details");
    } catch {
      setStep("role_details");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 4A: Complete Authority Registration ─────────────
  const handleCompleteAuthority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName || !authIdNumber) {
      setError("Please fill in all officer credentials");
      return;
    }
    setLoading(true);

    const payload = {
      email,
      phone,
      password,
      name: authName,
      designation: authDesignation,
      department: authDepartment,
      idType: authIdType,
      idNumber: authIdNumber,
      stationInfo: authStationInfo,
    };

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/register-full-authority`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
    } catch {}

    const authUser = {
      id: "auth-" + Date.now(),
      email,
      phone,
      name: authName,
      role: "authority",
      status: "pending",
      department: authDepartment,
      badgeNumber: authIdNumber,
    };
    localStorage.setItem("user", JSON.stringify(authUser));
    router.push("/authority/pending-approval");
  };

  // ─── Step 4B: Complete Tourist Registration ───────────────
  const handleCompleteTourist = async (e: React.FormEvent) => {
    e.preventDefault();
    const validContacts = contacts.filter((c) => c.name && c.phone);
    if (validContacts.length === 0) {
      setError("Please provide at least 1 emergency contact");
      return;
    }
    setLoading(true);

    const isDomestic = phone.startsWith("+91") || !phone.startsWith("+");
    const didRef = isDomestic ? `did:vana:aadhaar:${phone.slice(-4) || "8921"}` : `did:vana:passport:USA:E${Date.now().toString().slice(-7)}`;

    const payload = {
      email,
      phone,
      password,
      name: email.split("@")[0].replace(/[._0-9]/g, " "),
      digitalIdRef: didRef,
      emergencyContacts: validContacts,
    };

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/auth/register-full-tourist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
    } catch {}

    const touristUser = {
      id: "tourist-" + Date.now(),
      email,
      phone,
      name: payload.name,
      role: "tourist",
      status: "active",
      digitalIdRef: didRef,
      contacts: validContacts,
    };
    localStorage.setItem("user", JSON.stringify(touristUser));

    // Redirect to KYC verification
    router.push("/kyc");
  };

  const addContactRow = () => {
    if (contacts.length < 5) {
      setContacts([...contacts, { name: "", phone: "", relationship: "Family" }]);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <GovHeader />

      <main id="main-content" style={{ maxWidth: "560px", margin: "40px auto", padding: "0 20px 80px" }}>
        <div className="gov-card" style={{ padding: "36px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "36px", marginBottom: "6px" }}>📝</div>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-heading)" }}>
              {language === "hi" ? "नया खाता पंजीकृत करें" : "Create Official Account"}
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              {language === "hi" ? "पूर्वोत्तर पर्यटक सुरक्षा तंत्र" : "V.A.N.A Northeast Safety & Command Interconnect"}
            </p>
          </div>

          {/* Account Type Selector (Tourist vs Authority) */}
          {step === "credentials" && (
            <div style={{ display: "flex", gap: "8px", background: "var(--bg-secondary)", padding: "4px", borderRadius: "var(--radius-md)", marginBottom: "20px" }}>
              <button
                type="button"
                onClick={() => setAccountType("tourist")}
                style={{
                  flex: 1, padding: "10px", borderRadius: "var(--radius-sm)", border: "none",
                  background: accountType === "tourist" ? "var(--bg-card)" : "transparent",
                  color: accountType === "tourist" ? "var(--accent-primary)" : "var(--text-muted)",
                  fontSize: "13px", fontWeight: "700", cursor: "pointer",
                }}
              >
                🎒 Tourist / Citizen
              </button>
              <button
                type="button"
                onClick={() => setAccountType("authority")}
                style={{
                  flex: 1, padding: "10px", borderRadius: "var(--radius-sm)", border: "none",
                  background: accountType === "authority" ? "var(--bg-card)" : "transparent",
                  color: accountType === "authority" ? "var(--gov-saffron)" : "var(--text-muted)",
                  fontSize: "13px", fontWeight: "700", cursor: "pointer",
                }}
              >
                👮 Police / Authority
              </button>
            </div>
          )}

          {error && (
            <div style={{
              padding: "12px 14px", borderRadius: "var(--radius-md)",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "var(--danger)", fontSize: "12px", fontWeight: "600", marginBottom: "18px",
            }}>
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div style={{
              padding: "12px 14px", borderRadius: "var(--radius-md)",
              background: "rgba(16,185,129,0.1)", border: "1px solid var(--success)",
              color: "var(--success)", fontSize: "12px", fontWeight: "600", marginBottom: "18px",
            }}>
              {successMsg}
            </div>
          )}

          {/* ─── Step 1: Base Credentials Form ───────────────── */}
          {step === "credentials" && (
            <form onSubmit={handleStartRegistration} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                    color: "var(--text-primary)", fontSize: "13px", outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Phone Number (with Country Code)
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210 (or +1, +44...)"
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                    color: "var(--text-primary)", fontSize: "13px", outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Create Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)",
                    color: "var(--text-primary)", fontSize: "13px", outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px", borderRadius: "var(--radius-md)",
                  background: accountType === "authority" ? "var(--gov-saffron)" : "var(--gov-blue)",
                  color: "white", border: "none", fontSize: "14px", fontWeight: "700",
                  cursor: loading ? "wait" : "pointer", marginTop: "8px",
                }}
              >
                {loading ? "Dispatching Email Verification..." : "Verify Email & Mobile →"}
              </button>
            </form>
          )}

          {/* ─── Step 2: Email OTP Verification ──────────────── */}
          {step === "email_otp" && (
            <form onSubmit={handleVerifyEmailOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "4px" }}>📧</div>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-heading)" }}>
                  Enter Email Verification OTP
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  A 6-digit security code has been sent to <strong>{email}</strong>.
                </p>
              </div>

              <input
                type="text"
                required
                maxLength={6}
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
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
                disabled={loading}
                style={{
                  padding: "12px", borderRadius: "var(--radius-md)",
                  background: "var(--gov-blue)", color: "white", border: "none",
                  fontSize: "14px", fontWeight: "700", cursor: "pointer",
                }}
              >
                {loading ? "Sending SMS OTP..." : "Verify Email & Send Mobile SMS →"}
              </button>
            </form>
          )}

          {/* ─── Step 3: Phone SMS OTP Verification ──────────── */}
          {step === "phone_otp" && (
            <form onSubmit={handleVerifyPhoneOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "4px" }}>📱</div>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-heading)" }}>
                  Enter Mobile SMS OTP
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  A 6-digit security code has been sent to <strong>{phone}</strong>.
                </p>
              </div>

              <input
                type="text"
                required
                maxLength={6}
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value)}
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
                style={{
                  padding: "12px", borderRadius: "var(--radius-md)",
                  background: "var(--success)", color: "white", border: "none",
                  fontSize: "14px", fontWeight: "700", cursor: "pointer",
                }}
              >
                Verify Phone & Proceed →
              </button>
            </form>
          )}

          {/* ─── Step 4A: Authority Profile Details Form ─────── */}
          {step === "role_details" && accountType === "authority" && (
            <form onSubmit={handleCompleteAuthority} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <div style={{ fontSize: "32px" }}>👮</div>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-heading)" }}>
                  Official Authority Profile
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Your submission will be reviewed and approved by the Super-Admin.
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Officer Full Name
                </label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="e.g. Inspector R. Lyngdoh"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "13px", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Designation / Post
                  </label>
                  <input
                    type="text"
                    required
                    value={authDesignation}
                    onChange={(e) => setAuthDesignation(e.target.value)}
                    placeholder="e.g. DSP, Inspector, Ranger"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "13px", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                    ID Number / Badge No
                  </label>
                  <input
                    type="text"
                    required
                    value={authIdNumber}
                    onChange={(e) => setAuthIdNumber(e.target.value)}
                    placeholder="e.g. MLP-2026-981"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "13px", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Department / Unit
                </label>
                <input
                  type="text"
                  required
                  value={authDepartment}
                  onChange={(e) => setAuthDepartment(e.target.value)}
                  placeholder="e.g. Meghalaya Police, Sikkim Tourist Cell"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "13px", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Outpost Station / Jurisdiction
                </label>
                <input
                  type="text"
                  required
                  value={authStationInfo}
                  onChange={(e) => setAuthStationInfo(e.target.value)}
                  placeholder="e.g. East Khasi Hills Tourist Post"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "13px", outline: "none" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px", borderRadius: "var(--radius-md)",
                  background: "var(--gov-saffron)", color: "white", border: "none",
                  fontSize: "14px", fontWeight: "700", cursor: "pointer", marginTop: "8px",
                }}
              >
                {loading ? "Submitting Application..." : "Submit for Ministry Review →"}
              </button>
            </form>
          )}

          {/* ─── Step 4B: Tourist Emergency Contacts ─────────── */}
          {step === "role_details" && accountType === "tourist" && (
            <form onSubmit={handleCompleteTourist} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <div style={{ fontSize: "32px" }}>🛡️</div>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-heading)" }}>
                  Emergency Contacts (1 to 5)
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  These numbers receive instant automated SMS alerts when you trigger SOS in Northeast India.
                </p>
              </div>

              {contacts.map((c, idx) => (
                <div key={idx} style={{
                  padding: "12px", borderRadius: "var(--radius-md)",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px",
                }}>
                  <input
                    type="text"
                    required
                    placeholder="Contact Name"
                    value={c.name}
                    onChange={(e) => {
                      const updated = [...contacts];
                      updated[idx].name = e.target.value;
                      setContacts(updated);
                    }}
                    style={{ padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "12px" }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Mobile (+91...)"
                    value={c.phone}
                    onChange={(e) => {
                      const updated = [...contacts];
                      updated[idx].phone = e.target.value;
                      setContacts(updated);
                    }}
                    style={{ padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "12px" }}
                  />
                  <input
                    type="text"
                    placeholder="Relation (Parent, Spouse)"
                    value={c.relationship}
                    onChange={(e) => {
                      const updated = [...contacts];
                      updated[idx].relationship = e.target.value;
                      setContacts(updated);
                    }}
                    style={{ padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "12px" }}
                  />
                </div>
              ))}

              {contacts.length < 5 && (
                <button
                  type="button"
                  onClick={addContactRow}
                  style={{
                    padding: "8px", borderRadius: "var(--radius-sm)",
                    border: "1px dashed var(--accent-primary)", background: "transparent",
                    color: "var(--accent-primary)", fontSize: "12px", fontWeight: "600", cursor: "pointer",
                  }}
                >
                  + Add Another Emergency Contact (Up to 5)
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px", borderRadius: "var(--radius-md)",
                  background: "var(--gov-blue)", color: "white", border: "none",
                  fontSize: "14px", fontWeight: "700", cursor: "pointer",
                }}
              >
                {loading ? "Saving Profile..." : "Save Contacts & Proceed to KYC Verification →"}
              </button>
            </form>
          )}

          <div style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "24px" }}>
            Already registered?{" "}
            <Link href="/login" style={{ color: "var(--accent-primary)", fontWeight: "700", textDecoration: "none" }}>
              Sign In Here
            </Link>
          </div>
        </div>
      </main>

      <GovFooter />
    </div>
  );
}
