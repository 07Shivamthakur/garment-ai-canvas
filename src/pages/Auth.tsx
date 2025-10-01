import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CONFIG } from "@/lib/config";
import { saveSession } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

type AuthMode = "signup" | "signin";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"ok" | "err" | "">("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("");
    setStatusType("");

    const fd = new FormData();
    if (mode === "signup") {
      fd.set("Name", name);
      fd.set("Email", email);
      fd.set("Phone", phone);
      fd.set("Password", password);
    } else {
      fd.set("Email", email);
      fd.set("Password", password);
    }

    try {
      const res = await fetch(CONFIG.AUTH_WEBHOOK, {
        method: "POST",
        body: fd,
      });

      const ct = res.headers.get("content-type") || "";
      const text = await res.text();

      // Handle "Accepted" response (missing webhook response module)
      if (text === "Accepted") {
        setStatus("⚠️ Add a 'Webhook Response' module in Make returning JSON with 'mode' field");
        setStatusType("err");
        setIsSubmitting(false);
        return;
      }

      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        setStatus("❌ Invalid response from webhook");
        setStatusType("err");
        setIsSubmitting(false);
        return;
      }

      // Success cases
      if (res.status === 200) {
        if (data.mode === "signin") {
          saveSession(email);
          setStatus("✅ Signin successful");
          setStatusType("ok");
          setTimeout(() => navigate("/agent"), 500);
          return;
        } else if (data.mode === "signup") {
          setStatus("✅ Signup successful — please sign in");
          setStatusType("ok");
          setMode("signin");
          setIsSubmitting(false);
          return;
        }
      }

      // Error cases
      if (res.status === 401 || data.error === "wrong_password") {
        setStatus("❌ Wrong password");
        setStatusType("err");
      } else if (res.status === 404 || data.error === "account_not_found") {
        setStatus("🔎 Account not found — go to signup");
        setStatusType("err");
      } else if (res.status === 409 || data.error === "account_exists") {
        setStatus("ℹ️ Account already exists — go to signin");
        setStatusType("err");
      } else {
        setStatus("❌ " + (data.error || "Unknown error"));
        setStatusType("err");
      }

      setIsSubmitting(false);
    } catch (err: any) {
      setStatus("❌ Network error: " + err.message);
      setStatusType("err");
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setStatus("");
    setStatusType("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">AI Garment Studio</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "signup" ? "Create your account" : "Sign in to continue"}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            type="button"
            variant={mode === "signin" ? "default" : "outline"}
            className="flex-1 rounded-full"
            onClick={() => {
              setMode("signin");
              resetForm();
            }}
          >
            Sign In
          </Button>
          <Button
            type="button"
            variant={mode === "signup" ? "default" : "outline"}
            className="flex-1 rounded-full"
            onClick={() => {
              setMode("signup");
              resetForm();
            }}
          >
            Sign Up
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ashish"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          <div>
            <Label>Email *</Label>
            <Input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label>Password *</Label>
            <Input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
          </div>

          {status && (
            <div
              className={`text-sm p-3 rounded-lg border ${
                statusType === "ok"
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {status}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === "signup" ? "Creating account..." : "Signing in..."}
              </>
            ) : mode === "signup" ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Secure authentication via Make.com webhook
        </p>
      </Card>
    </div>
  );
}
