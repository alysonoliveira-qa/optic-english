// RankingModal — ranking da equipe (Fase 3).
//
// Lê `profiles` (mastered, level) ordenado — a policy de SELECT (Fase 1) permite
// que qualquer usuário logado leia os nomes de todos. As estatísticas são
// mantidas pelo adapter (src/lib/appStorage.js) a cada save/load.
import React, { useEffect, useState } from "react";
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
  line: "#D7DDD2",
};
const FONT_HEAD = "'Fraunces', Georgia, serif";
const FONT_BODY = "'Inter', -apple-system, sans-serif";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RankingModal({ currentUserId, onClose }) {
  const [rows, setRows] = useState(null); // null = carregando
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error: err } = await supabase
        .from("profiles")
        .select("id, display_name, mastered, level")
        .not("display_name", "is", null)
        .order("mastered", { ascending: false })
        .order("level", { ascending: false })
        .limit(100);
      if (!alive) return;
      if (err) setError(err.message);
      else setRows(data || []);
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28,41,33,.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 1000,
        fontFamily: FONT_BODY,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.bg,
          borderRadius: 20,
          width: "100%",
          maxWidth: 460,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 16px 48px rgba(28,41,33,.35)",
        }}
      >
        <div
          style={{
            background: C.card,
            color: C.cream,
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.gold }}>
              Ótica VooX
            </div>
            <h2 style={{ fontFamily: FONT_HEAD, fontSize: 22, margin: "2px 0 0" }}>
              🏆 Ranking da equipe
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: `1px solid ${C.goldDeep}`,
              color: C.gold,
              borderRadius: 8,
              padding: "6px 12px",
              cursor: "pointer",
              fontFamily: FONT_BODY,
              fontSize: 13,
            }}
          >
            Fechar
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: "12px 14px 18px" }}>
          {error && (
            <p style={{ color: "#B4552D", fontSize: 14, padding: "8px 6px" }}>
              Não foi possível carregar o ranking: {error}
            </p>
          )}
          {!error && rows === null && (
            <p style={{ color: C.inkSoft, fontSize: 14, padding: "8px 6px" }}>Carregando…</p>
          )}
          {!error && rows && rows.length === 0 && (
            <p style={{ color: C.inkSoft, fontSize: 14, padding: "8px 6px" }}>
              Ainda não há ninguém no ranking. Seja o primeiro a dominar cards!
            </p>
          )}
          {!error &&
            rows &&
            rows.map((r, i) => {
              const me = r.id === currentUserId;
              return (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    marginTop: i === 0 ? 0 : 8,
                    borderRadius: 12,
                    background: me ? C.card : C.paper,
                    color: me ? C.cream : C.ink,
                    border: `1px solid ${me ? C.goldDeep : C.line}`,
                  }}
                >
                  <div
                    style={{
                      minWidth: 30,
                      textAlign: "center",
                      fontFamily: FONT_HEAD,
                      fontSize: 18,
                      fontWeight: 700,
                      color: me ? C.gold : C.goldDeep,
                    }}
                  >
                    {MEDALS[i] || i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.display_name}
                      {me && <span style={{ color: C.gold, fontWeight: 400 }}> · você</span>}
                    </div>
                    <div style={{ fontSize: 12, color: me ? "#B9C4BB" : C.inkSoft }}>
                      Nível {r.level ?? 1}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: FONT_HEAD, fontSize: 20, fontWeight: 700 }}>
                      {r.mastered ?? 0}
                    </div>
                    <div style={{ fontSize: 11, color: me ? "#B9C4BB" : C.inkSoft }}>frases</div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
