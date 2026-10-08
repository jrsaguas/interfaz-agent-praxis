import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bot,
  CalendarDays,
  ChevronDown,
  DollarSign,
  GitBranch,
  Play,
  Plus,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { agents } from "./data";
import { useStudio } from "./store";
import { PageHeading, RunTable, SectionHeading, Status } from "./shared";
export function MiniGraph() {
  return (
    <div className="graph-preview">
      <svg
        viewBox="0 0 380 196"
        role="img"
        aria-label="Research pipeline: input to researcher, analysis, reviewer and output"
      >
        <path className="graph-line" d="M70 98H108M160 98H192M244 98H276M320 98H340" />
        <path
          className="graph-line"
          d="M160 98C177 98 170 44 192 44H215M244 44C265 44 256 98 276 98"
        />
        <rect className="mini-node root-node" x="20" y="79" width="50" height="38" rx="5" />
        <text x="31" y="102">
          Input
        </text>
        <rect className="mini-node" x="108" y="70" width="65" height="56" rx="5" />
        <circle className="node-icon" cx="123" cy="84" r="4" />
        <text x="117" y="104">
          Research
        </text>
        <text className="node-caption" x="117" y="117">
          Sonnet 4.5
        </text>
        <rect className="mini-node" x="192" y="70" width="64" height="56" rx="5" />
        <circle className="node-icon violet" cx="207" cy="84" r="4" />
        <text x="201" y="104">
          Analysis
        </text>
        <text className="node-caption" x="201" y="117">
          GPT-5
        </text>
        <rect className="mini-node" x="195" y="26" width="60" height="33" rx="5" />
        <text className="node-caption" x="204" y="46">
          Knowledge
        </text>
        <rect className="mini-node" x="276" y="70" width="63" height="56" rx="5" />
        <circle className="node-icon" cx="291" cy="84" r="4" />
        <text x="285" y="104">
          Review
        </text>
        <text className="node-caption" x="285" y="117">
          Quality gate
        </text>
        <circle className="graph-circle" cx="354" cy="98" r="9" />
        <path stroke="var(--primary-foreground)" fill="none" d="m350 98 3 3 5-6" />
      </svg>
    </div>
  );
}
export function Dashboard() {
  const { runs, approvals, setNewRun, setSelectedRun } = useStudio();
  const [period, setPeriod] = useState("24h");
  const active = runs.filter((r) => r.status === "Running").length;
  return (
    <>
      <PageHeading
        title="Command Center"
        description="Your agents. Your operations. One place to stay in control."
      >
        <span className="date-chip">
          <CalendarDays size={13} />
          Oct 7, 2026
          <ChevronDown size={12} />
        </span>
        <Button onClick={() => setNewRun(true)}>
          <Plus size={14} />
          New run
        </Button>
      </PageHeading>
      <div className="metrics">
        {[
          {
            label: "Active runs",
            value: String(active + 10).padStart(2, "0"),
            note: "4 started in the last hour",
            change: "+3",
            icon: Activity,
          },
          {
            label: "Success rate",
            value: "98.4",
            unit: "%",
            note: "vs. previous 7 days",
            change: "+2.1%",
            icon: ShieldCheck,
          },
          {
            label: "Pending approvals",
            value: String(approvals.length).padStart(2, "0"),
            note: "2 high-priority actions",
            change: "Review required",
            icon: ShieldCheck,
          },
          {
            label: "Total spend",
            value: "$24.86",
            note: "of $100.00 daily budget",
            change: "−12.8%",
            icon: DollarSign,
          },
        ].map((m, i) => (
          <div className={`metric ${i === 2 ? "metric-warning" : ""}`} key={m.label}>
            <div className="metric-top">
              <span>{m.label}</span>
              <m.icon size={15} />
            </div>
            <div className="metric-number">
              {m.value}
              <small>{m.unit}</small>
            </div>
            {i !== 2 && (
              <svg className="metric-spark sparkline" viewBox="0 0 80 30" aria-hidden="true">
                <path
                  d={
                    i === 0
                      ? "M0 27L8 23L14 25L23 15L31 18L40 9L48 15L57 5L65 10L80 1"
                      : i === 1
                        ? "M0 23L10 20L19 24L29 12L38 16L47 7L58 11L69 4L80 7"
                        : "M0 4L9 8L18 5L28 16L38 11L48 20L59 16L69 27L80 23"
                  }
                />
              </svg>
            )}
            <div className="metric-bottom">
              <span className={i === 2 ? "status-amber" : "positive"}>
                {i === 2 ? "•" : i === 3 ? "↘" : "↗"} {m.change}
              </span>
              <span>{m.note}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-main">
        <section className="panel chart-panel">
          <SectionHeading title="Run activity" detail="LIVE">
            <div className="segmented">
              {["24h", "7d", "30d"].map((p) => (
                <Button
                  variant="ghost"
                  className={period === p ? "selected" : ""}
                  key={p}
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </SectionHeading>
          <div className="activity-chart">
            <div className="chart-y">
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>
            <svg
              viewBox="0 0 620 150"
              preserveAspectRatio="none"
              role="img"
              aria-label={`Run activity over ${period}`}
            >
              <defs>
                <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity=".22" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[5, 48, 94, 140].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="620"
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="3 4"
                  strokeOpacity=".65"
                />
              ))}
              <path
                d={
                  period === "24h"
                    ? "M0 118L18 125L38 113L59 120L80 100L100 108L119 83L138 96L157 76L177 88L194 62L213 75L232 44L251 60L270 33L290 52L307 41L326 64L345 45L365 57L383 21L401 39L420 30L440 48L458 21L477 34L496 14L515 27L534 9L554 25L574 17L594 36L620 24V150H0Z"
                    : "M0 130L40 115L80 123L120 88L160 98L200 65L240 82L280 51L320 62L360 40L400 59L440 25L480 40L520 17L560 32L620 12V150H0Z"
                }
                fill="url(#activity-fill)"
              />
              <path
                d={
                  period === "24h"
                    ? "M0 118L18 125L38 113L59 120L80 100L100 108L119 83L138 96L157 76L177 88L194 62L213 75L232 44L251 60L270 33L290 52L307 41L326 64L345 45L365 57L383 21L401 39L420 30L440 48L458 21L477 34L496 14L515 27L534 9L554 25L574 17L594 36L620 24"
                    : "M0 130L40 115L80 123L120 88L160 98L200 65L240 82L280 51L320 62L360 40L400 59L440 25L480 40L520 17L560 32L620 12"
                }
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
              />
              <path
                d="M0 138L40 139L80 133L120 136L160 129L200 130L240 124L280 128L320 121L360 126L400 118L440 122L480 114L520 117L560 109L620 114"
                stroke="var(--cyan)"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="3 3"
              />
            </svg>
            <div className="chart-x">
              {(period === "24h"
                ? ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"]
                : period === "7d"
                  ? ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"]
                  : ["Sep 8", "Sep 13", "Sep 18", "Sep 23", "Sep 28", "Oct 3", "Oct 7"]
              ).map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
          <div className="chart-footer">
            <div className="chart-legend">
              <span>
                <i className="legend-dot" />
                Completed runs
              </span>
              <span>
                <i className="legend-dot cyan" />
                Tool calls
              </span>
            </div>
            <span className="mono">
              {period === "24h" ? "248" : period === "7d" ? "1,726" : "7,402"} total runs
            </span>
          </div>
        </section>
        <section className="panel">
          <SectionHeading title="Featured graph">
            <Link
              to="/$section"
              params={{ section: "workbench" }}
              className="flex items-center gap-1"
            >
              Open workbench
              <ArrowUpRight size={11} />
            </Link>
          </SectionHeading>
          <div className="graph-footer graph-label-strip">
            <span className="flex items-center gap-6">
              <GitBranch size={11} />
              Research & synthesis
            </span>
            <span>v1.4</span>
          </div>
          <div className="featured-graph-body">
            <MiniGraph />
          </div>
          <div className="graph-footer">
            <span>6 nodes · 8 connections</span>
            <strong>● Deployed</strong>
          </div>
        </section>
      </div>
      <section className="panel recent-panel">
        <SectionHeading title="Recent runs" detail="6">
          <Link to="/$section" params={{ section: "runs" }} className="flex items-center gap-1">
            View all runs
            <ArrowRight size={11} />
          </Link>
        </SectionHeading>
        <RunTable runs={runs.slice(0, 5)} compact />
      </section>
      <div className="dashboard-bottom">
        <section className="panel">
          <SectionHeading title="Your agents" detail="6 active">
            <Link to="/$section" params={{ section: "agents" }} className="flex items-center gap-1">
              Manage agents
              <ArrowRight size={11} />
            </Link>
          </SectionHeading>
          <div className="agent-mini-list">
            {agents.slice(0, 3).map((a) => (
              <Link
                to="/$section"
                params={{ section: "agents" }}
                className="agent-mini"
                key={a.name}
              >
                <div className="flex items-center justify-between">
                  <span className={`agent-icon tone-${a.color}`}>
                    <a.icon size={16} />
                  </span>
                  <ArrowUpRight size={11} className="muted" />
                </div>
                <strong>{a.name}</strong>
                <p>{a.model}</p>
                <Status value={a.status} />
              </Link>
            ))}
          </div>
        </section>
        <section className="panel">
          <SectionHeading title="Needs your attention" detail={`${approvals.length}`}>
            <Link to="/$section" params={{ section: "approvals" }}>
              <ArrowUpRight size={13} />
            </Link>
          </SectionHeading>
          {approvals.slice(0, 2).map((a) => (
            <Link
              to="/$section"
              params={{ section: "approvals" }}
              className="approval-mini"
              key={a.id}
            >
              <span className="approval-mini-icon">
                <ShieldCheck size={14} />
              </span>
              <div>
                <strong>{a.title}</strong>
                <p>
                  {a.agent} · {a.risk.toLowerCase()} risk
                </p>
              </div>
              <span className="mono muted">{a.age.replace(" ago", "")}</span>
            </Link>
          ))}
          {!approvals.length && <div className="empty-state">All caught up.</div>}
        </section>
      </div>
      <footer className="page-footer">
        <span>
          <i className="health-dot" />
          All systems operational<span>·</span>Last synced just now
        </span>
        <span>
          PRAXIS RUNTIME v0.9.4 <span>↗</span>
        </span>
      </footer>
    </>
  );
}