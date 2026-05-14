"use client";

import { useState, useCallback } from "react";
import { TerminalContainer } from "@/components/terminal/terminal-container";
import { Monitor, Github, Sun, Columns2, Rows2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "green" | "amber" | "blue" | "light" | "github";
type SplitDirection = "horizontal" | "vertical";

interface Pane {
  id: string;
}

export default function Home() {
  const [theme, setTheme] = useState<Theme>("github");
  const [panes, setPanes] = useState<Pane[]>([{ id: "pane-1" }]);
  const [splitDirection, setSplitDirection] = useState<SplitDirection>("horizontal");
  const [activePane, setActivePane] = useState("pane-1");

  const splitTerminal = useCallback((direction: SplitDirection) => {
    if (panes.length >= 2) return;
    setSplitDirection(direction);
    const newId = `pane-${Date.now()}`;
    setPanes((prev) => [...prev, { id: newId }]);
    setActivePane(newId);
  }, [panes.length]);

  const closePane = useCallback((id: string) => {
    setPanes((prev) => {
      if (prev.length <= 1) return prev;
      const remaining = prev.filter((p) => p.id !== id);
      setActivePane((cur) => (cur === id ? remaining[remaining.length - 1].id : cur));
      return remaining;
    });
  }, []);

  const isMultiPane = panes.length > 1;
  const isSplit = isMultiPane;

  return (
    <main className={cn(
      "fixed inset-0 bg-background flex flex-col justify-center items-center overflow-hidden transition-colors duration-300",
      theme === "amber" && "theme-amber",
      theme === "blue" && "theme-blue",
      theme === "light" && "theme-light",
      theme === "github" && "theme-github"
    )}>
      {/* Scanline effect overlay */}
      {theme !== "light" && (
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] z-10" />
      )}

      {/* Subtle CRT glow */}
      {theme !== "light" && (
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(var(--primary),0.05)] z-20" />
      )}

      <div className="relative w-full h-full flex flex-col z-30">
        {/* Terminal Header */}
        <div className="bg-muted px-3 sm:px-5 py-2 sm:py-3 flex items-center justify-between border-b border-border text-xs tracking-wide text-muted-foreground select-none">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-110 transition-all cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 transition-all cursor-pointer" />
            </div>
            <span className="ml-1 flex items-center gap-1.5 sm:gap-2 font-medium truncate">
              <Monitor size={13} className="shrink-0" />
              <span className="hidden sm:inline">terminal — bytefolio@session-1</span>
              <span className="sm:hidden">bytefolio</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Split controls — hidden on mobile */}
            <div className="hidden sm:flex items-center gap-0.5 border-r border-border/50 pr-3 sm:pr-4">
              <button
                onClick={() => splitTerminal("horizontal")}
                disabled={isSplit}
                title="Split side by side"
                className={cn(
                  "p-1 rounded transition-all hover:bg-primary/10",
                  isSplit && "opacity-30 cursor-not-allowed"
                )}
              >
                <Columns2 size={13} />
              </button>
              <button
                onClick={() => splitTerminal("vertical")}
                disabled={isSplit}
                title="Split top / bottom"
                className={cn(
                  "p-1 rounded transition-all hover:bg-primary/10",
                  isSplit && "opacity-30 cursor-not-allowed"
                )}
              >
                <Rows2 size={13} />
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 bg-background/50 px-2.5 sm:px-4 py-1.5 rounded-md border border-border/50">
              <div className="flex items-center gap-2 sm:gap-2.5 pr-2 sm:pr-3 border-r border-border/50">
                <button
                  onClick={() => setTheme("green")}
                  className={cn("w-3.5 h-3.5 rounded-full bg-[#4ccd5c] hover:scale-110 transition-transform", theme === "green" && "ring-2 ring-offset-1 ring-offset-muted ring-[#4ccd5c]")}
                  title="Matrix Green"
                />
                <button
                  onClick={() => setTheme("amber")}
                  className={cn("w-3.5 h-3.5 rounded-full bg-[#f59e0b] hover:scale-110 transition-transform", theme === "amber" && "ring-2 ring-offset-1 ring-offset-muted ring-[#f59e0b]")}
                  title="Amber CRT"
                />
                <button
                  onClick={() => setTheme("blue")}
                  className={cn("w-3.5 h-3.5 rounded-full bg-[#3b82f6] hover:scale-110 transition-transform", theme === "blue" && "ring-2 ring-offset-1 ring-offset-muted ring-[#3b82f6]")}
                  title="Cyber Blue"
                />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <button
                  onClick={() => setTheme("light")}
                  className={cn("p-1 rounded transition-all hover:bg-primary/10", theme === "light" && "text-primary")}
                  title="Light Mode"
                >
                  <Sun size={13} />
                </button>
                <button
                  onClick={() => setTheme("github")}
                  className={cn("p-1 rounded transition-all hover:bg-primary/10", theme === "github" && "text-primary")}
                  title="GitHub Theme"
                >
                  <Github size={13} />
                </button>
              </div>
            </div>
            <div className="hidden sm:block font-mono text-muted-foreground/60">80×24</div>
          </div>
        </div>

        {/* Pane area */}
        <div
          className={cn(
            "flex-1 overflow-hidden flex",
            splitDirection === "horizontal" ? "flex-row" : "flex-col"
          )}
        >
          {panes.map((pane, index) => (
            <div
              key={pane.id}
              className={cn(
                "relative flex-1 overflow-hidden flex flex-col transition-shadow duration-150",
                isMultiPane && index > 0 && (
                  splitDirection === "horizontal" ? "border-l-2 border-border/60" : "border-t-2 border-border/60"
                ),
                isMultiPane && activePane === pane.id && "shadow-[inset_0_0_0_1px_rgba(var(--primary),0.35)]"
              )}
              onClick={() => setActivePane(pane.id)}
            >
              {/* Per-pane tab bar (only in split mode) */}
              {isMultiPane && (
                <div className="flex items-center justify-between px-3 py-1 bg-muted/70 border-b border-border/40 text-xs text-muted-foreground select-none shrink-0">
                  <span className={cn("font-medium", activePane === pane.id && "text-primary/80")}>
                    bash — session-{index + 1}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); closePane(pane.id); }}
                    title="Close pane"
                    className="p-0.5 rounded hover:bg-primary/10 hover:text-foreground transition-colors"
                  >
                    <X size={11} />
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-hidden">
                <TerminalContainer compact={isMultiPane} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
