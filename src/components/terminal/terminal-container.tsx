
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TerminalLine, OutputLine } from "./terminal-line";
import { portfolioData, Project } from "@/lib/portfolio-data";
import { generateProjectSummary } from "@/ai/flows/generate-project-summary";
import { cn } from "@/lib/utils";

const ALL_COMMANDS = [
  "about", "cat", "cd", "clear", "contact", "date", "echo",
  "experience", "help", "history", "ll", "ls", "man", "neofetch",
  "open", "projects", "pwd", "resume", "skills", "tree", "uname", "whoami",
];

const MAN_PAGES: Record<string, string> = {
  ls: `LS(1)                    User Commands                    LS(1)

NAME
    ls - list directory contents

SYNOPSIS
    ls [OPTION]... [FILE]...

DESCRIPTION
    List information about the FILEs (current directory by default).

    -a    include entries starting with .
    -l    use a long listing format
    -la   combine -l and -a

EXAMPLES
    ls           list current directory
    ls -la       long listing with hidden files
    ll           alias for ls -la`,

  cd: `CD(1)                    Shell Builtin                    CD(1)

NAME
    cd - change the shell working directory

SYNOPSIS
    cd [DIR]

DESCRIPTION
    Change the current directory to DIR.
    The variable HOME is the default DIR.

EXAMPLES
    cd projects       navigate to projects/
    cd ..             go up one level
    cd ~              return to home`,

  cat: `CAT(1)                   User Commands                   CAT(1)

NAME
    cat - concatenate files and print on standard output

SYNOPSIS
    cat [FILE]...

DESCRIPTION
    Read FILE(s) and print to standard output.

EXAMPLES
    cat about.txt
    cat skills.txt
    cat README.md
    cat details.json`,

  tree: `TREE(1)                  User Commands                  TREE(1)

NAME
    tree - list contents of directories in a tree-like format

SYNOPSIS
    tree [DIRECTORY]

DESCRIPTION
    Tree is a recursive directory listing program that produces
    a depth indented listing of files.`,

  man: `MAN(1)                   User Commands                   MAN(1)

NAME
    man - an interface to the system reference manuals

SYNOPSIS
    man [command]

AVAILABLE MANUAL PAGES
    ls, cd, cat, tree, man, help`,

  help: `HELP(1)                  Shell Builtin                  HELP(1)

NAME
    help - display information about builtin commands

SYNOPSIS
    help [command]

DESCRIPTION
    Displays brief summaries of builtin commands.
    Run 'help' with no arguments to list all commands.`,
};

