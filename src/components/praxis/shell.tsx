import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  Command,
  GitBranch,
  Menu,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { sections, agents } from "./data";
import { useStudio } from "./store";
import { CloseButton, Status } from "./shared";
export function StudioShell() {
  const state = useStudio();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const section = sections.find((s) => `/${s.slug}` === path) || sections[0];
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [workspace, setWorkspace] = useState(false);
  return (
    <div className={`studio ${collapsed ? "collapsed" : ""} ${mobile ? "mobile-open" : ""}`}>
      {mobile && <div className="overlay mobile-scrim" onClick={() => setMobile(false)} />}
      <aside className="sidebar">
        <Link to="/" className="brand" aria-label="PRAXIS home">
          <span className="brand-mark" />
          <div className="brand-copy">
            <span className="brand-name">PRAXIS</span>
            <span className="brand-subtitle">AGENT OPERATING STUDIO</span>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="sidebar-collapse"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => {
            if (window.innerWidth < 701) setMobile(false);
            else setCollapsed((v) => !v);
          }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </Button>
        <Button
          variant="ghost"
          className="workspace-select"
          onClick={() => setWorkspace((v) => !v)}
        >
          <span className="workspace-avatar">A</span>
          <span className="text-left min-w-0">
            <strong>Acme workspace</strong>
            <small>
              Pro plan <span className="mx-1">·</span> 6 members
            </small>
          </span>
          <ChevronsUpDown size={11} className="muted" />
        </Button>
        {workspace && (
          <div className="workspace-menu">
            <span className="eyebrow">WORKSPACES</span>
            <Button variant="ghost" onClick={() => setWorkspace(false)}>
              <Check />
              Acme workspace
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                state.notify("Personal workspace selected · prototype shares mock data");
                setWorkspace(false);
              }}
            >
              Personal sandbox
            </Button>
          </div>
        )}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {sections.map((s, i) => (
            <div key={s.slug}>
              {(i === 0 || sections[i - 1]?.group !== s.group) && (
                <div className="nav-group">{s.group}</div>
              )}
              {s.slug ? (
                <Link
                  to="/$section"
                  params={{ section: s.slug }}
                  className="nav-item"
                  activeOptions={{ exact: true }}
                  title={s.label}
                  onClick={() => setMobile(false)}
                >
                  <s.icon />
                  <span>{s.label}</span>
                  {s.slug === "approvals" && state.approvals.length > 0 && (
                    <span className="nav-badge">{state.approvals.length}</span>
                  )}
                </Link>
              ) : (
                <Link
                  to="/"
                  className="nav-item"
                  activeOptions={{ exact: true }}
                  title={s.label}
                  onClick={() => setMobile(false)}
                >
                  <s.icon />
                  <span>{s.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="system-health">
            <span className="health-dot" />
            All systems operational
          </div>
          <Link to="/$section" params={{ section: "settings" }} className="profile">
            <span className="avatar">RA</span>
            <span>
              <strong>Ricardo Aguas</strong>
              <small>Workspace owner</small>
            </span>
            <MoreHorizontal size={15} className="muted" />
          </Link>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu />
            </Button>
            <span className="mobile-brand">PRAXIS</span>
            <span>Workspace</span>
            <ChevronRight size={11} />
            <span>Acme</span>
            <ChevronRight size={11} />
            <strong className="truncate">{section?.label ?? "Command Center"}</strong>
          </div>
          <div className="topbar-actions">
            <Button
              variant="ghost"
              className="palette-trigger"
              onClick={() => state.setPalette(true)}
              aria-label="Open command palette"
            >
              <Search size={13} />
              <span>Search anything...</span>
              <kbd>⌘ K</kbd>
            </Button>
            <span className="environment">
              <span className="health-dot" />
              Mock mode
            </span>
            <span className="topbar-divider" />
            <Button
              variant="ghost"
              size="icon"
              className="notification-btn"
              title="View approvals"
              aria-label="View notifications"
              asChild
            >
              <Link to="/$section" params={{ section: "approvals" }}>
                <Bell size={15} />
              </Link>
            </Button>
            <span className="avatar">RA</span>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
      {state.palette && <CommandPalette />}
      {state.newRun && <NewRun />}
      {state.selectedRun && <RunDetails />}
      {state.notice && (
        <div className="toast" role="status">
          <Check size={16} />
          {state.notice}
        </div>
      )}
    </div>
  );
}
function CommandPalette() {
  const { setPalette, setNewRun } = useStudio();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const results = sections.filter((s) => s.label.toLowerCase().includes(q.toLowerCase()));
  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    const links = ref.current?.querySelectorAll<HTMLElement>("[data-command]");
    links?.forEach((el, i) => el.classList.toggle("command-active", i === active));
  }, [active, q]);
  return (
    <>
      <div className="overlay" onClick={() => setPalette(false)} />
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(results.length, a + 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          }
          if (e.key === "Enter") {
            e.preventDefault();
            ref.current?.querySelectorAll<HTMLElement>("[data-command]")[active]?.click();
          }
        }}
      >
        <div className="palette-input">
          <Search size={19} className="muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pages or run a command..."
            aria-label="Search commands"
          />
          <kbd>esc</kbd>
        </div>
        <div className="palette-results" ref={ref}>
          <div className="palette-label">QUICK ACTIONS</div>
          <Button
            variant="ghost"
            data-command
            onClick={() => {
              setPalette(false);
              setNewRun(true);
            }}
          >
            <Plus />
            Start a new run<kbd className="ml-auto">N</kbd>
          </Button>
          <div className="palette-label">NAVIGATE</div>
          {results.map((s) =>
            s.slug ? (
              <Link
                data-command
                key={s.slug}
                to="/$section"
                params={{ section: s.slug }}
                onClick={() => setPalette(false)}
              >
                <s.icon />
                {s.label}
                <ArrowRight size={13} className="ml-auto" />
              </Link>
            ) : (
              <Link data-command key="home" to="/" onClick={() => setPalette(false)}>
                <s.icon />
                {s.label}
              </Link>
            ),
          )}
        </div>
        <div className="palette-foot">
          ↑ ↓ Navigate <span className="mx-3">↵ Open</span> esc Close
        </div>
      </div>
    </>
  );
}
function NewRun() {
  const { setNewRun, addRun } = useStudio();
  const [name, setName] = useState("");
  const [agent, setAgent] = useState("Research Analyst");
  const [budget, setBudget] = useState("5.00");
  return (
    <>
      <div className="overlay" onClick={() => setNewRun(false)} />
      <form
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="New run"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) addRun(name.trim(), agent);
        }}
      >
        <div className="drawer-head">
          <div>
            <span className="eyebrow">NEW EXECUTION</span>
            <h2>Start a new run</h2>
            <p>Define the outcome. Let your agents handle the work.</p>
          </div>
          <CloseButton onClick={() => setNewRun(false)} />
        </div>
        <div className="drawer-body">
          <div className="form-field">
            <label htmlFor="run-task">Task</label>
            <textarea
              autoFocus
              id="run-task"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What would you like to accomplish?"
              required
            />
            <small>Include your objective, context, and expected deliverable.</small>
          </div>
          <div className="form-field">
            <label htmlFor="run-agent">Agent</label>
            <select id="run-agent" value={agent} onChange={(e) => setAgent(e.target.value)}>
              {agents.map((a) => (
                <option key={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="run-budget">Budget limit ($)</label>
              <input
                id="run-budget"
                type="number"
                min=".01"
                step=".01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="run-priority">Priority</label>
              <select id="run-priority">
                <option>Normal</option>
                <option>High</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="run-context">Knowledge context</label>
            <select id="run-context">
              <option>Workspace knowledge</option>
              <option>Product intelligence</option>
              <option>Engineering handbook</option>
              <option>No context</option>
            </select>
          </div>
          <div className="info-box">
            <ShieldCheck size={18} />
            <span>
              Workspace policies apply automatically. External writes pause for your approval.
              Evidence and traces are captured throughout the run.
            </span>
          </div>
          <div className="key-value mt-5">
            <span>Execution environment</span>
            <span className="mono">Mock sandbox</span>
          </div>
          <div className="key-value">
            <span>Checkpointing</span>
            <span className="text-success">Enabled</span>
          </div>
        </div>
        <div className="drawer-foot">
          <Button type="button" variant="outline" onClick={() => setNewRun(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim() || Number(budget) <= 0}>
            <Play />
            Start run
          </Button>
        </div>
      </form>
    </>
  );
}
function RunDetails() {
  const { selectedRun, runs, setSelectedRun, notify } = useStudio();
  const [tab, setTab] = useState("Timeline");
  const run = runs.find((r) => r.id === selectedRun?.id) || selectedRun;
  if (!run) return null;
  const steps = [
    "Task received & validated",
    "Policy checks passed",
    "Model routed · task-fit 98.2%",
    "Knowledge context retrieved",
    "Agent executing tools",
    "Checkpoint & evidence captured",
    "Output evaluated & published",
  ];
  return (
    <>
      <div className="overlay" onClick={() => setSelectedRun(null)} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Run inspector">
        <div className="drawer-head">
          <div>
            <span className="eyebrow">{run.id}</span>
            <h2>{run.name}</h2>
            <p>{run.agent}</p>
          </div>
          <CloseButton onClick={() => setSelectedRun(null)} />
        </div>
        <div className="drawer-body">
          <div className="flex justify-between">
            <Status value={run.status} />
            <span className="mono muted">{run.progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${run.progress}%` }} />
          </div>
          <div className="tabs mt-6">
            {["Timeline", "Output", "Metadata"].map((t) => (
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
          {tab === "Timeline" ? (
            steps.map((s, i) => (
              <div className="run-step" key={s}>
                {run.progress >= i * 15 ? <Check size={16} /> : <ClockIcon />}
                <div>
                  {s}
                  <p>
                    {run.progress >= i * 15
                      ? i < 3
                        ? "Completed · verified"
                        : i === 4 && run.status === "Running"
                          ? "In progress · sandbox active"
                          : "Captured in execution trace"
                      : "Waiting for upstream step"}
                  </p>
                </div>
              </div>
            ))
          ) : tab === "Output" ? (
            run.status === "Completed" ? (
              <>
                <h3 className="text-sm mb-4">Execution summary</h3>
                <p className="text-xs text-muted-foreground leading-7">
                  {run.name} completed successfully. Sources were collected, policy checks passed,
                  and the final output was verified by Quality Reviewer.
                </p>
                <pre className="code-block mt-5">
                  {
                    '{\n  "status": "completed",\n  "confidence": 0.982,\n  "evidence": 6,\n  "policy_violations": 0\n}'
                  }
                </pre>
              </>
            ) : (
              <div className="empty-state">Output available after execution completes.</div>
            )
          ) : (
            <>
              {[
                ["Agent", run.agent],
                ["Tokens", run.tokens],
                ["Cost", run.cost],
                ["Runtime", "praxis-worker-01"],
                ["Trace", "tr_29f7a3"],
                ["Checkpoint", "cp_92f4"],
              ].map(([k, v]) => (
                <div className="key-value" key={k}>
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="drawer-foot">
          <Button
            variant="outline"
            onClick={() => {
              notify(`Trace opened · ${run.id}`);
              setSelectedRun(null);
            }}
            asChild
          >
            <Link to="/$section" params={{ section: "observability" }}>
              View trace
              <ArrowRight />
            </Link>
          </Button>
          <Button onClick={() => setSelectedRun(null)}>Done</Button>
        </div>
      </aside>
    </>
  );
}
function ClockIcon() {
  return <span className="run-step-wait" />;
}