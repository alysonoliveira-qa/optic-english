// AuthGate — portão de autenticação do "English no Balcão" (Fase 1).
//
// Envolve o app: sem sessão mostra login por magic link; com sessão mas sem
// nome no perfil pede o nome; com tudo ok renderiza o app + barra de sair.
// O app (voox-english-trainer.jsx) não sabe que isso existe.
//
// Visual segue os design tokens ALNA do app (não alterar sem confirmar).
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient.js";

const C = {
  bg: "#ECF0E8",
  card: "#20342A",
  cardSoft: "#2A4234",
  ink: "#1C2921",
  inkSoft: "#4A5A50",
  paper: "#F8F7F2",
  gold: "#C8A96E",
  goldDeep: "#A8894E",
  cream: "#EFE9DA",
  ok: "#4C7A5E",
  bad: "#B4552D",
  line: "#D7DDD2",
};
const FONT_HEAD = "'Fraunces', Georgia, serif";
const FONT_BODY = "'Inter', -apple-system, sans-serif";

const S = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: FONT_BODY,
  },
  card: {
    background: C.card,
    color: C.cream,
    borderRadius: 20,
    padding: "36px 28px",
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 12px 40px rgba(28,41,33,.25)",
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: C.gold,
    marginBottom: 8,
  },
  title: { fontFamily: FONT_HEAD, fontSize: 28, margin: "0 0 6px" },
  sub: { fontSize: 14, color: "#B9C4BB", margin: "0 0 22px", lineHeight: 1.5 },
  label: { display: "block", fontSize: 13, marginBottom: 6, color: C.cream },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: 12,
    border: `1px solid ${C.cardSoft}`,
    background: C.paper,
    color: C.ink,
    fontSize: 15,
    fontFamily: FONT_BODY,
    outline: "none",
  },
  button: {
    width: "100%",
    marginTop: 14,
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: C.gold,
    color: C.ink,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: FONT_BODY,
    cursor: "pointer",
  },
  error: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(180,85,45,.15)",
    border: `1px solid ${C.bad}`,
    color: "#E8B39B",
    fontSize: 13,
    lineHeight: 1.45,
  },
  notice: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(76,122,94,.18)",
    border: `1px solid ${C.ok}`,
    color: "#9FD3AE",
    fontSize: 13,
    lineHeight: 1.45,
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    padding: "6px 12px",
    background: C.card,
    color: C.cream,
    fontFamily: FONT_BODY,
    fontSize: 12,
  },
  signout: {
    background: "transparent",
    border: `1px solid ${C.goldDeep}`,
    color: C.gold,
    borderRadius: 8,
    padding: "4px 10px",
    fontSize: 12,
    fontFamily: FONT_BODY,
    cursor: "pointer",
  },
};

function Shell({ children }) {
  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.kicker}>Ótica VooX · Feira dos Importados</div>
        <h1 style={S.title}>English no Balcão</h1>
        {children}
      </div>
    </div>
  );
}

export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined); // undefined = carregando
  const [profile, setProfile] = useState(undefined); // undefined = carregando
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  // Sessão: carrega a atual e escuta mudanças (login via magic link, logout).
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Perfil: busca quando há sessão.
  useEffect(() => {
    if (!session) { setProfile(undefined); return; }
    let alive = true;
    (async () => {
      const { data, error: err } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", session.user.id)
        .maybeSingle();
      if (!alive) return;
      if (err) { setError(err.message); setProfile(null); return; }
      setProfile(data ?? null);
    })();
    return () => { alive = false; };
  }, [session]);

  const sendLink = useCallback(async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (err) setError(err.message);
    else setSent(true);
  }, [email]);

  const saveName = useCallback(async (e) => {
    e.preventDefault();
    const display_name = name.trim();
    if (!display_name) return;
    setBusy(true); setError(null);
    const { error: err } = await supabase
      .from("profiles")
      .upsert({ id: session.user.id, display_name });
    setBusy(false);
    if (err) setError(err.message);
    else setProfile({ display_name });
  }, [name, session]);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  // --- carregando sessão ---
  if (session === undefined) {
    return (
      <Shell>
        <p style={S.sub}>Carregando…</p>
      </Shell>
    );
  }

  // --- sem sessão: login por magic link ---
  if (!session) {
    return (
      <Shell>
        <p style={S.sub}>
          Entre com seu e-mail. Você vai receber um <strong>link mágico</strong> —
          é só clicar nele para entrar, sem senha.
        </p>
        <form onSubmit={sendLink}>
          <label style={S.label} htmlFor="email">Seu e-mail</label>
          <input
            id="email"
            style={S.input}
            type="email"
            required
            autoComplete="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setSent(false); }}
          />
          <button style={S.button} type="submit" disabled={busy || !email.trim()}>
            {busy ? "Enviando…" : "Enviar link de acesso"}
          </button>
        </form>
        {sent && (
          <div style={S.notice}>
            Link enviado! Confira sua caixa de entrada (e o spam) e clique no
            link para entrar. Pode fechar esta aba.
          </div>
        )}
        {error && <div style={S.error}>{error}</div>}
      </Shell>
    );
  }

  // --- com sessão, carregando perfil ---
  if (profile === undefined) {
    return (
      <Shell>
        <p style={S.sub}>Carregando seu perfil…</p>
      </Shell>
    );
  }

  // --- com sessão, sem nome: completar perfil ---
  if (!profile || !profile.display_name) {
    return (
      <Shell>
        <p style={S.sub}>
          Quase lá! Como você quer aparecer no ranking da equipe?
        </p>
        <form onSubmit={saveName}>
          <label style={S.label} htmlFor="name">Seu nome</label>
          <input
            id="name"
            style={S.input}
            type="text"
            required
            maxLength={40}
            placeholder="Ex.: Alyson"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button style={S.button} type="submit" disabled={busy || !name.trim()}>
            {busy ? "Salvando…" : "Começar a treinar"}
          </button>
        </form>
        {error && <div style={S.error}>{error}</div>}
      </Shell>
    );
  }

  // --- autenticado + perfil ok: app ---
  return (
    <>
      <div style={S.topbar}>
        <span>{profile.display_name}</span>
        <button style={S.signout} onClick={signOut}>Sair</button>
      </div>
      {children}
    </>
  );
}
