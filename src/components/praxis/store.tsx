import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { initialRuns, initialApprovals, type Run } from "./data";
type StudioState = {
  runs: Run[];
  approvals: typeof initialApprovals;
  newRun: boolean;
  setNewRun: (value: boolean) => void;
  palette: boolean;
  setPalette: (value: boolean) => void;
  addRun: (name: string, agent: string) => void;
  resolve: (id: string, approved: boolean) => void;
  notice: string;
  notify: (text: string) => void;
  selectedRun: Run | null;
  setSelectedRun: (run: Run | null) => void;
};
const StudioContext = createContext<StudioState | null>(null);
export function StudioProvider({ children }: { children: ReactNode }) {
  const [runs, setRuns] = useState(initialRuns);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [newRun, setNewRun] = useState(false);
  const [palette, setPalette] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const notify = (text: string) => setNotice(text);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const timer = setInterval(
      () =>
        setRuns((prev) =>
          prev.map((run) =>
            run.status === "Running"
              ? {
                  ...run,
                  progress: Math.min(100, run.progress + 3),
                  status: run.progress + 3 >= 100 ? "Completed" : "Running",
                }
              : run,
          ),
        ),
      2200,
    );
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
      if (e.key === "Escape") {
        setPalette(false);
        setNewRun(false);
        setSelectedRun(null);
      }
      if (
        e.key === "n" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName) &&
        !e.metaKey &&
        !e.ctrlKey
      )
        setNewRun(true);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  const addRun = (name: string, agent: string) => {
    setRuns((prev) => [
      {
        id: `run_${Math.random().toString(16).slice(2, 6)}`,
        name,
        agent,
        status: "Running",
        time: "Just now",
        tokens: "0",
        cost: "$0.000",
        progress: 0,
      },
      ...prev,
    ]);
    setNewRun(false);
    notify("Run started · runtime initialized");
  };
  const resolve = (id: string, approved: boolean) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    if (id === "apr_01")
      setRuns((prev) =>
        prev.map((r) =>
          r.id === "run_7e1b" ? { ...r, status: approved ? "Running" : "Rejected" } : r,
        ),
      );
    notify(
      approved ? "Action approved · execution resumed" : "Action rejected · checkpoint preserved",
    );
  };
  return (
    <StudioContext.Provider
      value={{
        runs,
        approvals,
        newRun,
        setNewRun,
        palette,
        setPalette,
        addRun,
        resolve,
        notice,
        notify,
        selectedRun,
        setSelectedRun,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
}
export function useStudio() {
  const state = useContext(StudioContext);
  if (!state) throw new Error("StudioProvider required");
  return state;
}