import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  Database,
  FileCheck2,
  FileText,
  GitBranch,
  Hand,
  Maximize,
  Minus,
  MousePointer2,
  Play,
  Plus,
  Save,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Inspector, PageHeading, Status } from "./shared";
import { useStudio } from "./store";
const baseNodes = [
  {
    id: "input",
    name: "Task input",
    type: "TRIGGER",
    sub: "On demand · JSON schema",
    x: 38,
    y: 217,
    icon: Zap,
  },
  {
    id: "research",
    name: "Research Analyst",
    type: "AGENT",
    sub: "Claude Sonnet 4.5",
    x: 274,
    y: 115,
    icon: Bot,
  },
  {
    id: "knowledge",
    name: "Knowledge retrieval",
    type: "CONTEXT",
    sub: "Product intelligence · top 8",
    x: 274,
    y: 324,
    icon: Database,
  },
  {
    id: "analysis",
    name: "Synthesize findings",
    type: "AGENT",
    sub: "GPT-5 · structured output",
    x: 510,
    y: 115,
    icon: Bot,
  },
  {
    id: "review",
    name: "Quality checkpoint",
    type: "POLICY",
    sub: "Groundedness ≥ 0.95",
    x: 510,
    y: 324,
    icon: ShieldCheck,
  },
  {
    id: "output",
    name: "Publish artifact",
    type: "OUTPUT",
    sub: "Report + evidence bundle",
    x: 732,
    y: 217,
    icon: FileText,
  },
];
export function GraphView({ graphs = false }: { graphs?: boolean }) {
  const { notify, addRun } = useStudio();
  const [selected, setSelected] = useState<string | null>("research");
  const [zoom, setZoom] = useState(1);
  const [tab, setTab] = useState("Nodes");
  const [graph, setGraph] = useState("Research & synthesis");
  const [tool, setTool] = useState("select");
  const [nodes, setNodes] = useState(baseNodes);
  const [model, setModel] = useState("Claude Sonnet 4.5");
  const [temperature, setTemperature] = useState("0.3");
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState<{ x: number; y: number; left: number; top: number } | null>(null);
  const fitCanvas = () => {
    const stage = stageRef.current;
    if (!stage) return;
    setZoom(Math.max(0.32, Math.min(1, (stage.clientWidth - 26) / 930)));
    stage.scrollTo(0, 0);
  };
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => fitCanvas());
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);
  const node = nodes.find((n) => n.id === selected);
  return (
    <>
      <PageHeading
        title={graphs ? "Graphs & orchestration" : "Workbench"}
        description="Design autonomous workflows. Inspect every decision."
      >
        <Button
          variant="outline"
          className="secondary-action"
          onClick={() => notify("Graph saved · new version v1.5 created")}
        >
          <Save />
          Save
        </Button>
        <Button
          onClick={() => {
            addRun(graph, "Research Analyst");
            notify("Graph execution started · 6 nodes queued");
          }}
        >
          <Play />
          Run graph
        </Button>
      </PageHeading>
      {graphs && (
        <div className="graph-catalog">
          {["Research & synthesis", "Code review pipeline", "Revenue reconciliation"].map(
            (g, i) => (
              <Button
                variant="ghost"
                key={g}
                className={graph === g ? "selected" : ""}
                onClick={() => {
                  setGraph(g);
                  setNodes(
                    baseNodes.map((n) => ({
                      ...n,
                      name:
                        g === "Code review pipeline" && n.id === "research"
                          ? "Code Engineer"
                          : g === "Revenue reconciliation" && n.id === "research"
                            ? "Data Specialist"
                            : baseNodes.find((b) => b.id === n.id)?.name || n.name,
                    })),
                  );
                }}
              >
                <GitBranch className="mb-2" />
                {g}
                <small>
                  {6 + i} nodes · v1.{4 - i} · Deployed
                </small>
              </Button>
            ),
          )}
        </div>
      )}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <GitBranch size={15} className="blue-text" />
          <strong className="text-xs truncate">{graph}</strong>
          <span className="section-detail">v1.4</span>
        </div>
        <Status value="Active" />
      </div>
      <div className="canvas-layout">
        <div
          className="canvas-stage"
          ref={stageRef}
          onPointerDown={(e) => {
            if (tool !== "hand" || (e.target as HTMLElement).closest(".canvas-toolbar")) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            setPan({ x: e.clientX, y: e.clientY, left: e.currentTarget.scrollLeft, top: e.currentTarget.scrollTop });
          }}
          onPointerMove={(e) => {
            if (pan) {
              e.currentTarget.scrollLeft = pan.left - (e.clientX - pan.x);
              e.currentTarget.scrollTop = pan.top - (e.clientY - pan.y);
            }
            if (drag) {
              const rect = e.currentTarget.getBoundingClientRect();
              setNodes((prev) =>
                prev.map((n) =>
                  n.id === drag.id
                    ? {
                        ...n,
                        x: Math.max(
                          0,
                          (e.clientX - rect.left + e.currentTarget.scrollLeft) / zoom - drag.dx,
                        ),
                        y: Math.max(
                          55,
                          (e.clientY - rect.top + e.currentTarget.scrollTop) / zoom - drag.dy,
                        ),
                      }
                    : n,
                ),
              );
            }
          }}
          onPointerUp={() => { setDrag(null); setPan(null); }}
          onPointerCancel={() => { setDrag(null); setPan(null); }}
        >
          <div className="canvas-toolbar">
            <Button
              variant={tool === "select" ? "secondary" : "ghost"}
              size="icon"
              title="Select nodes"
              aria-label="Select nodes"
              onClick={() => setTool("select")}
            >
              <MousePointer2 />
            </Button>
            <Button
              variant={tool === "hand" ? "secondary" : "ghost"}
              size="icon"
              title="Pan canvas"
              aria-label="Pan canvas"
              onClick={() => {
                setTool("hand");
              }}
            >
              <Hand />
            </Button>
            <span className="topbar-divider mx-1 mt-1" />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Zoom out"
              title="Zoom out"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            >
              <Minus />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Zoom in"
              title="Zoom in"
              onClick={() => setZoom((z) => Math.min(1.3, z + 0.1))}
            >
              <Plus />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Fit canvas"
              title="Fit canvas"
              onClick={fitCanvas}
            >
              <Maximize />
            </Button>
          </div>
          <div className="flow-canvas" style={{ transform: `scale(${zoom})` }}>
            <svg>
              <defs>
                <marker
                  id="flow-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M0 0L10 5L0 10" fill="var(--primary)" />
                </marker>
              </defs>
              {[
                ["input", "research"],
                ["input", "knowledge"],
                ["research", "analysis"],
                ["knowledge", "analysis"],
                ["analysis", "review"],
                ["review", "output"],
                ["analysis", "output"],
              ].map(([from, to]) => {
                const a = nodes.find((n) => n.id === from),
                  b = nodes.find((n) => n.id === to);
                return a && b ? (
                  <path
                    key={`${from ?? ""}-${to ?? ""}`}
                    d={`M${a.x + 174} ${a.y + 43} C${a.x + 210} ${a.y + 43},${b.x - 45} ${b.y + 43},${b.x} ${b.y + 43}`}
                    markerEnd="url(#flow-arrow)"
                  />
                ) : null;
              })}
            </svg>
            {nodes.map((n) => (
              <Button
                variant="ghost"
                className={`flow-node ${selected === n.id ? "chosen" : ""}`}
                key={n.id}
                style={{ left: n.x, top: n.y }}
                onClick={() => setSelected(n.id)}
                onPointerDown={(e) => {
                  if (tool === "select") {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDrag({
                      id: n.id,
                      dx: (e.clientX - rect.left) / zoom,
                      dy: (e.clientY - rect.top) / zoom,
                    });
                  }
                }}
              >
                <div className="flow-node-top">
                  <n.icon />
                  <span>{n.type}</span>
                  <span className="health-dot" />
                </div>
                <h3>{n.name}</h3>
                <p>{n.sub}</p>
              </Button>
            ))}
          </div>
          <div className="canvas-bottom">
            <span>{Math.round(zoom * 100)}%</span>
            <span>6 nodes · 7 connections</span>
            <span>All changes saved</span>
          </div>
          <div className="canvas-minimap">
            <svg viewBox="0 0 150 70">
              {nodes.map((n) => (
                <rect key={n.id} x={n.x / 7} y={n.y / 7} width="22" height="12" rx="2" />
              ))}
            </svg>
          </div>
        </div>
        {node && (
          <Inspector
            title={node.name}
            subtitle={`node_${node.id} · ${node.type.toLowerCase()}`}
            onClose={() => setSelected(null)}
          >
            <div className="inspector-content">
              <div>
                <div className="tabs">
                  {["Nodes", "Config", "Output"].map((t) => (
                    <Button
                      variant="ghost"
                      key={t}
                      className={tab === t ? "selected" : ""}
                      onClick={() => setTab(t)}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
                {tab === "Output" ? (
                  <div className="code-block">
                    {
                      '{\n  "status": "ready",\n  "output": {\n    "claims": [],\n    "evidence": [],\n    "confidence": 0.98\n  }\n}'
                    }
                  </div>
                ) : (
                  <>
                    <div className="form-field">
                      <label>Node name</label>
                      <input
                        value={node.name}
                        onChange={(e) =>
                          setNodes((prev) =>
                            prev.map((n) =>
                              n.id === node.id ? { ...n, name: e.target.value } : n,
                            ),
                          )
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Model</label>
                      <select value={model} onChange={(e) => setModel(e.target.value)}>
                        <option>Claude Sonnet 4.5</option>
                        <option>GPT-5</option>
                        <option>Gemini 2.5 Pro</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>System instructions</label>
                      <textarea
                        defaultValue="Research the assigned topic. Prioritize primary sources and attach evidence to every claim."
                        rows={4}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Temperature</label>
                        <input
                          type="number"
                          min="0"
                          max="2"
                          step=".1"
                          value={temperature}
                          onChange={(e) => setTemperature(e.target.value)}
                        />
                      </div>
                      <div className="form-field">
                        <label>Max tokens</label>
                        <input type="number" defaultValue={8192} />
                      </div>
                    </div>
                    <div className="node-config-title">CONNECTED TOOLS</div>
                    <div className="key-value">
                      <span>web.search</span>
                      <Status value="Active" />
                    </div>
                    <div className="key-value">
                      <span>knowledge.retrieve</span>
                      <Status value="Active" />
                    </div>
                    <Button
                      variant="outline"
                      className="mt-5 button-wide"
                      onClick={() => notify("Node configuration saved")}
                    >
                      <Check />
                      Apply changes
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Inspector>
        )}
      </div>
    </>
  );
}