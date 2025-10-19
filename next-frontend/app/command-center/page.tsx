"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  TrendingUp,
  Zap,
  Mic,
  Volume2,
  Radio,
} from "lucide-react";

interface Threat {
  id: string | number;
  rival_id: string;
  turn: number;
  risk_attack_now: number;
  recommendation: string;
  why: string[];
  ts: number;
  ttl_ms?: number;
}

export default function CommandCenterPage() {
  // Sample threat data - replace with your actual data source
  const [threats] = useState<Threat[]>([
    // Add your threat alerts here
    // Example: { id: 1, rival_id: "RIVAL-001", turn: 5, risk_attack_now: 0.8, recommendation: "Deploy countermeasures", why: ["Suspicious activity"], ts: Date.now() }
  ]);

  // Voice indicator state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceLevel, setVoiceLevel] = useState<number>(0);
  const [lastCommand, setLastCommand] = useState<string>("");

  const activeThreats: number = threats.length;
  const avgRisk: number =
    threats.length > 0
      ? Math.round(
          (threats.reduce((acc, t) => acc + t.risk_attack_now, 0) /
            threats.length) *
            100
        )
      : 0;

  // Simulate voice activity
  useEffect(() => {
    const interval = setInterval(() => {
      if (isListening) {
        setVoiceLevel(Math.random() * 100);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isListening]);

  // Simulate voice commands
  useEffect(() => {
    if (isSpeaking) {
      const commands: string[] = [
        "Defend inside at Turn 12",
        "ERS deployment in Sector 3",
        "Watch RBR_1 closing rate",
        "Tire temperatures optimal",
      ];

      const timer = setTimeout(() => {
        setLastCommand(commands[Math.floor(Math.random() * commands.length)]);
        setIsSpeaking(false);
      }, 2000 + Math.random() * 1000);

      return () => clearTimeout(timer);
    }
  }, [isSpeaking]);

  const handleVoiceToggle = (): void => {
    setIsListening(!isListening);
    if (!isListening) {
      setVoiceLevel(0);
      setLastCommand("");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Threat Analysis Overview */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              THREAT ANALYSIS
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Threat Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-neutral-800 rounded">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap size={16} className="text-cyan-400" />
                  <div className="text-xs text-neutral-400">Active</div>
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  {activeThreats}
                </div>
              </div>
              <div className="text-center p-3 bg-neutral-800 rounded">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp size={16} className="text-orange-400" />
                  <div className="text-xs text-neutral-400">Avg Risk</div>
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  {avgRisk}%
                </div>
              </div>
            </div>

            {/* Status Display */}
            {activeThreats === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <div className="text-6xl mb-3">🌌</div>
                <p className="text-sm text-neutral-400 text-center">
                  All clear. Monitoring rivals...
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {threats.slice(0, 5).map((threat, index) => (
                  <div
                    key={threat.id || index}
                    className="flex items-center justify-between p-2 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          threat.risk_attack_now > 0.7
                            ? "bg-red-500"
                            : threat.risk_attack_now > 0.4
                            ? "bg-orange-500"
                            : "bg-green-500"
                        }`}
                      ></div>
                      <div>
                        <div className="text-xs text-white font-mono">
                          {threat.rival_id}
                        </div>
                        <div className="text-xs text-neutral-500">
                          Turn {threat.turn}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        size={14}
                        className={
                          threat.risk_attack_now > 0.7
                            ? "text-red-500"
                            : threat.risk_attack_now > 0.4
                            ? "text-orange-500"
                            : "text-green-500"
                        }
                      />
                      <span className="text-xs text-white font-mono">
                        {Math.round(threat.risk_attack_now * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Threats Section */}
            <div className="mt-6 pt-4 border-t border-neutral-700">
              <div className="text-xs font-medium text-neutral-400 mb-3 tracking-wider">
                RECENT THREATS
              </div>
              {threats.length === 0 ? (
                <div className="text-xs text-neutral-500 text-center py-2">
                  No recent threats detected
                </div>
              ) : (
                <div className="space-y-2">
                  {threats
                    .slice(-3)
                    .reverse()
                    .map((threat, index) => (
                      <div
                        key={`recent-${threat.id || index}`}
                        className="flex items-center justify-between text-xs p-2 bg-neutral-800/50 rounded"
                      >
                        <span className="text-neutral-500 font-mono">
                          {new Date(threat.ts).toLocaleTimeString()}
                        </span>
                        <span className="text-cyan-400 font-mono">
                          {threat.rival_id}
                        </span>
                        <span className="text-white font-mono">
                          T{threat.turn}
                        </span>
                        <span className="text-white font-mono">
                          {Math.round(threat.risk_attack_now * 100)}%
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              ACTIVITY LOG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {[
                {
                  time: "25/06/2025 09:29",
                  agent: "gh0st_Fire",
                  action: "completed mission in",
                  location: "Berlin",
                  target: "zer0_Nigh",
                },
                {
                  time: "25/06/2025 08:12",
                  agent: "dr4g0n_V3in",
                  action: "extracted high-value target in",
                  location: "Cairo",
                  target: null,
                },
                {
                  time: "24/06/2025 22:55",
                  agent: "sn4ke_Sh4de",
                  action: "lost communication in",
                  location: "Havana",
                  target: null,
                },
                {
                  time: "24/06/2025 21:33",
                  agent: "ph4nt0m_R4ven",
                  action: "initiated surveillance in",
                  location: "Tokyo",
                  target: null,
                },
                {
                  time: "24/06/2025 19:45",
                  agent: "v0id_Walk3r",
                  action: "compromised security in",
                  location: "Moscow",
                  target: "d4rk_M4trix",
                },
              ].map((log, index) => (
                <div
                  key={index}
                  className="text-xs border-l-2 border-cyan-400 pl-3 hover:bg-neutral-800 p-2 rounded transition-colors"
                >
                  <div className="text-neutral-500 font-mono">{log.time}</div>
                  <div className="text-white">
                    Agent{" "}
                    <span className="text-cyan-400 font-mono">{log.agent}</span>{" "}
                    {log.action}{" "}
                    <span className="text-white font-mono">{log.location}</span>
                    {log.target && (
                      <span>
                        {" "}
                        with agent{" "}
                        <span className="text-cyan-400 font-mono">
                          {log.target}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Voice Indicator */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              VOICE COMMAND
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            {/* Voice Toggle Button */}
            <button
              onClick={handleVoiceToggle}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? "bg-cyan-500/20 border-2 border-cyan-400"
                  : "bg-neutral-800 border-2 border-neutral-700"
              }`}
            >
              <Mic
                size={32}
                className={isListening ? "text-cyan-400" : "text-neutral-500"}
              />
              {isListening && (
                <div className="absolute inset-0 border-2 border-cyan-400 rounded-full animate-ping opacity-75"></div>
              )}
            </button>

            {/* Voice Status */}
            <div className="text-center">
              <div className="text-xs text-neutral-400 mb-2">
                {isListening ? "Listening..." : "Voice Off"}
              </div>

              {/* Voice Level Bars */}
              {isListening && (
                <div className="flex items-end justify-center gap-1 h-12">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 rounded-full transition-all duration-100"
                      style={{
                        height: `${Math.max(
                          10,
                          voiceLevel > (i + 1) * 20 ? voiceLevel : 10
                        )}%`,
                        backgroundColor:
                          voiceLevel > (i + 1) * 20
                            ? voiceLevel > 66
                              ? "#ff4444"
                              : voiceLevel > 33
                              ? "#ffaa00"
                              : "#44ff44"
                            : "#333",
                      }}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            {/* Speaking Indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 rounded-full border border-cyan-400">
                <Volume2 size={16} className="text-cyan-400 animate-pulse" />
                <span className="text-xs text-cyan-400">Speaking</span>
              </div>
            )}

            {/* Last Command */}
            {lastCommand && (
              <div className="w-full p-3 bg-neutral-800 rounded border border-neutral-700">
                <div className="flex items-start gap-2 mb-1">
                  <Radio size={14} className="text-cyan-400 mt-0.5" />
                  <span className="text-xs text-neutral-400">
                    Last Command:
                  </span>
                </div>
                <div className="text-xs text-white font-mono pl-5">
                  "{lastCommand}"
                </div>
              </div>
            )}

            {/* Voice Settings */}
            <button
              className="text-lg hover:scale-110 transition-transform"
              title="Voice Settings"
            >
              ⚙️
            </button>
          </CardContent>
        </Card>

        {/* Mission Activity Chart */}
        <Card className="lg:col-span-8 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              MISSION ACTIVITY OVERVIEW
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 relative">
              {/* Chart Grid */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-20">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-neutral-700"></div>
                ))}
              </div>

              {/* Chart Line */}
              <svg className="absolute inset-0 w-full h-full">
                <polyline
                  points="0,120 50,100 100,110 150,90 200,95 250,85 300,100 350,80"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                />
                <polyline
                  points="0,140 50,135 100,130 150,125 200,130 250,135 300,125 350,120"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-neutral-500 -ml-5 font-mono">
                <span>500</span>
                <span>400</span>
                <span>300</span>
                <span>200</span>
              </div>

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-neutral-500 -mb-6 font-mono">
                <span>Jan 28, 2025</span>
                <span>Feb 28, 2025</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mission Information */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              MISSION INFORMATION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-xs text-white font-medium">
                    Successful Missions
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">High Risk Mission</span>
                    <span className="text-white font-bold font-mono">190</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">
                      Medium Risk Mission
                    </span>
                    <span className="text-white font-bold font-mono">426</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Low Risk Mission</span>
                    <span className="text-white font-bold font-mono">920</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-red-500 font-medium">
                    Failed Missions
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">High Risk Mission</span>
                    <span className="text-white font-bold font-mono">190</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">
                      Medium Risk Mission
                    </span>
                    <span className="text-white font-bold font-mono">426</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Low Risk Mission</span>
                    <span className="text-white font-bold font-mono">920</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
