import React from 'react';
import '../components/MenuSuperior_Rodape.css';
import './tela-inicial.css';

export default function TelaInicial() {
  function criarBatalha(e) {
    e.preventDefault();
    const a = e.target.a.value.trim();
    const b = e.target.b.value.trim();
    if (!a || !b) return;
    const ano = new Date().getFullYear();
    const params = new URLSearchParams({ a, b, anoA: ano, anoB: ano });
    window.location.href = 'batalha.html?' + params.toString();
  }

  return (
    <>
      <header className="navbar">
        <div className="nav-left">
          <button className="menu-btn" aria-label="Abrir menu">☰</button>
          <input className="search-bar" type="text" placeholder="Buscar" aria-label="Buscar" />
        </div>

        <nav className="nav-center">
          <a className="nav-link" href="tela-inicial.html">Inicial</a>
          <a className="nav-link" href="#">Personagens</a>
          <a className="nav-link" href="#">Comunidade</a>
        </nav>

        <div className="nav-right">
          <a className="nav-link" href="#">Cadastrar</a>
          <a className="nav-link" href="#">Entrar</a>
          <div className="user-icon" aria-hidden="true">🧑</div>
        </div>
      </header>

      <main className="conteudo">
        <section className="hero">
          <div className="hero-texto">
            <h1>Tudo que eu pensava era <span className="hero-briga">"BRIGA!"</span></h1>
            <p className="hero-sub">Membro da comunidade ELE VENCERIA</p>

            <div className="stats">
              <div className="stat">
                <span className="stat-valor">2,059,073</span>
                <span className="stat-label">Personagens</span>
              </div>
              <div className="stat">
                <span className="stat-valor">129,081</span>
                <span className="stat-label">Celebridades</span>
              </div>
              <div className="stat">
                <span className="stat-valor">6,166,752</span>
                <span className="stat-label">Usuários</span>
              </div>
            </div>
          </div>

          <div className="hero-cta">
            <p>Vote em confrontos lendários, defenda seu time e mostre para a comunidade quem realmente manda</p>
            <button className="botao-principal" type="button">FAÇA PARTE</button>
          </div>
        </section>

        <section className="painel">
          <h2><span className="estrela">★</span> Spotlight diário de batalha</h2>

          <a
            className="spotlight-batalha"
            href="batalha.html?a=Batman&anoA=2001&b=Homem%20de%20ferro&anoB=2009"
          >
            <span className="confronto-icones">
              <span className="icone icone-a">BT</span>
              <span className="vs-mini">VS</span>
              <span className="icone icone-b">HF</span>
            </span>

            <span className="confronto-info">
              <span className="confronto-titulo">Batman VS Homem de Ferro</span>
              <span className="confronto-votos">230 votos nas últimas 5h 🔥</span>
            </span>

            <span className="seta" aria-hidden="true">›</span>
          </a>
        </section>

        <section className="painel">
          <h2>Vamos batalhar!</h2>

          <form className="duelo" id="form-duelo" onSubmit={criarBatalha}>
            <input type="text" name="a" placeholder="Digite aqui" aria-label="Primeiro concorrente" required />
            <span className="vs-grande">VS</span>
            <input type="text" name="b" placeholder="Digite aqui" aria-label="Segundo concorrente" required />
            <button type="submit" className="botao-duelo">Criar batalha</button>
          </form>
        </section>

        <section className="painel">
          <h2><span className="estrela">★</span> Spotlight melhor teoria</h2>

          <div className="teoria">
            <span className="confronto-icones">
              <span className="icone icone-a">BT</span>
              <span className="vs-mini">VS</span>
              <span className="icone icone-b">HF</span>
            </span>
            <span className="teoria-autor" aria-hidden="true">👤</span>
            <span className="teoria-texto">Tomate é uma fruta</span>
          </div>
        </section>
      </main>

      <footer className="rodape">
        <a className="rodape-cor" href="#sobre">SOBRE NÓS</a>
      </footer>
    </>
  );
}
