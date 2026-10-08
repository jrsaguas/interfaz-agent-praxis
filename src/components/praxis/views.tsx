import { useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  CheckCheck,
  Clock,
  Database,
  Download,
  FileCheck2,
  FileText,
  Fingerprint,
  GitBranch,
  Globe,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { agents, catalog } from "./data";
import { useStudio } from "./store";
import { CloseButton, Inspector, PageHeading, RunTable, SectionHeading, Status } from "./shared";
import { GraphView } from "./graph";
export function SectionView({ section }: { section: string }) {
  if (section === "workbench" || section === "graphs")
    return <GraphView graphs={section === "graphs"} />;
  if (section === "agents") return <Agents />;
  if (section === "runs") return <Runs />;
  if (section === "approvals") return <Approvals />;
  if (section === "router") return <Router />;
  if (section === "knowledge") return <Knowledge />;
  if (section === "tools") return <Tools />;
  if (section === "observability") return <Observability />;
  if (section === "evidence") return <Evidence />;
  if (section === "architecture") return <Architecture />;
  if (section === "settings") return <Settings />;
  return <Catalog section={section} />;
}
function SearchBox({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search-input">
      <Search />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}
function Agents() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All agents");
  const [tab, setTab] = useState("All agents");
  const [selected, setSelected] = useState<(typeof agents)[number] | null>(null);
  const { setNewRun, notify } = useStudio();
  const [agentList, setAgentList] = useState(agents);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftModel, setDraftModel] = useState("Claude Sonnet 4.5");
  const openAgent = (a: (typeof agents)[number]) => {
    setSelected(a);
    setDraftName(a.name);
    setDraftDescription(a.description);
    setDraftModel(a.model);
  };
  const list = agentList.filter(
    (a) =>
      `${a.name} ${a.model}`.toLowerCase().includes(q.toLowerCase()) &&
      (status === "All agents" || a.status === status) &&
      (tab !== "Active" || a.status === "Active"),
  );
  return (
    <>
      <PageHeading title="Agents" description="Purpose-built intelligence. Ready to work.">
        <Button
          onClick={() => {
            const first = agents[0];
            if (first)
              openAgent({
                ...first,
                name: "Untitled agent",
                description: "Define a focused role for your agent.",
              });
          }}
        >
          <Plus />
          Create agent
        </Button>
      </PageHeading>
      <div className="tabs">
        {["All agents", "Active", "Templates"].map((t) => (
          <Button
            variant="ghost"
            className={tab === t ? "selected" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
            {t === "All agents" ? " · 6" : ""}
          </Button>
        ))}
      </div>
      <div className="filters">
        <SearchBox value={q} onChange={setQ} placeholder="Search agents..." />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Agent status"
        >
          <option>All agents</option>
          <option>Active</option>
          <option>Idle</option>
        </select>
        <span className="mono muted ml-auto">{list.length} agents</span>
      </div>
      <div className="agent-grid">
        {list.map((a) => (
          <article
            className="agent-card"
            key={a.name}
            onClick={() => openAgent(a)}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openAgent(a)}
          >
            <div className="agent-card-top">
              <span className={`agent-icon tone-${a.color}`}>
                <a.icon size={18} />
              </span>
              <Status value={a.status} />
            </div>
            <h3>{tab === "Templates" ? `${a.name} template` : a.name}</h3>
            <p>{a.description}</p>
            <div className="agent-card-meta">
              <span>{a.model}</span>
              <span>{a.tools} tools</span>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="mono muted">{a.runs.toLocaleString()} runs</span>
              <ArrowUpRight size={14} className="muted" />
            </div>
          </article>
        ))}
      </div>
      {!list.length && <div className="empty-state">No matching agents.</div>}
      {selected && (
        <>
          <div className="overlay" onClick={() => setSelected(null)} />
          <div className="detail-modal">
            <div className="detail-modal-head">
              <div>
                <span className="eyebrow">AGENT CONFIGURATION</span>
                <h2 className="mt-3">{selected.name}</h2>
              </div>
              <CloseButton onClick={() => setSelected(null)} />
            </div>
            <div className="form-field">
              <label>Name</label>
              <input
                aria-label="Agent name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Instructions</label>
              <textarea
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="form-field">
              <label>Model</label>
              <select value={draftModel} onChange={(e) => setDraftModel(e.target.value)}>
                <option>Claude Sonnet 4.5</option>
                <option>GPT-5</option>
                <option>Gemini 2.5 Pro</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelected(null);
                  setNewRun(true);
                }}
              >
                <Play />
                Run agent
              </Button>
              <Button
                disabled={!draftName.trim()}
                onClick={() => {
                  const updated = {
                    ...selected,
                    name: draftName.trim(),
                    description: draftDescription,
                    model: draftModel,
                  };
                  setAgentList((prev) =>
                    prev.some((a) => a.name === selected.name)
                      ? prev.map((a) => (a.name === selected.name ? updated : a))
                      : [...prev, updated],
                  );
                  notify("Agent configuration saved in this prototype session");
                  setSelected(null);
                }}
              >
                <Check />
                Save agent
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
function Runs() {
  const { runs, setNewRun, notify } = useStudio();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [tab, setTab] = useState("All runs");
  const list = runs.filter(
    (r) =>
      `${r.name} ${r.agent} ${r.id}`.toLowerCase().includes(q.toLowerCase()) &&
      (status === "All statuses" || r.status === status) &&
      (tab === "All runs" || (tab === "Live" ? r.status === "Running" : r.status === "Completed")),
  );
  return (
    <>
      <PageHeading
        title="Runs"
        description="Every execution, checkpoint, and outcome. In one timeline."
      >
        <Button
          variant="outline"
          className="secondary-action"
          onClick={() => {
            const blob = new Blob([JSON.stringify(runs, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "praxis-runs.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download />
          Export
        </Button>
        <Button onClick={() => setNewRun(true)}>
          <Plus />
          New run
        </Button>
      </PageHeading>
      <div className="tabs">
        {["All runs", "Live", "Completed"].map((t) => (
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
      <div className="filters">
        <SearchBox value={q} onChange={setQ} placeholder="Search runs, agents, or IDs..." />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Run status">
          {["All statuses", "Running", "Completed", "Needs approval", "Failed", "Rejected"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </select>
        <span className="mono muted ml-auto">{list.length} runs</span>
      </div>
      <section className="panel">
        <RunTable runs={list} />
      </section>
    </>
  );
}
function Approvals() {
  const { approvals, resolve } = useStudio();
  const [selected, setSelected] = useState("apr_01");
  const [tab, setTab] = useState("Pending");
  const [history, setHistory] = useState<{ title: string; status: string }[]>([]);
  const current = approvals.find((a) => a.id === selected) || approvals[0];
  return (
    <>
      <PageHeading title="Approvals" description="Human judgment at the moments that matter.">
        <span className="risk">
          <ShieldCheck size={12} />
          {approvals.length} awaiting review
        </span>
      </PageHeading>
      <div className="tabs">
        {["Pending", "Resolved"].map((t) => (
          <Button
            variant="ghost"
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
            {t === "Pending" ? ` · ${approvals.length}` : ` · ${history.length}`}
          </Button>
        ))}
      </div>
      {tab === "Resolved" ? (
        <div className="panel">
          {history.map((h, i) => (
            <div className="approval-mini" key={i}>
              <CheckCheck size={18} />
              <strong>{h.title}</strong>
              <span className="ml-auto">
                <Status value={h.status} />
              </span>
            </div>
          ))}
          {!history.length && (
            <div className="empty-state">No resolved actions in this session.</div>
          )}
        </div>
      ) : (
        <div className="inbox-layout">
          <div className="inbox-list">
            {approvals.map((a) => (
              <Button
                variant="ghost"
                className={`inbox-item ${current?.id === a.id ? "selected" : ""}`}
                key={a.id}
                onClick={() => setSelected(a.id)}
              >
                <div className="flex justify-between">
                  <span className="risk">{a.risk} risk</span>
                  <span className="mono muted">{a.age}</span>
                </div>
                <strong>{a.title}</strong>
                <p>{a.agent}</p>
                <p className="mono">{a.action}</p>
              </Button>
            ))}
            {!approvals.length && (
              <div className="empty-state">
                <CheckCheck className="mx-auto mb-3" />
                All caught up.
              </div>
            )}
          </div>
          <div className="inbox-detail">
            {current ? (
              <>
                <span className="eyebrow">HUMAN CHECKPOINT · {current.id}</span>
                <h2>{current.title}</h2>
                <p>
                  {current.agent} is requesting permission to perform an external write. Review the
                  proposed action and its supporting evidence.
                </p>
                <div className="key-value mt-5">
                  <span>Target</span>
                  <span>{current.detail}</span>
                </div>
                <div className="key-value">
                  <span>Policy</span>
                  <span>External write approval</span>
                </div>
                <div className="key-value">
                  <span>Risk level</span>
                  <span className="status-amber">{current.risk}</span>
                </div>
                <div className="node-config-title">PROPOSED ACTION</div>
                <pre className="code-block">
                  {JSON.stringify(
                    {
                      tool: current.action,
                      arguments:
                        current.id === "apr_01"
                          ? {
                              repository: "praxis/platform",
                              pull_request: 248,
                              merge_method: "squash",
                            }
                          : { destination: current.detail, verified: true },
                      checkpoint: "cp_92f4",
                      evidence_count: 4,
                    },
                    null,
                    2,
                  )}
                </pre>
                <div className="approval-actions">
                  <Button
                    onClick={() => {
                      setHistory((p) => [...p, { title: current.title, status: "Completed" }]);
                      resolve(current.id, true);
                    }}
                  >
                    <Check />
                    Approve action
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setHistory((p) => [...p, { title: current.title, status: "Rejected" }]);
                      resolve(current.id, false);
                    }}
                  >
                    <X />
                    Reject
                  </Button>
                </div>
                <p className="audit-line">
                  All decisions are recorded in the immutable audit trail.
                </p>
              </>
            ) : (
              <div className="empty-state">
                No pending approvals. Your agents are clear to proceed.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
function Catalog({ section }: { section: string }) {
  const data = catalog[section];
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [selected, setSelected] = useState<string[] | null>(null);
  const [tab, setTab] = useState("Overview");
  const [rows, setRows] = useState(data?.rows || []);
  const { notify } = useStudio();
  if (!data) return <PageHeading title="Not found" description="Choose a workspace section." />;
  const titles: Record<string, string> = {
    models: "Models & providers",
    policies: "Policies & permissions",
  };
  const title = titles[section] || section.charAt(0).toUpperCase() + section.slice(1);
  const list = rows.filter(
    (r) =>
      r.join(" ").toLowerCase().includes(q.toLowerCase()) &&
      (filter === "All statuses" || r[r.length - 1] === filter),
  );
  return (
    <>
      <PageHeading title={title} description={data.description}>
        <Button
          variant="outline"
          onClick={() => notify(`${title} refreshed · mock environment healthy`)}
        >
          <RefreshCw />
          Refresh
        </Button>
        {section === "evaluations" && (
          <Button onClick={() => notify("Evaluation completed · 98.2% pass rate across 120 cases")}>
            <Play />
            Run evaluation
          </Button>
        )}
      </PageHeading>
      <div className="tabs">
        {[
          "Overview",
          section === "policies" ? "Permissions" : section === "models" ? "Providers" : "Activity",
        ].map((t) => (
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
      {tab === "Overview" ? (
        <>
          <div className="filters">
            <SearchBox value={q} onChange={setQ} placeholder={`Search ${title.toLowerCase()}...`} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Catalog status"
            >
              <option>All statuses</option>
              {Array.from(new Set(rows.map((r) => r[r.length - 1]))).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <span className="mono muted ml-auto">{list.length} items</span>
          </div>
          <div className="panel catalog-layout">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    {data.columns.map((c) => (
                      <th key={c}>{c.toUpperCase()}</th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {list.map((r, i) => (
                    <tr
                      key={i}
                      tabIndex={0}
                      onClick={() => setSelected(r)}
                      onKeyDown={(e) => e.key === "Enter" && setSelected(r)}
                    >
                      {r.map((cell, j) => (
                        <td key={j}>
                          {j === r.length - 1 ? (
                            <Status value={cell} />
                          ) : j === 0 ? (
                            <div className="flex items-center gap-3">
                              <span className="run-glyph">
                                {section === "models" ? <Zap size={13} /> : <Database size={13} />}
                              </span>
                              <strong>{cell}</strong>
                            </div>
                          ) : (
                            cell
                          )}
                        </td>
                      ))}
                      <td>
                        <ArrowUpRight size={13} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!list.length && <div className="empty-state">No matching items.</div>}
            </div>
            {selected && (
              <Inspector
                title={selected[0] ?? "Resource"}
                subtitle={`${section} · workspace resource`}
                onClose={() => setSelected(null)}
              >
                <div className="inspector-content">
                  {data.columns.slice(1).map((c, i) => (
                    <div className="key-value" key={c}>
                      <span>{c}</span>
                      <span>{selected[i + 1]}</span>
                    </div>
                  ))}
                  <div className="node-config-title">GOVERNANCE</div>
                  <p>
                    Scoped to Acme workspace. Actions are recorded with evidence and policy
                    evaluation.
                  </p>
                  {["schedules", "policies"].includes(section) && (
                    <Button
                      variant="outline"
                      className="mt-5 button-wide"
                      onClick={() => {
                        const updated = [...selected];
                        updated[updated.length - 1] =
                          selected[selected.length - 1] === "Paused" ? "Active" : "Paused";
                        setRows((prev) => prev.map((r) => (r[0] === selected[0] ? updated : r)));
                        setSelected(updated);
                        notify(
                          `Resource ${(updated[updated.length - 1] ?? "Active").toLowerCase()}`,
                        );
                      }}
                    >
                      {selected[selected.length - 1] === "Paused" ? <Play /> : <Clock />}
                      {selected[selected.length - 1] === "Paused" ? "Resume" : "Pause"}
                    </Button>
                  )}
                  {section === "artifacts" && (
                    <Button
                      className="mt-5 button-wide"
                      onClick={() => {
                        const b = new Blob(
                          [
                            `# ${selected[0]}\n\nPRAXIS mock artifact\nCreated by ${selected[2]}\nEvidence verified.`,
                          ],
                          { type: "text/plain" },
                        );
                        const u = URL.createObjectURL(b);
                        const a = document.createElement("a");
                        a.href = u;
                        a.download = selected[0] + ".txt";
                        a.click();
                        URL.revokeObjectURL(u);
                      }}
                    >
                      <Download />
                      Download preview
                    </Button>
                  )}
                </div>
              </Inspector>
            )}
          </div>
        </>
      ) : tab === "Permissions" ? (
        <Permissions />
      ) : tab === "Providers" ? (
        <div className="panel">
          <SectionHeading title="Provider availability" detail="MOCK" />
          {["Anthropic", "OpenAI", "Google", "DeepSeek", "Local / Ollama"].map((p, i) => (
            <div className="approval-mini" key={p}>
              <Zap size={15} className="blue-text" />
              <strong>{p}</strong>
              <span className="ml-auto">
                <Status value={i === 4 ? "Offline" : "Healthy"} />
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel">
          <SectionHeading title="Resource activity" detail="AUDIT LOG" />
          {[
            "Health check completed",
            "Configuration reviewed by Ricardo",
            "Policy validation passed",
            "Resource initialized",
          ].map((a, i) => (
            <div className="approval-mini" key={a}>
              <Check size={15} className="text-success" />
              <div>
                <strong>{a}</strong>
                <p>Acme workspace · {i === 0 ? "Just now" : `${i * 12} minutes ago`}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
function Permissions() {
  const { notify } = useStudio();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  return (
    <div className="panel table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>CAPABILITY</th>
            {["Owner", "Operator", "Builder", "Viewer"].map((r) => (
              <th key={r}>{r.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {["Run agents", "Approve actions", "Edit graphs", "Manage policies", "View evidence"].map(
            (c, i) => (
              <tr key={c}>
                <td>{c}</td>
                {[0, 1, 2, 3].map((j) => {
                  const key = `${i}-${j}`;
                  const on =
                    enabled[key] ??
                    (j === 0 || i === 4 || (j === 1 && i < 2) || (j === 2 && [0, 2].includes(i)));
                  return (
                    <td key={j}>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`${c} permission for ${["Owner", "Operator", "Builder", "Viewer"][j]}`}
                        onClick={() => {
                          setEnabled((p) => ({ ...p, [key]: !on }));
                          notify("Permission updated in mock workspace");
                        }}
                      >
                        {on ? <Check size={15} className="text-success" /> : <X size={15} />}
                      </Button>
                    </td>
                  );
                })}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
function Router() {
  const [task, setTask] = useState("Analyze competitor positioning and cite primary sources.");
  const [strategy, setStrategy] = useState("Quality first");
  const [budget, setBudget] = useState(".50");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <PageHeading
        title="Intelligent router"
        description="The right model. Every request. Within your guardrails."
      >
        <span className="status status-green">
          <span />3 providers healthy
        </span>
      </PageHeading>
      <div className="router-layout">
        <section className="panel">
          <SectionHeading title="Routing topology" detail="policy-aware" />
          <div className="system-strip">
            <span>
              <ShieldCheck size={11} />
              Provider allowlist
            </span>
            <span>
              <DollarIcon />
              Budget cap: $5.00
            </span>
            <span>
              <Zap size={11} />
              Fallback enabled
            </span>
          </div>
          <div className="router-path">
            <div className="router-source">
              <GitBranch size={26} className="mx-auto blue-text" />
              <h3>PRAXIS Router</h3>
              <p>{strategy}</p>
              <p>Policy → score → route</p>
            </div>
            <div className="router-connector" />
            <div className="router-models">
              {[
                {
                  name: "Claude Sonnet 4.5",
                  meta: "Anthropic · 840 ms · $3.00 / 1M",
                  score: "98.2",
                },
                { name: "GPT-5", meta: "OpenAI · 720 ms · $1.25 / 1M", score: "96.8" },
                { name: "Gemini 2.5 Flash", meta: "Google · 320 ms · $0.30 / 1M", score: "91.4" },
              ].map((m) => (
                <div className={`router-option ${result === m.name ? "winner" : ""}`} key={m.name}>
                  <div className="flex justify-between gap-2">
                    <strong>{m.name}</strong>
                    <span className="mono muted">{m.score}</span>
                  </div>
                  <p>{m.meta}</p>
                  {result === m.name && <Status value="Active" />}
                </div>
              ))}
            </div>
          </div>
          <div className="chart-footer">
            <span>Weighted quality, latency, cost & availability</span>
            <span className="mono">router_v2.1</span>
          </div>
        </section>
        <aside className="router-form">
          <h2>Simulate a request</h2>
          <div className="form-field">
            <label>Task</label>
            <textarea rows={5} value={task} onChange={(e) => setTask(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Routing strategy</label>
            <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
              <option>Quality first</option>
              <option>Cost optimized</option>
              <option>Lowest latency</option>
              <option>Balanced</option>
            </select>
          </div>
          <div className="form-field">
            <label>Maximum cost ($)</label>
            <input
              type="number"
              min=".01"
              step=".01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          <Button
            className="button-wide"
            disabled={busy || !task.trim() || Number(budget) <= 0}
            onClick={() => {
              setBusy(true);
              setResult("");
              setTimeout(() => {
                setResult(
                  Number(budget) < 0.1 ||
                    strategy === "Cost optimized" ||
                    strategy === "Lowest latency"
                    ? "Gemini 2.5 Flash"
                    : strategy === "Balanced"
                      ? "GPT-5"
                      : "Claude Sonnet 4.5",
                );
                setBusy(false);
              }, 900);
            }}
          >
            <Play />
            {busy ? "Evaluating routes..." : "Simulate routing"}
          </Button>
          {result && (
            <div className="simulation-result">
              <strong>
                <Check size={13} className="inline mr-2" />
                Selected: {result}
              </strong>
              All policies passed.{" "}
              {strategy === "Quality first" && Number(budget) >= 0.1
                ? "Highest task-fit score with grounded research capability."
                : "Optimal trade-off within the configured budget."}
              <p className="mono mt-3">Decision: 12 ms · fallback ready</p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
function DollarIcon() {
  return <span>$</span>;
}
const docs = [
  { title: "PRAXIS product strategy", type: "Markdown", chunks: 42, date: "Oct 6, 2026" },
  { title: "Engineering handbook", type: "PDF", chunks: 128, date: "Oct 5, 2026" },
  { title: "Q4 competitive intelligence", type: "PDF", chunks: 86, date: "Oct 7, 2026" },
  { title: "API & integration reference", type: "Markdown", chunks: 64, date: "Oct 4, 2026" },
];
function Knowledge() {
  const [q, setQ] = useState("");
  const [doc, setDoc] = useState(
    docs[0] ?? {
      title: "PRAXIS product strategy",
      type: "Markdown",
      chunks: 42,
      date: "Oct 6, 2026",
    },
  );
  const [tab, setTab] = useState("Document");
  const { notify } = useStudio();
  return (
    <>
      <PageHeading title="Knowledge" description="Ground every decision in your source of truth.">
        <Button
          variant="outline"
          onClick={() => notify(`${doc.chunks} chunks re-indexed · embeddings up to date`)}
        >
          <RefreshCw />
          Re-index
        </Button>
      </PageHeading>
      <div className="filters">
        <SearchBox value={q} onChange={setQ} placeholder="Search your knowledge..." />
        <span className="mono muted">4 sources · 320 chunks</span>
      </div>
      <div className="doc-layout">
        <aside className="doc-list">
          <div className="eyebrow px-3 py-3">WORKSPACE SOURCES</div>
          {docs
            .filter((d) => d.title.toLowerCase().includes(q.toLowerCase()))
            .map((d) => (
              <Button
                variant="ghost"
                className={`doc-item ${d.title === doc.title ? "selected" : ""}`}
                key={d.title}
                onClick={() => setDoc(d)}
              >
                <FileText size={15} className="mb-2 text-primary" />
                {d.title}
                <small>
                  {d.type} · {d.chunks} chunks
                </small>
              </Button>
            ))}
        </aside>
        <article className="document">
          <div className="tabs">
            {["Document", "Chunks", "Metadata"].map((t) => (
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
          <span className="eyebrow">{doc.type.toUpperCase()} · VERIFIED SOURCE</span>
          <h2>{doc.title}</h2>
          <div className="doc-meta">
            <span>Updated {doc.date}</span>
            <span>{doc.chunks} chunks</span>
            <span className="text-success">Indexed</span>
          </div>
          {tab === "Metadata" ? (
            <>
              {[
                ["Source ID", "src_7f92a"],
                ["Collection", "Workspace knowledge"],
                ["Embedding model", "text-embedding-3-large"],
                ["Dimensions", "3,072"],
                ["Access", "All workspace agents"],
                ["Checksum", "sha256: 8f2a…19cb"],
              ].map(([k, v]) => (
                <div className="key-value" key={k}>
                  <span>{k}</span>
                  <span className="mono">{v}</span>
                </div>
              ))}
            </>
          ) : tab === "Chunks" ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div className="mb-5" key={i}>
                  <div className="eyebrow mb-2">
                    CHUNK {i} · {230 + i * 12} TOKENS
                  </div>
                  <p>
                    {i === 1
                      ? "PRAXIS provides a unified operating layer for autonomous agents. Every task is governed by policy, routed to the right model, and executed with verifiable evidence."
                      : i === 2
                        ? "Agents operate within explicit permission boundaries. External writes and sensitive operations require human approval at durable checkpoints."
                        : i === 3
                          ? "Context retrieval combines semantic workspace knowledge with scoped episodic memory. Each source includes provenance and freshness metadata."
                          : "Success is measured through task completion, groundedness, policy adherence, latency, and cost. Evaluation suites run independently of agent execution."}
                  </p>
                </div>
              ))}
            </>
          ) : (
            <>
              <p>Version 1.4 · Internal · Acme workspace</p>
              <h3>01 — Overview</h3>
              <p>
                {doc.title === "Engineering handbook"
                  ? "Engineering teams follow a policy-first approach. Changes require automated validation, evidence-backed review, and explicit ownership before merging."
                  : doc.title === "Q4 competitive intelligence"
                    ? "The agent infrastructure market is moving from standalone assistants toward operational platforms. Reliability, governance, and verifiable outcomes are becoming the primary differentiators."
                    : "PRAXIS is the operating layer for autonomous work. It brings agents, models, tools, and context into a single system designed for clarity, control, and measurable outcomes."}
              </p>
              <h3>02 — Core principles</h3>
              <ul>
                <li>
                  <strong>Accountable autonomy.</strong> Every action has an owner, a policy, and a
                  trace.
                </li>
                <li>
                  <strong>Context by design.</strong> Knowledge and memory are explicit, scoped
                  resources.
                </li>
                <li>
                  <strong>Evidence over confidence.</strong> Claims are grounded in verifiable
                  sources.
                </li>
                <li>
                  <strong>Human control.</strong> Durable checkpoints keep sensitive actions
                  reversible.
                </li>
              </ul>
              <h3>03 — Operational architecture</h3>
              <p>
                A task enters through the command layer, passes policy checks, and is routed to the
                most capable agent or graph. The runtime executes tool and model calls, captures
                evidence, and evaluates the result.
              </p>
              <div className="info-box mt-6">
                <Database size={16} />
                <span>
                  This source is available to 6 agents in the Acme workspace. Last retrieval: 2
                  minutes ago.
                </span>
              </div>
            </>
          )}
        </article>
      </div>
    </>
  );
}
const toolNames = [
  "GitHub MCP",
  "Browser runtime",
  "Python sandbox",
  "Notion MCP",
  "Filesystem",
  "Slack MCP",
];
function Tools() {
  const [selected, setSelected] = useState("GitHub MCP");
  const [command, setCommand] = useState("tools.list");
  const [history, setHistory] = useState<{ command: string; output: string }[]>([]);
  const [tab, setTab] = useState("Terminal");
  const [busy, setBusy] = useState(false);
  const execute = () => {
    if (!command.trim()) return;
    const c = command;
    setCommand("");
    setBusy(true);
    setTimeout(() => {
      setHistory((h) => [
        ...h,
        {
          command: c,
          output: c.includes("list")
            ? "✓ 6 tools available\n  search_repositories   read_file   create_pull_request\n  list_issues          get_diff    merge_pull_request"
            : c.includes("help")
              ? "Commands: tools.list, tools.test, help, clear"
              : c === "clear"
                ? ""
                : `✓ ${selected} · simulated execution complete\n  status: healthy\n  latency: 42 ms\n  policy: passed\n  credentials: mock (no external request)`,
        },
      ]);
      if (c === "clear") setHistory([]);
      setBusy(false);
    }, 500);
  };
  return (
    <>
      <PageHeading
        title="Tools & MCP"
        description="Give your agents capabilities. Keep every action governed."
      >
        <span className="status status-green">
          <span />6 mock connections
        </span>
      </PageHeading>
      <div className="tabs">
        {["Terminal", "Permissions"].map((t) => (
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
      {tab === "Permissions" ? (
        <Permissions />
      ) : (
        <div className="terminal-layout">
          <aside className="tool-list">
            {toolNames.map((t, i) => (
              <Button
                variant="ghost"
                className={`tool-row ${selected === t ? "selected" : ""}`}
                key={t}
                onClick={() => {
                  setSelected(t);
                  setHistory([]);
                }}
              >
                <span className={`agent-icon tone-${i % 2 ? "cyan" : "blue"}`}>
                  <Terminal size={15} />
                </span>
                <span>
                  {t}
                  <small>{i % 2 ? "Sandbox runtime" : "MCP server"} · Healthy</small>
                </span>
              </Button>
            ))}
          </aside>
          <section className="terminal">
            <div className="terminal-head">
              <span className="terminal-light" />
              <span className="terminal-light" />
              <span className="terminal-light" />
              <strong>{selected.toLowerCase().replaceAll(" ", "-")} — mock terminal</strong>
              <span className="ml-auto text-success">connected</span>
            </div>
            <div className="terminal-body">
              <p className="comment">PRAXIS tool runtime v0.9.4</p>
              <p className="comment">Transport: stdio · Protocol: MCP 2025-06-18</p>
              <p className="success mt-4">✓ {selected} initialized</p>
              <p className="success">✓ Policy gate: workspace scope verified</p>
              <p className="success">✓ Sandbox ready · no external credentials</p>
              <p className="comment mt-5">6 capabilities registered. Awaiting tool call.</p>
              {history.map((h, i) => (
                <div className="mt-5" key={i}>
                  <p>
                    <span className="prompt">praxis ❯ </span>
                    {h.command}
                  </p>
                  <pre className="success whitespace-pre-wrap">{h.output}</pre>
                </div>
              ))}
              {busy && <p className="comment mt-4">Executing in sandbox...</p>}
            </div>
            <form
              className="terminal-input"
              onSubmit={(e) => {
                e.preventDefault();
                execute();
              }}
            >
              <span>❯</span>
              <input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                aria-label="Terminal command"
                placeholder="Enter a tool command"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                aria-label="Execute command"
                disabled={busy}
              >
                <ArrowRight />
              </Button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
function Observability() {
  const [tab, setTab] = useState("Traces");
  const [selected, setSelected] = useState("run_8f2a");
  const { runs, notify } = useStudio();
  const spans = [
    ["task.receive", 0, 6, "12ms"],
    ["policy.evaluate", 6, 9, "24ms"],
    ["router.select", 12, 8, "12ms"],
    ["agent.research", 20, 65, "2.1s"],
    ["tool.web_search", 24, 20, "640ms"],
    ["knowledge.retrieve", 38, 12, "320ms"],
    ["model.synthesize", 52, 36, "1.2s"],
    ["checkpoint.validate", 88, 9, "42ms"],
  ];
  return (
    <>
      <PageHeading
        title="Observability"
        description="From the first token to the final decision. Nothing hidden."
      >
        <Button variant="outline" onClick={() => notify("Telemetry refreshed · 8 spans captured")}>
          <RefreshCw />
          Refresh
        </Button>
      </PageHeading>
      <div className="tabs">
        {["Traces", "Logs", "Metrics"].map((t) => (
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
      <div className="filters">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          aria-label="Trace run"
        >
          {runs.map((r) => (
            <option key={r.id} value={r.id}>
              {r.id} · {r.name}
            </option>
          ))}
        </select>
        <span className="mono muted ml-auto">OpenTelemetry · 100% sampled</span>
      </div>
      {tab === "Traces" ? (
        <div className="trace-layout">
          <section className="panel">
            <SectionHeading title="Execution waterfall" detail="8 spans" />
            <div className="waterfall">
              <div className="trace-scale">
                {["0ms", "500ms", "1s", "1.5s", "2s", "2.5s"].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              {spans.map(([name, offset, width, duration], i) => (
                <div className="trace-row" key={name}>
                  <span className="trace-label" style={{ paddingLeft: i > 3 ? 12 : 0 }}>
                    <Activity size={12} />
                    {name}
                  </span>
                  <div className="trace-track">
                    <div
                      className="trace-bar"
                      style={{ marginLeft: `${offset}%`, width: `${width}%` }}
                      title={`${name} · ${duration}`}
                    />
                  </div>
                  <span className="muted">{duration}</span>
                </div>
              ))}
            </div>
          </section>
          <aside className="panel">
            <SectionHeading title="Trace attributes" />
            <div className="inspector-content">
              {[
                ["Trace ID", "tr_29f7a3"],
                ["Run", selected],
                ["Total duration", "2.54s"],
                ["Model calls", "3"],
                ["Tool calls", "4"],
                ["Tokens", "18,420"],
                ["Cost", "$0.124"],
                ["Error rate", "0%"],
              ].map(([k, v]) => (
                <div className="key-value" key={k}>
                  <span>{k}</span>
                  <span className="mono">{v}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      ) : tab === "Logs" ? (
        <div className="terminal">
          <div className="terminal-head">Runtime event stream · {selected}</div>
          <div className="terminal-body">
            {[
              "Task received · schema validated",
              "Policy gate passed · 4 rules evaluated",
              "Router selected Claude Sonnet 4.5",
              "Knowledge retrieval · 8 chunks loaded",
              "Model inference started · 4,096 input tokens",
              "Tool web.search completed · 6 sources",
              "Evidence bundle created · hash verified",
              "Checkpoint committed · execution durable",
            ].map((l, i) => (
              <p key={l}>
                <span className="comment">10:04:{String(i * 3).padStart(2, "0")} </span>
                <span className="success">INFO </span>
                {l}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="metrics">
          {[
            ["P50 latency", "720 ms"],
            ["P99 latency", "2.4 s"],
            ["Throughput", "42 rpm"],
            ["Error rate", "0.4%"],
          ].map(([k, v]) => (
            <div className="metric" key={k}>
              <div className="metric-top">{k}</div>
              <div className="metric-number">{v}</div>
              <div className="metric-bottom">
                <span className="positive">Within target</span>
                <span>last 24 hours</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
function Evidence() {
  const [selected, setSelected] = useState("Competitive landscape analysis");
  const [tab, setTab] = useState("Provenance graph");
  const { notify } = useStudio();
  return (
    <>
      <PageHeading title="Evidence" description="A verifiable chain from source to outcome.">
        <Button
          variant="outline"
          onClick={() => notify("Evidence verified · 4 signatures valid · chain intact")}
        >
          <Fingerprint />
          Verify chain
        </Button>
      </PageHeading>
      <div className="filters">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          aria-label="Evidence bundle"
        >
          <option>Competitive landscape analysis</option>
          <option>Weekly revenue reconciliation</option>
          <option>Review authentication PR #248</option>
        </select>
        <Status value="Verified" />
      </div>
      <div className="tabs">
        {["Provenance graph", "Sources"].map((t) => (
          <Button
            variant="ghost"
            className={tab === t ? "selected" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </Button>
        ))}
      </div>
      {tab === "Provenance graph" ? (
        <section className="panel">
          <SectionHeading title={selected} detail="ev_29f7" />
          <div className="evidence-chain">
            {[
              { title: "Primary sources", sub: "6 URLs · captured & hashed", icon: Globe },
              { title: "Retrieved context", sub: "8 chunks · src_7f92a", icon: Database },
              { title: "Agent reasoning", sub: "3 model calls · traced", icon: Bot },
              { title: "Quality checkpoint", sub: "Groundedness: 98.2%", icon: ShieldCheck },
              { title: "Verified artifact", sub: "SHA-256 · signed bundle", icon: FileCheck2 },
            ].map((n, i) => (
              <div className="contents" key={n.title}>
                {i > 0 && (
                  <span className="evidence-arrow">
                    <ArrowRight size={22} />
                  </span>
                )}
                <div className="evidence-node">
                  <n.icon size={22} />
                  <h3>{n.title}</h3>
                  <p>{n.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="chart-footer">
            <span>All claims linked to primary evidence</span>
            <span className="text-success">Chain integrity: verified</span>
          </div>
        </section>
      ) : (
        <div className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>SOURCE</th>
                <th>TYPE</th>
                <th>CAPTURED</th>
                <th>CONFIDENCE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {[
                "Official product documentation",
                "Public pricing pages",
                "Product release changelogs",
                "Internal product strategy",
              ].map((s, i) => (
                <tr key={s}>
                  <td>{s}</td>
                  <td>{i === 3 ? "Knowledge" : "Web source"}</td>
                  <td>Oct 7, 10:02</td>
                  <td>98.{i + 1}%</td>
                  <td>
                    <Status value="Verified" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="panel mt-5">
        <SectionHeading title="Evidence manifest" />
        <pre className="code-block m-5">
          {JSON.stringify(
            {
              bundle: "ev_29f7",
              task: selected,
              claims: 24,
              grounded_claims: 24,
              sources: 6,
              artifact: "competitive-landscape-q4.pdf",
              hash: "sha256:8f2a9c…19cb4e",
              signature: "praxis-runtime-01",
              integrity: "verified",
            },
            null,
            2,
          )}
        </pre>
      </div>
    </>
  );
}
const architecture = [
  ["UI", "Command, canvas, and human review"],
  ["Task", "Structured intent and acceptance criteria"],
  ["Policy", "Permissions, budgets, and guardrails"],
  ["Router", "Capability-aware model selection"],
  ["Agent / Graph", "Specialists and orchestration"],
  ["Model / Tool", "Intelligence and governed actions"],
  ["Memory / Knowledge", "Scoped context and retrieval"],
  ["Runtime", "Isolated execution and state"],
  ["Checkpoint", "Durable, resumable human gates"],
  ["Evidence / Artifact", "Grounded claims and tangible output"],
  ["Trace / Evaluation", "Observable execution and quality"],
];
function Architecture() {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <>
      <PageHeading
        title="Architecture map"
        description="One operating system. An unbroken chain of accountability."
      >
        <span className="section-detail">PRAXIS SYSTEM v0.9</span>
      </PageHeading>
      <div className="architecture-grid">
        {architecture.map(([title, description], i) => (
          <Button
            variant="ghost"
            className="architecture-step"
            key={title}
            onClick={() => setSelected(i)}
          >
            <span className="step-num">{String(i + 1).padStart(2, "0")} / OPERATING LAYER</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </Button>
        ))}
      </div>
      <div className="info-box mt-5">
        <ShieldCheck size={18} />
        <span>
          Policy, permissions, and provenance are evaluated across every layer. Human checkpoints
          preserve control without breaking the execution chain.
        </span>
      </div>
      {selected !== null && (
        <>
          <div className="overlay" onClick={() => setSelected(null)} />
          <div className="detail-modal">
            <div className="detail-modal-head">
              <h2>{architecture[selected]?.[0]}</h2>
              <CloseButton onClick={() => setSelected(null)} />
            </div>
            <p>
              {architecture[selected]?.[1]}. This layer receives structured input from{" "}
              {selected > 0 ? architecture[selected - 1]?.[0] : "the operator"} and produces a
              verifiable handoff to{" "}
              {selected < 10 ? architecture[selected + 1]?.[0] : "the quality feedback loop"}.
            </p>
            <div className="key-value mt-5">
              <span>Boundary</span>
              <Status value="Verified" />
            </div>
            <div className="key-value">
              <span>Audit trail</span>
              <span>Immutable event stream</span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
function Settings() {
  const [tab, setTab] = useState("Workspace");
  const [name, setName] = useState("Acme workspace");
  const [toggles, setToggles] = useState([true, true, false, true]);
  const { notify } = useStudio();
  return (
    <>
      <PageHeading title="Settings" description="Your workspace. Your operating standards.">
        <Button onClick={() => notify("Workspace preferences saved for this session")}>
          <Check />
          Save changes
        </Button>
      </PageHeading>
      <div className="settings-layout">
        <aside className="settings-nav">
          {["Workspace", "Notifications", "Runtime", "Appearance"].map((t) => (
            <Button
              variant="ghost"
              className={tab === t ? "selected" : ""}
              key={t}
              onClick={() => setTab(t)}
            >
              {t}
            </Button>
          ))}
        </aside>
        <section className="settings-body">
          <h2>{tab} preferences</h2>
          {tab === "Workspace" ? (
            <>
              <div className="form-field">
                <label>Workspace name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Default timezone</label>
                  <select>
                    <option>UTC</option>
                    <option>America/Mexico_City</option>
                    <option>Europe/Madrid</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Currency</label>
                  <select>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
              </div>
            </>
          ) : tab === "Appearance" ? (
            <div className="info-box">
              <Zap size={18} />
              <span>PRAXIS Dark · Space Grotesk / Inter / JetBrains Mono · Royal blue accent</span>
            </div>
          ) : null}
          {(tab === "Notifications"
            ? ["Approval requests", "Run failures", "Daily digest", "Budget alerts"]
            : tab === "Runtime"
              ? [
                  "Checkpoint persistence",
                  "Automatic fallback",
                  "Verbose logging",
                  "Sandbox isolation",
                ]
              : tab === "Appearance"
                ? ["Reduced motion", "High contrast borders"]
                : [
                    "Human approval for external writes",
                    "Evidence capture",
                    "Public workspace discovery",
                    "Run telemetry",
                  ]
          ).map((t, i) => (
            <div className="setting-line" key={t}>
              <div>
                <strong>{t}</strong>
                <p>
                  {tab === "Runtime"
                    ? "Configure execution defaults for all workspace agents."
                    : tab === "Notifications"
                      ? "Notify workspace operators when this event occurs."
                      : "Apply this preference across your workspace."}
                </p>
              </div>
              <Button
                variant="ghost"
                className={`toggle ${toggles[i] ? "on" : ""}`}
                role="switch"
                aria-checked={toggles[i] ?? false}
                aria-label={t}
                onClick={() => setToggles((p) => p.map((v, j) => (i === j ? !v : v)))}
              />
            </div>
          ))}
          <div className="setting-line">
            <div>
              <strong>Environment</strong>
              <p>All connections and execution data are simulated.</p>
            </div>
            <span className="section-detail">FRONTEND PROTOTYPE</span>
          </div>
        </section>
      </div>
    </>
  );
}