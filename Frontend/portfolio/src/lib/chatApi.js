// .env files are gitignored, so a fresh clone must still build correctly —
// hence a per-mode default rather than relying on VITE_CHAT_API_URL existing.
// The endpoint is public either way: it ends up in the client bundle.
const DEFAULT_API = import.meta.env.DEV
  ? "http://localhost:5001/chat"
  : "https://portfolio-rust-eta-53.vercel.app/chat";

const API_URL = import.meta.env.VITE_CHAT_API_URL || DEFAULT_API;
const STORE_KEY = "nh_assistant_thread";

function sessionId() {
  let id = sessionStorage.getItem("nh_assistant_session");
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("nh_assistant_session", id);
  }
  return id;
}

export function loadThread() {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveThread(messages) {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-40)));
  } catch {
    /* Quota or private mode — the thread just won't persist. */
  }
}

export function clearThread() {
  sessionStorage.removeItem(STORE_KEY);
  sessionStorage.removeItem("nh_assistant_session");
}

/** Last 20 turns, flattened the way the backend prompt expects. */
function asHistory(messages) {
  return messages
    .slice(-20)
    .map((m) =>
      m.isBot
        ? `Assistant: ${(m.html || "").replace(/<[^>]*>/g, "")}`
        : `User: ${m.html || ""}`
    )
    .join("\n");
}

export async function askAssistant(message, messages, { voice = false } = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: message.trim(),
      conversation_history: asHistory(messages),
      session_id: sessionId(),
      voice_mode: voice,
    }),
  });

  if (!res.ok) throw new Error(`Assistant responded ${res.status}`);

  const data = await res.json();
  if (!data.response) throw new Error("Empty response from assistant");
  return data.response;
}
