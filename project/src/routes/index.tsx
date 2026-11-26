import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import universumLogo from "../assets/universum-logo.png";
import { RegistrationWorkspace } from "../components/RegistrationWorkspace";
import {
  SAMPLE_STATE,
  type OperationResult,
  type RegistrationState,
} from "../lib/registration-engine";

const STORAGE_KEY = "universum-course-registration-v1";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Course Registration Portal — Universum International College" },
      {
        name: "description",
        content:
          "Official Course Registration Portal for Universum International College. Register for courses, check open seats, and manage student schedules.",
      },
      { property: "og:title", content: "Course Registration Portal — Universum International College" },
      {
        property: "og:description",
        content:
          "Official Course Registration Portal for Universum International College. Register for courses, check open seats, and manage student schedules.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const [state, setState] = useState<RegistrationState>(SAMPLE_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [activeSection, setActiveSection] = useState<"courses" | "students" | "manage">("courses");
  const [feedback, setFeedback] = useState<OperationResult | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as RegistrationState;
        if (Array.isArray(parsed.students) && Array.isArray(parsed.courses) && Array.isArray(parsed.registrations)) {
          setState(parsed);
        }
      }
    } catch {
      // Ignore malformed local storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state, hydrated]);

  const handleUpdate = (next: RegistrationState, result: OperationResult) => {
    setState(next);
    setFeedback(result);
  };

  const handleReset = () => {
    setState(SAMPLE_STATE);
    setFeedback({ ok: true, code: "REGISTERED", message: "Default Fall 2026 catalog and rosters restored." });
  };

  const navItems: Array<{ id: "courses" | "students" | "manage"; label: string }> = [
    { id: "courses", label: "Courses & Enrollment" },
    { id: "students", label: "Student Directory" },
    { id: "manage", label: "Manage Records" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Institutional Bar */}
      <div className="h-1.5 w-full bg-primary" />
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <img
            src={universumLogo}
            alt="Universum International College — Powered by Arizona State University"
            className="h-10 w-auto sm:h-12"
          />

          <nav aria-label="Portal sections" className="flex flex-wrap items-center gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={
                  activeSection === item.id
                    ? "rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"
                    : "rounded-md px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                }
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Red Portal Banner */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-7 sm:px-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest opacity-85">
              Office of the Registrar · Academic Year 2026–2027
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Course Registration Portal
            </h1>
          </div>
          <div className="rounded-md border border-primary-foreground/25 px-3 py-1.5 font-mono text-xs">
            Term: Fall 2026 · Open Registration
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8 sm:px-6">
        {feedback && (
          <div
            role="status"
            className={
              feedback.ok
                ? "flex items-center justify-between gap-3 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground"
                : "flex items-center justify-between gap-3 rounded-md border border-primary/30 bg-accent px-4 py-3 text-sm text-foreground"
            }
          >
            <div>
              <span className="mr-2 font-mono text-xs font-semibold uppercase">
                {feedback.ok ? "Confirmed" : "Notice"}
              </span>
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        )}

        <RegistrationWorkspace state={state} activeSection={activeSection} onUpdate={handleUpdate} />
      </main>

      <footer className="mt-12 border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:px-6">
          <span>© 2026 Universum International College · Powered by Arizona State University</span>
          <button type="button" onClick={handleReset} className="hover:text-primary hover:underline">
            Reset default catalog
          </button>
        </div>
      </footer>
    </div>
  );
}
