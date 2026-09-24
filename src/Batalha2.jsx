import React, { useMemo, useState } from "react";
import "./Batalha.css";

/**
 * Batalha
 * Tela de confronto entre dois concorrentes ("quem venceria?").
 * Reúne os dois estados do mockup original: discussão da comunidade
 * recolhida (seta para cima) e expandida (seta para baixo), controlados
 * pelo mesmo componente através do estado `discussaoAberta`.
 *
 * Props opcionais:
 *  - confronto: { nomeA, anoA, nomeB, anoB, votosA, votosB }
 *  - onVoltar(): navegação de volta para a tela inicial
 */
const COMENTARIOS_INICIAIS = {
  a: [
    { id: 1, texto: "BURROS!", curtidas: 2, descurtidas: 5 },
    { id: 2, texto: "Ele tem o batmóvel", curtidas: 8, descurtidas: 1 },
    { id: 3, texto: "Não foi descoberto", curtidas: 3, descurtidas: 0 },
  ],
  b: [
    {
      id: 1,
      texto: "De acordo com o ep.20 minutos já é possível ver que pipipipopopo",
      curtidas: 6,
      descurtidas: 1,
    },
    { id: 2, texto: "É o Homem de Ferro simplesmente", curtidas: 9, descurtidas: 0 },
    { id: 3, texto: "Se eu estivesse errado votaria no Batman", curtidas: 4, descurtidas: 2 },
  ],
};

export default function Batalha({ confronto, onVoltar }) {
  const dados = confronto ?? {
    nomeA: "Batman",
    anoA: 2001,
    nomeB: "Homem de ferro",
    anoB: 2009,
    votosA: 44,
    votosB: 56,
  };

  const [votos, setVotos] = useState({ a: dados.votosA, b: dados.votosB });
  const [votoEscolhido, setVotoEscolhido] = useState(null);
  const [discussaoAberta, setDiscussaoAberta] = useState(true);
  const [comentarios, setComentarios] = useState(COMENTARIOS_INICIAIS);

  const total = votos.a + votos.b;
  const pctA = useMemo(
    () => (total ? Math.round((votos.a / total) * 100) : 0),
    [votos, total]
  );
  const pctB = 100 - pctA;

  function votar(lado) {
    if (votoEscolhido) return; // só permite um voto por sessão
    setVotos((v) => ({ ...v, [lado]: v[lado] + 1 }));
    setVotoEscolhido(lado);
  }

  function reagir(lado, id, tipo) {
    setComentarios((prev) => ({
      ...prev,
      [lado]: prev[lado].map((c) =>
        c.id === id
          ? {
              ...c,
              curtidas: tipo === "curtir" ? c.curtidas + 1 : c.curtidas,
              descurtidas: tipo === "descurtir" ? c.descurtidas + 1 : c.descurtidas,
            }
          : c
      ),
    }));
  }

  return (
    <div className="bt-pagina">
      <header className="bt-header">
        <button className="bt-icon-btn" aria-label="Abrir menu">
          ☰
        </button>

        <div className="bt-busca">
          <span aria-hidden="true">🔍</span>
          <input type="text" placeholder="Buscar" aria-label="Buscar" />
        </div>

        <nav className="bt-nav">
          <a href="#inicio" onClick={onVoltar}>
            Inicial
          </a>
          <a href="#personagens">Personagens</a>
          <a href="#comunidade">Comunidade</a>
        </nav>

        <div className="bt-conta">
          <a href="#cadastrar">Cadastrar</a>
          <a href="#entrar">Entrar</a>
          <span className="bt-avatar" aria-hidden="true">
            🧑
          </span>
        </div>
      </header>

      <main className="bt-painel">
        <h1 className="bt-titulo">
          {dados.nomeA} ({dados.anoA}) <span className="bt-vs">VS</span>{" "}
          {dados.nomeB} ({dados.anoB})
        </h1>

        <div className="bt-confronto">
          <button className="bt-seta" aria-label="Confronto anterior" type="button">
            ←
          </button>

          <div className="bt-cartas">
            <button
              type="button"
              className={`bt-carta ${votoEscolhido === "a" ? "bt-carta--votada" : ""}`}
              onClick={() => votar("a")}
            >
              <h2>
                {dados.nomeA} ({dados.anoA})
              </h2>
              <span className="bt-carta-icone">🦇</span>
              <span className="bt-carta-botao">ELE VENCERIA!</span>
            </button>

            <span className="bt-vs-grande">VS</span>

            <button
              type="button"
              className={`bt-carta ${votoEscolhido === "b" ? "bt-carta--votada" : ""}`}
              onClick={() => votar("b")}
            >
              <h2>
                {dados.nomeB} ({dados.anoB})
              </h2>
              <span className="bt-carta-icone">🦾</span>
              <span className="bt-carta-botao">ELE VENCERIA!</span>
            </button>
          </div>

          <button className="bt-seta" aria-label="Próximo confronto" type="button">
            →
          </button>
        </div>

        <div className="bt-barra" role="img" aria-label={`${pctA}% a ${pctB}%`}>
          <div className="bt-barra-a" style={{ width: `${pctA}%` }} />
          <div className="bt-barra-b" style={{ width: `${pctB}%` }} />
        </div>
        <div className="bt-barra-legenda">
          <span>{pctA}%</span>
          <span>{pctB}%</span>
        </div>

        <section className="bt-discussao">
          <button
            type="button"
            className="bt-discussao-topo"
            onClick={() => setDiscussaoAberta((a) => !a)}
            aria-expanded={discussaoAberta}
          >
            <span className="bt-chevron">{discussaoAberta ? "▾" : "▴"}</span>
            Discussão da comunidade
          </button>

          {discussaoAberta && (
            <div className="bt-colunas">
              <div className="bt-coluna">
                <h3>Team {dados.nomeA}</h3>
                {comentarios.a.map((c) => (
                  <div key={c.id} className="bt-comentario">
                    <span className="bt-comentario-icone" aria-hidden="true">
                      👤
                    </span>
                    <p>{c.texto}</p>
                    <div className="bt-reacoes">
                      <button
                        type="button"
                        aria-label="Descurtir"
                        onClick={() => reagir("a", c.id, "descurtir")}
                      >
                        👎 {c.descurtidas}
                      </button>
                      <button
                        type="button"
                        aria-label="Curtir"
                        onClick={() => reagir("a", c.id, "curtir")}
                      >
                        👍 {c.curtidas}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bt-coluna">
                <h3>Team {dados.nomeB}</h3>
                {comentarios.b.map((c) => (
                  <div key={c.id} className="bt-comentario">
                    <span className="bt-comentario-icone" aria-hidden="true">
                      👤
                    </span>
                    <p>{c.texto}</p>
                    <div className="bt-reacoes">
                      <button
                        type="button"
                        aria-label="Descurtir"
                        onClick={() => reagir("b", c.id, "descurtir")}
                      >
                        👎 {c.descurtidas}
                      </button>
                      <button
                        type="button"
                        aria-label="Curtir"
                        onClick={() => reagir("b", c.id, "curtir")}
                      >
                        👍 {c.curtidas}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <a href="#sobre" className="bt-sobre">
            SOBRE NÓS
          </a>
        </section>
      </main>
    </div>
  );
}
