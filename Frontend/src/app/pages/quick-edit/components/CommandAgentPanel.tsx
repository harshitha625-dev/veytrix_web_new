import { useState, useEffect, useCallback } from "react";
import { Wand2, Loader2, CheckCircle2, XCircle, Send } from "lucide-react";
import { buildApiUrl } from "@/lib/api";

async function handle(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

const api = {
  health: () => fetch("http://127.0.0.1:5000/api/health").then(handle),
  getProject: () => fetch("http://127.0.0.1:5000/api/project").then(handle),
  sendCommand: (command: string) =>
    fetch("http://127.0.0.1:5000/api/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    }).then(handle),
};

const EXAMPLES = [
  "Add smooth zoom effect to clip 1",
  "Apply vintage filter to all clips",
  "Add fade transition to clip 1",
  "Apply neon glow text style",
  "Add caption Hello World",
];

interface CommandAgentPanelProps {
  onExecuteActions?: (actions: any[]) => void;
}

export function CommandAgentPanel({ onExecuteActions }: CommandAgentPanelProps) {
  const [project, setProject] = useState(null);
  const [health, setHealth] = useState<any>(null);
  const [log, setLog] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [value, setValue] = useState("");

  const refreshAll = useCallback(async () => {
    try {
      const [proj, h] = await Promise.all([api.getProject(), api.health()]);
      setProject(proj);
      setHealth(h);
    } catch (err) {
      console.error("Failed to connect to Command Agent Backend", err);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  async function handleCommand(command: string) {
    if (!command.trim() || busy) return;
    setBusy(true);
    setValue("");
    try {
      const result = await api.sendCommand(command);
      setProject(result.project || project);
      setLog((prev) => [{ command, ...result }, ...prev]);
      if (result.success && result.actions && onExecuteActions) {
        onExecuteActions(result.actions);
      }
    } catch (err: any) {
      setLog((prev) => [{ command, error: err.message }, ...prev]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col h-full w-full space-y-4 pt-1">
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-2 px-1">
        <div className="flex items-center gap-2">
          <Wand2 className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">AI Command Agent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${health?.hasApiKey ? "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]" : "bg-red-500"}`} />
          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
             {health?.hasApiKey ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 px-1 min-h-0">
        {log.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
            <Wand2 className="w-5 h-5 text-slate-600 mx-auto mb-2 opacity-50" />
            <span className="text-[9px] text-slate-500 block">
              Tell the agent what to do in plain English.
            </span>
          </div>
        ) : (
          log.map((entry, i) => (
            <div key={i} className="bg-black/40 border border-white/5 rounded-xl p-3 space-y-2">
              <div className="text-[9px] font-bold text-teal-300">"{entry.command}"</div>
              
              {entry.error ? (
                <div className="text-[9px] text-red-400">{entry.error}</div>
              ) : (
                <>
                  <div className="text-[9px] text-slate-300 leading-relaxed">{entry.message}</div>
                  <div className="space-y-1 mt-1.5 pt-1.5 border-t border-white/[0.05]">
                    {(entry.results || []).map((r: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[8px]">
                        {r.ok ? <CheckCircle2 className="w-2.5 h-2.5 text-teal-400 shrink-0 mt-[1px]" /> : <XCircle className="w-2.5 h-2.5 text-red-400 shrink-0 mt-[1px]" />}
                        <span className={r.ok ? "text-slate-400" : "text-red-300"}>{r.detail}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="space-y-2 pt-2 border-t border-white/[0.05] shrink-0">
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => setValue(ex)}
              className="px-1.5 py-0.5 bg-white/[0.03] border border-white/10 rounded hover:bg-white/10 text-[7.5px] text-slate-400 transition-colors truncate max-w-full cursor-pointer"
            >
              {ex}
            </button>
          ))}
        </div>
        
        <form 
          onSubmit={(e) => { e.preventDefault(); handleCommand(value); }}
          className="flex gap-2 relative"
        >
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Type a command..."
            disabled={busy}
            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={busy || !value.trim()}
            className="flex items-center justify-center shrink-0 w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          </button>
        </form>
      </div>
    </div>
  );
}