export function TerminalContainer({ compact = false }: { compact?: boolean }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<OutputLine[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isBooting, setIsBooting] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPath, setCurrentPath] = useState("~");
  const [tabCompletions, setTabCompletions] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentPathRef = useRef(currentPath);
  const bootedRef = useRef(false);

  useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);

  const addLine = useCallback(
    (content: string, type: "command" | "response" | "error" | "system" = "response", animate = false, path?: string) => {
      setHistory((prev) => [
        ...prev,
        { id: Math.random().toString(36).substring(2, 11), content, type, animate, path: path ?? currentPathRef.current },
      ]);
    },
    []
  );

  const runBootSequence = useCallback(async () => {
    setIsBooting(true);
    const messages = [
      "initializing bytefolio system v2.0.4...",
      "loading secure profile modules...",
      "fetching project inventory...",
      "establishing terminal link...",
      "Welcome to Khup Muang's Portfolio.",
      "Type 'help' to see available commands. Try 'neofetch' for system info.",
    ];
    for (let i = 0; i < messages.length; i++) {
      await new Promise((r) => setTimeout(r, i === 4 ? 600 : 300));
      addLine(messages[i], i < 4 ? "system" : "response", false, "~");
    }
    setIsBooting(false);
  }, [addLine]);

  useEffect(() => {
    if (!bootedRef.current) {
      bootedRef.current = true;
      runBootSequence();
    }
  }, [runBootSequence]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, tabCompletions]);

  const getFileSystemItems = (path: string): string[] => {
    const normalized = path.replace(/\/$/, "");
    if (normalized === "~") {
      return ["projects/", "about.txt", "skills.txt", "experience.txt", "contact.txt"];
    } else if (normalized === "~/projects") {
      return portfolioData.projects.map((p) => p.id + "/");
    } else if (normalized.startsWith("~/projects/") && normalized.split("/").length === 3) {
      return ["README.md", "details.json"];
    }
    return [];
  };

  const getProjectsListing = (): string => {
    const header = `PROJECTS (${portfolioData.projects.length})\n${"=".repeat(44)}\n`;
    const rows = portfolioData.projects.map((p) => {
      const id = (p.id + "/").padEnd(26);
      return `  ${id}${p.name}`;
    });
    const footer = `\n  Tip: 'cd <project>' to explore · 'ls' to list files`;
    return header + rows.join("\n") + footer;
  };

  const getProjectDetail = (proj: { id: string; name: string; description: string; stack: string; features: string; challenges: string; demoLink?: string; githubLink?: string }): string => {
    let out = `\nPROJECT: ${proj.name}\n${"=".repeat(44)}\n`;
    out += `STACK:       ${proj.stack}\n`;
    out += `DESCRIPTION: ${proj.description}\n\n`;
    out += `FEATURES:\n${proj.features}\n\n`;
    out += `CHALLENGES:\n${proj.challenges}\n\n`;
    out += `${"─".repeat(44)}\n`;
    if (proj.demoLink)   out += `LIVE DEMO:   ${proj.demoLink}\n`;
    if (proj.githubLink) out += `SOURCE CODE: ${proj.githubLink}\n`;
    out += `\n  Files: README.md · details.json`;
    return out;
  };

  const getLsOutput = (path: string, flags: string): string => {
    const items = getFileSystemItems(path);
    const showLong = flags.includes("l");
    const showAll = flags.includes("a");
    const now = new Date();
    const mo = now.toLocaleDateString("en-US", { month: "short" });
    const dy = String(now.getDate()).padStart(2, " ");

    if (showLong) {
      const lines: string[] = [`total ${items.length * 4 + (showAll ? 8 : 0)}`];
      if (showAll) {
        lines.push(`drwxr-xr-x  2 simon simon 4096 ${mo} ${dy} .`);
        lines.push(`drwxr-xr-x  3 root  root  4096 Jan 15 ..`);
      }
      items.forEach((item) => {
        const isDir = item.endsWith("/");
        const name = isDir ? item.slice(0, -1) : item;
        const perm = isDir ? "drwxr-xr-x" : "-rw-r--r--";
        // deterministic size based on name chars
        const size = isDir ? " 4096" : String((name.charCodeAt(0) * 37 + name.length * 13) % 800 + 128).padStart(5);
        lines.push(`${perm}  1 simon simon ${size} ${mo} ${dy} ${item}`);
      });
      return lines.join("\n");
    }
    return items.join("  ");
  };

  const getTreeOutput = (path: string): string => {
    const lines: string[] = [path];
    const renderDir = (dirPath: string, prefix: string) => {
      const items = getFileSystemItems(dirPath);
      items.forEach((item, i) => {
        const isLast = i === items.length - 1;
        lines.push(prefix + (isLast ? "└── " : "├── ") + item);
        if (item.endsWith("/")) {
          const childPath =
            dirPath === "~"
              ? `~/${item.slice(0, -1)}`
              : `${dirPath}/${item.slice(0, -1)}`;
          renderDir(childPath, prefix + (isLast ? "    " : "│   "));
        }
      });
    };
    renderDir(path, "");
    const dirs = lines.filter((l) => l.includes("/") && l !== path).length;
    const files = lines.filter((l) => !l.includes("/") && l !== path).length;
    lines.push(`\n${dirs} director${dirs === 1 ? "y" : "ies"}, ${files} file${files === 1 ? "" : "s"}`);
    return lines.join("\n");
  };

  const getNeofetch = (): string => {
    const updays = ((Date.now() / 86400000) % 30 | 0) + 1;
    return `
   .-----------.      simon@bytefolio
   |  o     o  |      ─────────────────────────────
   |    .-.    |      OS: bytefolio OS v2.0.4
   |   (   )   |      Host: Terminal Portfolio
   |    '-'    |      Kernel: react-kernel 18.2.0
   '-----------'      Shell: bash 5.2.0
   .-----------.      Terminal: bytefolio-term 80x24
   | .-------. |      Resolution: 1920x1080
   | | >_ ok | |      CPU: Next.js 14 (8 cores)
   | '-------' |      Memory: 16384MiB / 32768MiB
   '-----------'      Uptime: ${updays} days
        |||           Packages: 314 (npm)
   .-----------.      Location: Stockholm, Sweden`;
  };

  const commonPrefix = (strs: string[]): string => {
    if (!strs.length) return "";
    let prefix = strs[0];
    for (let i = 1; i < strs.length; i++) {
      while (!strs[i].startsWith(prefix)) {
        prefix = prefix.slice(0, -1);
        if (!prefix) return "";
      }
    }
    return prefix;
  };

  const handleTab = useCallback(() => {
    const lastSpaceIndex = input.lastIndexOf(" ");

    if (lastSpaceIndex === -1) {
      const partial = input.toLowerCase();
      const matches = ALL_COMMANDS.filter((c) => c.startsWith(partial));
      if (matches.length === 1) {
        setInput(matches[0] + " ");
        setTabCompletions([]);
      } else if (matches.length > 1) {
        const prefix = commonPrefix(matches);
        if (prefix.length > partial.length) {
          setInput(prefix);
        }
        setTabCompletions(matches);
      }
    } else {
      const cmd = input.substring(0, lastSpaceIndex);
      const searchPath = input.substring(lastSpaceIndex + 1);
      const segments = searchPath.split("/");
      const lastSegment = segments.pop() || "";
      const dirPathPrefix = segments.length > 0 ? segments.join("/") + "/" : "";

      let effectiveDir = currentPathRef.current;
      if (dirPathPrefix === "projects/" && currentPathRef.current === "~") {
        effectiveDir = "~/projects";
      } else if (dirPathPrefix.match(/^projects\/[^/]+\/$/) && currentPathRef.current === "~") {
        const projId = dirPathPrefix.split("/")[1];
        effectiveDir = `~/projects/${projId}`;
      }

      const items = getFileSystemItems(effectiveDir);
      const matches = items.filter((item) =>
        item.toLowerCase().startsWith(lastSegment.toLowerCase())
      );

      if (matches.length === 1) {
        setInput(`${cmd} ${dirPathPrefix}${matches[0]}`);
        setTabCompletions([]);
      } else if (matches.length > 1) {
        const prefix = commonPrefix(matches);
        if (prefix.length > lastSegment.length) {
          setInput(`${cmd} ${dirPathPrefix}${prefix}`);
        }
        setTabCompletions(matches);
      }
    }
  }, [input]);

  const handleOpenProject = async (project: Project) => {
    addLine(`Loading ${project.id}...`, "system");
    try {
      const summary = await generateProjectSummary({
        projectName: project.name,
        description: project.description,
        stack: project.stack,
        features: project.features,
        challenges: project.challenges,
        demoLink: project.demoLink,
        githubLink: project.githubLink,
      });
      addLine(`\n${summary}\n`, "response", true);
    } catch {
      let out = `\nPROJECT: ${project.name}\n`;
      out += `====================================\n`;
      out += `STACK:       ${project.stack}\n`;
      out += `DESCRIPTION: ${project.description}\n\n`;
      out += `FEATURES:\n${project.features}\n\n`;
      out += `CHALLENGES:\n${project.challenges}\n\n`;
      out += `------------------------------------\n`;
      out += `LINKS:\n`;
      if (project.demoLink) out += `LIVE DEMO:   ${project.demoLink}\n`;
      if (project.githubLink) out += `SOURCE CODE: ${project.githubLink}\n`;
      addLine(out, "response");
    }
  };

  const handleCommand = async (cmd: string, path: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    if (trimmedCmd.toLowerCase() !== "clear") {
      setCmdHistory((prev) => [trimmedCmd, ...prev]);
    }

    setHistoryIndex(-1);
    addLine(trimmedCmd, "command", false, path);
    setInput("");
    setIsProcessing(true);
    setTabCompletions([]);

    const args = trimmedCmd.split(/\s+/);
    const command = args[0].toLowerCase();
    const rawFlags = args
      .filter((a) => a.startsWith("-"))
      .join("")
      .replace(/-/g, "");
    const positional = args.filter((a) => !a.startsWith("-") && a !== command);
    const fileArg = positional[0];

    switch (command) {
      case "ll":
      case "ls": {
        const flags = command === "ll" ? "la" : rawFlags;
        const targetPath =
          fileArg === "projects" && path === "~"
            ? "~/projects"
            : fileArg
            ? `${path}/${fileArg}`
            : path;
        if (targetPath === "~/projects" && !flags.includes("l")) {
          addLine(getProjectsListing(), "response");
        } else {
          addLine(getLsOutput(targetPath, flags), "response");
        }
        break;
      }

      case "pwd":
        addLine(path.replace("~", "/home/simon"), "response");
        break;

      case "echo":
        addLine(args.slice(1).join(" "), "response");
        break;

      case "date":
        addLine(new Date().toString(), "response");
        break;

      case "uname":
        if (rawFlags.includes("a")) {
          addLine(
            "bytefolio-os bytefolio 5.15.0-react #1 SMP React-Kernel 18.2.0 x86_64 GNU/Linux",
            "response"
          );
        } else {
          addLine("bytefolio-os", "response");
        }
        break;

      case "neofetch":
        addLine(getNeofetch(), "response");
        break;

      case "history": {
        const out = cmdHistory
          .slice()
          .reverse()
          .map((c, i) => `  ${String(i + 1).padStart(4)}  ${c}`)
          .join("\n");
        addLine(out || "(no history)", "response");
        break;
      }

      case "tree":
        addLine(getTreeOutput(path), "response");
        break;

      case "man": {
        const manCmd = args[1]?.toLowerCase();
        if (!manCmd) {
          addLine("What manual page do you want?\nUsage: man [command]", "error");
        } else if (MAN_PAGES[manCmd]) {
          addLine(MAN_PAGES[manCmd], "response");
        } else {
          addLine(`No manual entry for ${manCmd}`, "error");
        }
        break;
      }

      case "help":
        addLine(
          `Available commands:

  Navigation:
    cd [dir]         change directory (supports .., ~, absolute paths)
    ls [flags]       list directory contents  (-l long, -a all, -la both)
    ll               alias for ls -la
    pwd              print working directory
    tree             show directory tree

  Portfolio:
    about            about me
    skills           technical skills
    experience       work history
    contact          contact info
    projects         navigate to projects/
    whoami           current user
    resume           open resume PDF

  File:
    cat [file]       display file contents
    open [file]      open file or directory

  Utilities:
    echo [text]      print text to terminal
    date             current date and time
    uname [-a]       system information
    neofetch         system overview with ASCII art
    history          command history
    man [cmd]        show manual for a command
    clear            clear terminal

  Keyboard shortcuts:
    Tab              autocomplete commands and paths
    ↑ / ↓           cycle command history
    Ctrl+C           cancel current input
    Ctrl+L           clear screen
    Ctrl+U           clear line
    Ctrl+K           delete to end of line
    Ctrl+A           move to line start
    Ctrl+E           move to line end`,
          "response"
        );
        break;

      case "about":
        addLine(
          `ABOUT ME\n====================================\n${portfolioData.identity.bio}\n\nLocation: ${portfolioData.identity.location}`,
          "response"
        );
        break;

      case "whoami":
        addLine(`${portfolioData.identity.name}\n${portfolioData.identity.title}`, "response");
        break;

      case "skills": {
        let out = "TECHNICAL SKILLS\n====================================\n";
        portfolioData.skills.forEach((skill) => {
          out += `${(skill.category + ":").padEnd(12)} ${skill.items.join(", ")}\n`;
        });
        addLine(out, "response");
        break;
      }

      case "experience": {
        let out = "PROFESSIONAL HISTORY\n====================================\n";
        portfolioData.experience.forEach((exp) => {
          out += `[${exp.period}] ${exp.role} @ ${exp.company}\n   ${exp.description}\n\n`;
        });
        addLine(out, "response");
        break;
      }

      case "contact":
        addLine(
          `CONTACT INFORMATION\n====================================\nEmail:    ${portfolioData.identity.email}\nLinkedIn: ${portfolioData.identity.linkedin}\nGitHub:   ${portfolioData.identity.github}`,
          "response"
        );
        break;

      case "resume":
        addLine("Opening resume...", "system");
        window.open(portfolioData.identity.resume, "_blank");
        break;

      case "projects":
        setCurrentPath("~/projects");
        addLine(getProjectsListing(), "response");
        break;

      case "cd": {
        const target = fileArg;
        if (!target || target === "~" || target === "/") {
          setCurrentPath("~");
          break;
        }
        if (target === "-") {
          addLine("bash: cd: OLDPWD not set", "error");
          break;
        }

        // Resolve an absolute-style path to a valid virtual path
        const resolveAbsolute = (t: string): string | null => {
          const normalized = t.replace(/^\/home\/simon/, "~").replace(/\/+$/, "") || "~";
          if (normalized === "~") return "~";
          if (normalized === "~/projects") return "~/projects";
          if (normalized.match(/^~\/projects\/[^/]+$/)) {
            const projId = normalized.split("/")[2];
            if (portfolioData.projects.find((p) => p.id === projId)) return normalized;
          }
          return null;
        };

        if (target.startsWith("~") || target.startsWith("/home/simon")) {
          const resolved = resolveAbsolute(target);
          if (resolved) {
            setCurrentPath(resolved);
            addLine(getLsOutput(resolved, ""), "response");
          } else {
            addLine(`bash: cd: ${target}: No such file or directory`, "error");
          }
          break;
        }

        // Walk a relative path segment-by-segment (handles multi-segment and trailing slashes)
        const resolveRelative = (base: string, rel: string): string | "NOT_FOUND" | "NOT_DIR" => {
          const segments = rel.replace(/\/+$/, "").split("/").filter(Boolean);
          let cur = base;
          for (const seg of segments) {
            if (seg === ".") continue;
            if (seg === "..") {
              if (cur === "~/projects") cur = "~";
              else if (cur.startsWith("~/projects/")) cur = "~/projects";
              // at "~" already at root, stay
              continue;
            }
            const items = getFileSystemItems(cur);
            if (items.includes(seg + "/")) {
              // It's a directory
              if (cur === "~" && seg === "projects") {
                cur = "~/projects";
              } else if (cur === "~/projects") {
                const proj = portfolioData.projects.find((p) => p.id === seg);
                if (!proj) return "NOT_FOUND";
                cur = `~/projects/${seg}`;
              } else {
                return "NOT_FOUND"; // no deeper nesting
              }
            } else if (items.includes(seg)) {
              return "NOT_DIR"; // it's a file
            } else {
              return "NOT_FOUND";
            }
          }
          return cur;
        };

        const result = resolveRelative(path, target);
        if (result === "NOT_FOUND") {
          addLine(`bash: cd: ${target}: No such file or directory`, "error");
        } else if (result === "NOT_DIR") {
          addLine(`bash: cd: ${target}: Not a directory`, "error");
        } else {
          setCurrentPath(result);
          if (result === "~/projects") {
            addLine(getProjectsListing(), "response");
          } else if (result.startsWith("~/projects/")) {
            const proj = portfolioData.projects.find((p) => p.id === result.split("/")[2]);
            if (proj) addLine(getProjectDetail(proj), "response");
          } else {
            addLine(getLsOutput(result, ""), "response");
          }
        }
        break;
      }

      case "open":
      case "cat": {
        if (!fileArg) {
          addLine(`Usage: ${command} [file]`, "system");
          break;
        }

        // Files in home
        if (fileArg === "about.txt" || fileArg === "about") {
          addLine(
            `ABOUT ME\n====================================\n${portfolioData.identity.bio}\n\nLocation: ${portfolioData.identity.location}`,
            "response"
          );
          break;
        }
        if (fileArg === "skills.txt") {
          let out = "TECHNICAL SKILLS\n====================================\n";
          portfolioData.skills.forEach((s) => {
            out += `${(s.category + ":").padEnd(12)} ${s.items.join(", ")}\n`;
          });
          addLine(out, "response");
          break;
        }
        if (fileArg === "experience.txt") {
          let out = "PROFESSIONAL HISTORY\n====================================\n";
          portfolioData.experience.forEach((exp) => {
            out += `[${exp.period}] ${exp.role} @ ${exp.company}\n   ${exp.description}\n\n`;
          });
          addLine(out, "response");
          break;
        }
        if (fileArg === "contact.txt") {
          addLine(
            `CONTACT INFORMATION\n====================================\nEmail:    ${portfolioData.identity.email}\nLinkedIn: ${portfolioData.identity.linkedin}\nGitHub:   ${portfolioData.identity.github}`,
            "response"
          );
          break;
        }

        // Files inside a project dir
        if (fileArg === "README.md" && path.startsWith("~/projects/") && path.split("/").length === 3) {
          const proj = portfolioData.projects.find((p) => p.id === path.split("/")[2]);
          if (proj) { await handleOpenProject(proj); break; }
        }
        if (fileArg === "details.json" && path.startsWith("~/projects/") && path.split("/").length === 3) {
          const proj = portfolioData.projects.find((p) => p.id === path.split("/")[2]);
          if (proj) { addLine(JSON.stringify(proj, null, 2), "response"); break; }
        }

        // Try as a project name / directory
        const cleanArg = fileArg.replace(/\/$/, "");
        const proj = portfolioData.projects.find((p) => p.id === cleanArg);
        if (proj) {
          setCurrentPath(`~/projects/${proj.id}`);
          await handleOpenProject(proj);
          break;
        }

        addLine(`${command}: ${fileArg}: No such file or directory`, "error");
        break;
      }

      case "clear":
        setHistory([]);
        await runBootSequence();
        break;

      default:
        if (trimmedCmd.includes("/") || trimmedCmd.endsWith(".sh")) {
          addLine(`bash: ${command}: Permission denied`, "error");
        } else {
          addLine(`bash: ${command}: command not found\nType 'help' to see available commands.`, "error");
        }
    }

    setIsProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") setTabCompletions([]);

    if (e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case "c":
          e.preventDefault();
          if (input) addLine(`${input}^C`, "command");
          setInput("");
          setHistoryIndex(-1);
          setIsProcessing(false);
          return;
        case "l":
          e.preventDefault();
          setHistory([]);
          return;
        case "u":
          e.preventDefault();
          setInput("");
          return;
        case "k":
          e.preventDefault();
          if (inputRef.current) {
            const pos = inputRef.current.selectionStart ?? input.length;
            setInput(input.substring(0, pos));
          }
          return;
        case "a":
          e.preventDefault();
          inputRef.current?.setSelectionRange(0, 0);
          return;
        case "e":
          e.preventDefault();
          inputRef.current?.setSelectionRange(input.length, input.length);
          return;
      }
    }

    switch (e.key) {
      case "Enter":
        handleCommand(input, currentPathRef.current);
        break;
      case "Tab":
        e.preventDefault();
        handleTab();
        break;
      case "ArrowUp":
        e.preventDefault();
        setCmdHistory((prev) => {
          if (historyIndex < prev.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const newInput = prev[newIndex];
            setInput(newInput);
            requestAnimationFrame(() => {
              inputRef.current?.setSelectionRange(newInput.length, newInput.length);
            });
          }
          return prev;
        });
        break;
      case "ArrowDown":
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setCmdHistory((prev) => {
            const newInput = prev[newIndex];
            setInput(newInput);
            requestAnimationFrame(() => {
              inputRef.current?.setSelectionRange(newInput.length, newInput.length);
            });
            return prev;
          });
        } else {
          setHistoryIndex(-1);
          setInput("");
        }
        break;
    }
  };

  const focusInput = () => inputRef.current?.focus();

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full font-mono overflow-hidden text-xs sm:text-sm",
        compact
          ? "max-w-full p-2 sm:p-3"
          : "max-w-5xl mx-auto p-3 sm:p-4 md:p-8"
      )}
      onClick={focusInput}
    >
      <div
        ref={scrollRef}
        className="terminal-container flex-1 overflow-y-auto overflow-x-auto mb-2 pr-1 sm:pr-2 space-y-1"
      >
        {history.map((line) => (
          <TerminalLine key={line.id} line={line} />
        ))}
        {isProcessing && !isBooting && (
          <div className="text-primary animate-pulse italic text-sm">processing...</div>
        )}
      </div>

      {/* Tab completions display */}
      {tabCompletions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-x-6 gap-y-0.5 text-sm border-t border-border/30 pt-2">
          {tabCompletions.map((c) => (
            <span key={c} className="text-primary/80">
              {c}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center text-accent">
        <span className="mr-2 whitespace-nowrap select-none">
          <span className="hidden sm:inline">visitor@bytefolio:{currentPath}$</span>
          <span className="sm:hidden">{currentPath.split("/").pop() || "~"}$</span>
        </span>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent outline-none border-none p-0 m-0 caret-white selection:bg-accent/30"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isBooting || isProcessing}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
      </div>
    </div>
  );
}
