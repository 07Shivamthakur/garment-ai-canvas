import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { loadSession, clearSession } from "@/lib/auth";
import { normalizeDriveUrl, driveId } from "@/lib/drive";
import { CONFIG } from "@/lib/config";
import { Loader2, Upload, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

type FlowType = "1" | "2" | "3";

interface OutputResult {
  url: string;
  id: string;
}

export default function AgentInterface() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [authToken, setAuthToken] = useState("");
  
  const [flow, setFlow] = useState<FlowType>("1");
  const [email, setEmail] = useState("");
  const [outputFormat, setOutputFormat] = useState("Front");
  const [garmentType, setGarmentType] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"" | "ok" | "err">("");
  const [outputs, setOutputs] = useState<OutputResult[]>([]);
  
  const designImageRef = useRef<HTMLInputElement>(null);
  const garmentImage2Ref = useRef<HTMLInputElement>(null);
  const garmentImage3Ref = useRef<HTMLInputElement>(null);
  const modelImageRef = useRef<HTMLInputElement>(null);
  
  const [designPreview, setDesignPreview] = useState("");
  const [garment2Preview, setGarment2Preview] = useState("");
  const [garment3Preview, setGarment3Preview] = useState("");
  const [modelPreview, setModelPreview] = useState("");
  
  const inflightControllerRef = useRef<AbortController | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const softTimerRef = useRef<number | null>(null);
  const lastSubmitRef = useRef(0);

  useEffect(() => {
    const session = loadSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setLoginId(session.login_id);
    setAuthToken(session.auth_token);
  }, [navigate]);

  const handleLogout = () => {
    clearSession();
    navigate("/auth");
  };

  const handleFilePreview = (
    file: File | undefined,
    setPreview: (url: string) => void
  ) => {
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearTimers = () => {
    if (softTimerRef.current) clearTimeout(softTimerRef.current);
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    softTimerRef.current = null;
    pollTimerRef.current = null;
  };

  const markSuccess = (msg: string) => {
    clearTimers();
    inflightControllerRef.current = null;
    setIsSubmitting(false);
    setStatus(msg);
    setStatusType("ok");
  };

  const addOutput = (url: string) => {
    setOutputs((prev) => [{ url, id: Date.now().toString() }, ...prev]);
  };

  const startPolling = (statusUrl: string) => {
    const poll = async () => {
      try {
        const r = await fetch(statusUrl, { method: "GET" });
        const isJson = r.headers.get("content-type")?.includes("application/json");
        const data = isJson ? await r.json() : null;
        
        if (data && (data.output_url || data.OutputURL)) {
          addOutput(data.output_url || data.OutputURL);
          markSuccess("Success — output received and displayed.");
          return;
        }
        
        pollTimerRef.current = window.setTimeout(poll, CONFIG.POLL_INTERVAL_MS);
      } catch (e: any) {
        setStatus("Polling error: " + e.message);
        setStatusType("err");
        setIsSubmitting(false);
      }
    };
    poll();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    if (now - lastSubmitRef.current < CONFIG.RATE_LIMIT_MS) return;
    lastSubmitRef.current = now;
    
    setStatus("Preparing…");
    setStatusType("");
    setIsSubmitting(true);
    
    const fd = new FormData();
    fd.set("Filter", flow);
    fd.set("login_id", loginId);
    fd.set("auth_token", authToken);
    fd.set("Email", email);
    fd.set("OutputFormat", outputFormat);
    
    if (flow === "1") {
      fd.set("GarmentType", garmentType);
      if (designImageRef.current?.files?.[0]) {
        fd.set("design_image", designImageRef.current.files[0]);
      }
    } else if (flow === "2") {
      if (garmentImage2Ref.current?.files?.[0]) {
        fd.set("garment_image", garmentImage2Ref.current.files[0]);
      }
    } else if (flow === "3") {
      if (garmentImage3Ref.current?.files?.[0]) {
        fd.set("garment_image", garmentImage3Ref.current.files[0]);
      }
      if (modelImageRef.current?.files?.[0]) {
        fd.set("model_image", modelImageRef.current.files[0]);
      }
    }
    
    inflightControllerRef.current = new AbortController();
    softTimerRef.current = window.setTimeout(() => {
      if (status.startsWith("Preparing"))
        setStatus("This is taking longer than usual…");
    }, CONFIG.SOFT_NOTICE_MS);
    
    try {
      const res = await fetch(CONFIG.WEBHOOK_URL, {
        method: "POST",
        body: fd,
        signal: inflightControllerRef.current.signal,
      });
      
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await res.json();
        if (data.OutputURL || data.output_url) {
          addOutput(data.OutputURL || data.output_url);
          markSuccess("Success — output received and displayed.");
          return;
        }
        if (data.status_url) {
          setStatus("Queued — polling status…");
          startPolling(data.status_url);
          return;
        }
        markSuccess("Submitted to Make — awaiting processing in scenario.");
      } else {
        const text = await res.text();
        const url = (text.match(/https?:\/\/\S+/) || [])[0];
        if (url) {
          addOutput(url);
          markSuccess("Success — output link detected and displayed.");
        } else {
          markSuccess("Submitted to Make — awaiting processing in scenario.");
        }
      }
    } catch (err: any) {
      setStatus("Network error: " + err.message);
      setStatusType("err");
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (inflightControllerRef.current) inflightControllerRef.current.abort();
    clearTimers();
    setStatus("Canceled.");
    setStatusType("");
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setGarmentType("");
    setEmail("");
    setOutputFormat("Front");
    setDesignPreview("");
    setGarment2Preview("");
    setGarment3Preview("");
    setModelPreview("");
    if (designImageRef.current) designImageRef.current.value = "";
    if (garmentImage2Ref.current) garmentImage2Ref.current.value = "";
    if (garmentImage3Ref.current) garmentImage3Ref.current.value = "";
    if (modelImageRef.current) modelImageRef.current.value = "";
    setStatus("");
    setStatusType("");
  };


  return (
    <div className="min-h-screen">
      {/* Topbar */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-background/70 border-b border-primary/20">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center gap-3">
          <div className="font-bold">AI Garment Studio — Pro</div>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <div className="border border-border rounded-lg px-3 py-1.5 text-sm">
              {loginId}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto p-5">
        <div className="grid lg:grid-cols-[minmax(480px,720px)_1fr] gap-5">
          {/* Input Panel */}
          <Card className="p-4">
            <h2 className="text-2xl font-bold mb-4">Inputs</h2>
            
            {/* Flow Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={flow === "1" ? "default" : "outline"}
                size="sm"
                onClick={() => setFlow("1")}
                className="rounded-full"
              >
                Flow 1: Design → Garment
              </Button>
              <Button
                variant={flow === "2" ? "default" : "outline"}
                size="sm"
                onClick={() => setFlow("2")}
                className="rounded-full"
              >
                Flow 2: Garment → Model Render
              </Button>
              <Button
                variant={flow === "3" ? "default" : "outline"}
                size="sm"
                onClick={() => setFlow("3")}
                className="rounded-full"
              >
                Flow 3: Garment + Model → Exact Model
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email (optional)</Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <Label>Output Format</Label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-card text-foreground"
                  >
                    <option>Front</option>
                    <option>Front and Back</option>
                  </select>
                </div>
              </div>

              {/* Flow 1 */}
              {flow === "1" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Garment Type *</Label>
                    <Input
                      required
                      value={garmentType}
                      onChange={(e) => setGarmentType(e.target.value)}
                      placeholder="t-shirt, hoodie, saree"
                    />
                  </div>
                  <div>
                    <Label>Design Image *</Label>
                    <div className="border border-dashed border-border rounded-xl p-3 bg-card flex items-center justify-between">
                      {designPreview && (
                        <img
                          src={designPreview}
                          alt="Preview"
                          className="w-11 h-11 rounded-lg object-cover border border-border"
                        />
                      )}
                      <input
                        ref={designImageRef}
                        type="file"
                        accept="image/*"
                        required
                        className="hidden"
                        onChange={(e) =>
                          handleFilePreview(e.target.files?.[0], setDesignPreview)
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => designImageRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Browse
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Flow 2 */}
              {flow === "2" && (
                <div>
                  <Label>Garment Photo *</Label>
                  <div className="border border-dashed border-border rounded-xl p-3 bg-card flex items-center justify-between">
                    {garment2Preview && (
                      <img
                        src={garment2Preview}
                        alt="Preview"
                        className="w-11 h-11 rounded-lg object-cover border border-border"
                      />
                    )}
                    <input
                      ref={garmentImage2Ref}
                      type="file"
                      accept="image/*"
                      required
                      className="hidden"
                      onChange={(e) =>
                        handleFilePreview(e.target.files?.[0], setGarment2Preview)
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => garmentImage2Ref.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Browse
                    </Button>
                  </div>
                </div>
              )}

              {/* Flow 3 */}
              {flow === "3" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Garment Photo *</Label>
                    <div className="border border-dashed border-border rounded-xl p-3 bg-card flex items-center justify-between">
                      {garment3Preview && (
                        <img
                          src={garment3Preview}
                          alt="Preview"
                          className="w-11 h-11 rounded-lg object-cover border border-border"
                        />
                      )}
                      <input
                        ref={garmentImage3Ref}
                        type="file"
                        accept="image/*"
                        required
                        className="hidden"
                        onChange={(e) =>
                          handleFilePreview(e.target.files?.[0], setGarment3Preview)
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => garmentImage3Ref.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Browse
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Model Photo *</Label>
                    <div className="border border-dashed border-border rounded-xl p-3 bg-card flex items-center justify-between">
                      {modelPreview && (
                        <img
                          src={modelPreview}
                          alt="Preview"
                          className="w-11 h-11 rounded-lg object-cover border border-border"
                        />
                      )}
                      <input
                        ref={modelImageRef}
                        type="file"
                        accept="image/*"
                        required
                        className="hidden"
                        onChange={(e) =>
                          handleFilePreview(e.target.files?.[0], setModelPreview)
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => modelImageRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Browse
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isSubmitting ? "Submitting" : "Submit"}
                </Button>
                {isSubmitting && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
                <span className="text-sm text-muted-foreground">
                  Files are sent securely to Make via HTTPS.
                </span>
              </div>

              {status && (
                <div
                  className={`p-3 rounded-xl border min-h-[46px] ${
                    statusType === "ok"
                      ? "border-green-500/50"
                      : statusType === "err"
                      ? "border-destructive/50"
                      : "border-border"
                  }`}
                >
                  {status}
                </div>
              )}
            </form>
          </Card>

          {/* Output Panel */}
          <Card className="p-4">
            <h2 className="text-2xl font-bold mb-4">Output</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outputs.map((output) => (
                <OutputCard key={output.id} url={output.url} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OutputCard({ url }: { url: string }) {
  const normalized = normalizeDriveUrl(url);
  const [imgError, setImgError] = useState(false);
  const id = driveId(url);

  return (
    <div className="relative border border-border rounded-xl overflow-hidden bg-card">
      <a
        href={normalized}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-2 right-2 z-10"
      >
        <Button size="sm" variant="secondary">
          ↗ Open
        </Button>
      </a>
      {!imgError ? (
        <img
          src={normalized}
          alt="Result"
          className="w-full h-[330px] object-contain bg-card"
          onError={() => setImgError(true)}
        />
      ) : id ? (
        <iframe
          src={`https://drive.google.com/file/d/${id}/preview`}
          className="w-full h-[330px] border-0"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-[330px] flex items-center justify-center text-muted-foreground">
          Preview unavailable
        </div>
      )}
    </div>
  );
}
