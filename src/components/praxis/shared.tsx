import { ArrowUpRight, Check, ChevronRight, Circle, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudio } from "./store";
import type { Run } from "./data";
export function Status({ value }: { value: string }) {
  const tone = ["Completed", "Active", "Healthy", "Passed", "Verified", "Online"].includes(value)
    ? "green"
    : ["Running", "Pending"].includes(value)
      ? "blue"
      : ["Needs approval", "Needs review", "Paused"].includes(value)
        ? "amber"
        : ["Failed", "Rejected", "Offline"].includes(value)
          ? "red"
          : "neutral";
  return (
    <span className={`status status-${tone}`}>
      <span />
      {value}
    </span>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>
          {title}
          <span className="heading-dot">.</span>
        </h1>
        <p>{description}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
export function SectionHeading({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div className="flex items-center gap-3">
        <h2>{title}</h2>
        {detail && <span className="section-detail">{detail}</span>}
      </div>
      {children}
    </div>
  );
}
export function RunTable({ runs, compact = false }: { runs: Run[]; compact?: boolean }) {
  const { setSelectedRun } = useStudio();
  return (
    <div className="table-scroll">
      <table className="data-table run-table">
        <thead>
          <tr>
            <th>RUN / TASK</th>
            <th>AGENT</th>
            <th>STATUS</th>
            <th>DURATION</th>
            {!compact && <th>TOKENS</th>}
            <th>COST</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr
              key={run.id}
              onClick={() => setSelectedRun(run)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelectedRun(run)}
              aria-label={`Inspect ${run.name}`}
            >
              <td>
                <div className="run-name">
                  <span className={`run-glyph ${run.status === "Running" ? "active" : ""}`}>
                    <ChevronRight size={14} />
                  </span>
                  <div>
                    <strong>{run.name}</strong>
                    <small>{run.id}</small>
                  </div>
                </div>
              </td>
              <td>{run.agent}</td>
              <td>
                <Status value={run.status} />
              </td>
              <td className="mono">{run.time}</td>
              {!compact && <td className="mono">{run.tokens}</td>}
              <td className="mono muted">{run.cost}</td>
              <td>
                <ArrowUpRight size={14} className="muted" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!runs.length && <div className="empty-state">No runs match your filters.</div>}
    </div>
  );
}
export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} aria-label="Close">
      <X size={18} />
    </Button>
  );
}
export function Inspector({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <aside className="inspector">
      <div className="inspector-title">
        <div>
          <span className="eyebrow">INSPECTOR</span>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <CloseButton onClick={onClose} />
      </div>
      {children}
    </aside>
  );
}
export function EmptyCheck() {
  return <Check size={14} />;
}