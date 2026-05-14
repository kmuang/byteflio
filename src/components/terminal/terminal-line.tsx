
"use client";

import React from "react";
import { TypingEffect } from "./typing-effect";

export type LineType = "command" | "response" | "error" | "system" | "prompt";

export interface OutputLine {
  id: string;
  type: LineType;
  content: string;
  animate?: boolean;
  path?: string;
}

interface TerminalLineProps {
  line: OutputLine;
  onAnimationComplete?: () => void;
}

// ─── Colorizer ────────────────────────────────────────────────────────────────
// Applies two highlight colors to structured terminal output (response lines).
//   text-primary  → labels, section headers, directory names
//   text-accent   → bracketed tokens, bullet dots
//   text-muted-foreground/40 → separator lines

type Segment = { text: string; cls?: string };

function tokenizeLine(line: string): Segment[] {
  const trimmed = line.trim();
  if (!trimmed) return [{ text: line }];

  // 1. Separator lines — ====, ────, ---- (4+ repeated chars)
  if (/^[=─\-]{4,}$/.test(trimmed)) {
    return [{ text: line, cls: "text-muted-foreground/40" }];
  }

  // 2. KEY: value — starts with uppercase, colon, whitespace, content
  //    Matches: "STACK:   Next.js", "Email:    you@...", "OS: bytefolio", "Tip: ..."
  //    Requires content after the colon so bare "FEATURES:" falls to rule 3.
  const kvMatch = line.match(/^(\s*)([A-Za-z][A-Za-z\s/]{0,20}:)(\s+.+)$/);
  if (kvMatch) {
    const segs: Segment[] = [];
    if (kvMatch[1]) segs.push({ text: kvMatch[1] });
    segs.push({ text: kvMatch[2], cls: "text-primary" });
    segs.push({ text: kvMatch[3] });
    return segs;
  }

  // 3. Standalone label ending in colon — "  Navigation:", "  FEATURES:"
  const labelMatch = line.match(/^(\s*)([A-Za-z][A-Za-z\s/]{0,20}:)\s*$/);
  if (labelMatch) {
    const segs: Segment[] = [];
    if (labelMatch[1]) segs.push({ text: labelMatch[1] });
    segs.push({ text: labelMatch[2], cls: "text-primary font-semibold" });
    return segs;
  }

  // 4. All-caps section header — "ABOUT ME", "TECHNICAL SKILLS", "PROJECTS"
  //    Pure uppercase words, no digits, no colon
  if (/^[A-Z][A-Z\s]{2,}$/.test(trimmed) && !/\d/.test(trimmed)) {
    return [{ text: line, cls: "text-primary font-semibold" }];
  }

  // 5. Bullet point lines starting with •
  if (trimmed.startsWith("•")) {
    const bi = line.indexOf("•");
    return [
      { text: line.slice(0, bi) },
      { text: "•", cls: "text-accent" },
      { text: line.slice(bi + 1) },
    ];
  }

  // 6. Inline [bracketed] tokens — "[2022 – Present]", "[period]"
  if (line.includes("[") && line.includes("]")) {
    const parts = line.split(/(\[[^\]]+\])/);
    return parts.map((part) =>
      /^\[.+\]$/.test(part)
        ? { text: part, cls: "text-accent" }
        : { text: part }
    );
  }

  // 7. Directory entries — word/ — not inside a URL
  if (/\S+\//.test(line) && !line.includes("http")) {
    const parts = line.split(/(\b\S+\/)/);
    return parts.map((part) =>
      /^\S+\/$/.test(part)
        ? { text: part, cls: "text-primary" }
        : { text: part }
    );
  }

  return [{ text: line }];
}

function colorizeResponse(
  text: string,
  formatter: (t: string) => React.ReactNode
): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, li) => (
    <React.Fragment key={li}>
      {tokenizeLine(line).map((seg, si) =>
        seg.cls ? (
          <span key={si} className={seg.cls}>
            {formatter(seg.text)}
          </span>
        ) : (
          <React.Fragment key={si}>{formatter(seg.text)}</React.Fragment>
        )
      )}
      {li < lines.length - 1 && "\n"}
    </React.Fragment>
  ));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TerminalLine({ line, onAnimationComplete }: TerminalLineProps) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const formatContent = (text: string): React.ReactNode => {
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
      part.match(urlRegex) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-accent transition-colors"
        >
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const renderContent = () => {
    if (line.type === "response") {
      if (line.animate) {
        return (
          <TypingEffect
            text={line.content}
            onComplete={onAnimationComplete}
            className="whitespace-pre-wrap"
            formatter={(t) => colorizeResponse(t, formatContent)}
          />
        );
      }
      return (
        <span className="whitespace-pre-wrap">
          {colorizeResponse(line.content, formatContent)}
        </span>
      );
    }

    if (line.animate) {
      return (
        <TypingEffect
          text={line.content}
          onComplete={onAnimationComplete}
          className="whitespace-pre-wrap"
          formatter={formatContent}
        />
      );
    }
    return (
      <span className="whitespace-pre-wrap">{formatContent(line.content)}</span>
    );
  };

  const getStyle = () => {
    switch (line.type) {
      case "command": return "text-accent font-bold";
      case "error":   return "text-destructive";
      case "system":  return "text-muted-foreground italic";
      case "prompt":  return "text-primary font-bold";
      default:        return "text-foreground";
    }
  };

  return (
    <div className={`py-0.5 min-h-[1.5rem] ${getStyle()}`}>
      {line.type === "command" && (
        <>
          <span className="mr-2 font-bold hidden sm:inline">
            visitor@bytefolio:{line.path || "~"}$
          </span>
          <span className="mr-2 font-bold sm:hidden">
            {(line.path || "~").split("/").pop() || "~"}$
          </span>
        </>
      )}
      {renderContent()}
    </div>
  );
}
