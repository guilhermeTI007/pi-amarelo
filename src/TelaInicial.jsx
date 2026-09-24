import React, { useState } from "react";
import "./TelaInicial.css";

/**
 * TelaInicial
 * Página principal do site de batalhas ("quem venceria?").
 * Recebe duas props opcionais para permitir navegação real quando
 * este componente for plugado em um app com roteamento:
 *  - onAbrirBatalha(): chamada ao clicar no spotlight de batalha
 *  - onCriarBatalha(nomeA, nomeB): chamada ao enviar o duelo "Vamos batalhar!"
 */
export default function TelaInicial({ onAbrirBatalha, onCriarBatalha }) {
  const [ladoA, setLadoA] = useState("");
  const [ladoB, setLadoB] = useState("");

  const stats = [
    { label: "Personagens", valor: "2,059,073" },
    { label: "Celebridades", valor: "129,081" },
    { label: "Usuários", valor: "6,166,752" },
  ];

  const spotlightBatalha = {
    nomeA: "Batman",
    nomeB: "Homem de Ferro",
    iniciais: ["BT", "HF"],
    votos: 230,
    janela: "últimas 5h",
  };

  const spotlightTeoria = {
    autor: "Anônimo",
    texto: "Tomate é uma fruta",
  };

  function handleDuelo(e) {
    e.preventDefault();
    if (!ladoA.trim() || !ladoB.trim()) return;
    onCriarBatalha?.(ladoA.trim(), ladoB.trim());
    setLadoA("");
    setLadoB("");
  }

  return (
    <div className="ti-pagina">
      <header className="ti-header">
        <button className="ti-icon-btn" aria-label="Abrir menu">
          ☰
        </button>

        <div className="ti-busca">
          <span className="ti-busca-icone">🔍</span>
          <input type="text" placeholder="Buscar" aria-label="Buscar" />
        </div>

        <nav className="ti-nav">
          <a href="#inicio">Inicial</a>
          <a href="#personagens">Personagens</a>
          <a href="#comunidade">Comunidade</a>
        </nav>

        <div className="ti-conta">
          <a href="#cadastrar">Cadastrar</a>
          <a href="#entrar">Entrar</a>
          <span className="ti-avatar" aria-hidden="true">
            🧑
          </span>
        </div>
      </header>

      <section className="ti-hero">
        <div className="ti-hero-texto">
          <h1>
            Tudo que eu pensava era
            <span className="ti-hero-briga">“BRIGA!”</span>
          </h1>
          <p className="ti-hero-sub">Membro da comunidade ELE VENCERIA</p>

          <dl className="ti-stats">
            {stats.map((s) => (
              <div key={s.label} className="ti-stat">
                <dt>{s.label}</dt>
                <dd>{s.valor}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="ti-hero-cta">
          <p>
            Vote em confrontos lendários, defenda seu time e mostre para a
            comunidade quem realmente manda
          </p>
          <button className="ti-botao-principal" type="button">
            FAÇA PARTE
          </button>
        </div>
      </section>

      <section className="ti-painel">
        <h2>
          <span className="ti-estrela">★</span> Spotlight diário de batalha
        </h2>

        <button
          type="button"
          className="ti-spotlight-batalha"
          onClick={() => onAbrirBatalha?.()}
        >
          <span className="ti-confronto-icones">
            <span className="ti-icone ti-icone-a">
              {spotlightBatalha.iniciais[0]}
            </span>
            <span className="ti-vs-mini">VS</span>
            <span className="ti-icone ti-icone-b">
              {spotlightBatalha.iniciais[1]}
            </span>
          </span>

          <span className="ti-confronto-info">
            <span className="ti-confronto-titulo">
              {spotlightBatalha.nomeA} VS {spotlightBatalha.nomeB}
            </span>
            <span className="ti-confronto-votos">
              {spotlightBatalha.votos} votos nas {spotlightBatalha.janela} 🔥
            </span>
          </span>

          <span className="ti-seta" aria-hidden="true">
            ›
          </span>
        </button>
      </section>

      <section className="ti-painel">
        <h2>Vamos batalhar!</h2>

        <form className="ti-duelo" onSubmit={handleDuelo}>
          <input
            type="text"
            placeholder="Digite aqui"
            value={ladoA}
            onChange={(e) => setLadoA(e.target.value)}
            aria-label="Primeiro concorrente"
          />
          <span className="ti-vs-grande">VS</span>
          <input
            type="text"
            placeholder="Digite aqui"
            value={ladoB}
            onChange={(e) => setLadoB(e.target.value)}
            aria-label="Segundo concorrente"
          />
          <button type="submit" className="ti-botao-duelo">
            Criar batalha
          </button>
        </form>
      </section>

      <section className="ti-painel">
        <h2>
          <span className="ti-estrela">★</span> Spotlight melhor teoria
        </h2>

        <div className="ti-teoria">
          <span className="ti-confronto-icones">
            <span className="ti-icone ti-icone-a">BT</span>
            <span className="ti-vs-mini">VS</span>
            <span className="ti-icone ti-icone-b">HF</span>
          </span>

          <span className="ti-teoria-autor" aria-hidden="true">
            👤
          </span>
          <span className="ti-teoria-texto">{spotlightTeoria.texto}</span>
        </div>
      </section>
    </div>
  );
}
