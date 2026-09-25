import React, { useState, useMemo } from 'react';
import './MenuSuperior_Rodape.css';
import './batalha.css';

export default function Batalha() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const nomeBaseA = params.get('a') || 'Batman';
  const nomeBaseB = params.get('b') || 'Homem de ferro';
  const anoA = params.get('anoA') || '2001';
  const anoB = params.get('anoB') || '2009';
  const nomeA = anoA ? `${nomeBaseA} (${anoA})` : nomeBaseA;
  const nomeB = anoB ? `${nomeBaseB} (${anoB})` : nomeBaseB;

  const [votos, setVotos] = useState({ a: 44, b: 56 });
  const [votoEscolhido, setVotoEscolhido] = useState(null);
  const [discussaoAberta, setDiscussaoAberta] = useState(true);

  const [comentariosA, setComentariosA] = useState([
    { texto: 'BURROS!', curtir: 2, descurtir: 5 },
    { texto: 'Ele tem o batmóvel', curtir: 8, descurtir: 1 },
    { texto: 'Não foi descoberto', curtir: 3, descurtir: 0 },
  ]);
  const [comentariosB, setComentariosB] = useState([
    { texto: 'De acordo com o ep.20 minutos já é possível ver que pipipipopopo', curtir: 6, descurtir: 1 },
    { texto: 'É o Homem de Ferro simplesmente', curtir: 9, descurtir: 0 },
    { texto: 'Se eu estivesse errado votaria no Batman', curtir: 4, descurtir: 2 },
  ]);

  const total = votos.a + votos.b;
  const pctA = total ? Math.round((votos.a / total) * 100) : 0;
  const pctB = 100 - pctA;

  function votar(lado) {
    if (votoEscolhido) return;
    setVotos((v) => ({ ...v, [lado]: v[lado] + 1 }));
    setVotoEscolhido(lado);
  }

  function reagir(lista, setLista, index, campo) {
    setLista(lista.map((c, i) => (i === index ? { ...c, [campo]: c[campo] + 1 } : c)));
  }

  return (
    <main className="conteudo">
      <section className="painel">
        <h1 className="titulo">
          {nomeA} <span className="vs">VS</span> {nomeB}
        </h1>

        <div className="confronto">
          <button className="seta" aria-label="Confronto anterior" type="button">←</button>

          <div className="cartas">
            <button
              type="button"
              className={`carta${votoEscolhido === 'a' ? ' carta--votada' : ''}`}
              onClick={() => votar('a')}
            >
              <h2>{nomeA}</h2>
              <span className="carta-icone">🦇</span>
              <span className="carta-botao">ELE VENCERIA!</span>
            </button>

            <span className="vs-grande">VS</span>

            <button
              type="button"
              className={`carta${votoEscolhido === 'b' ? ' carta--votada' : ''}`}
              onClick={() => votar('b')}
            >
              <h2>{nomeB}</h2>
              <span className="carta-icone">🦾</span>
              <span className="carta-botao">ELE VENCERIA!</span>
            </button>
          </div>

          <button className="seta" aria-label="Próximo confronto" type="button">→</button>
        </div>

        <div className="barra" role="img" aria-label={`${pctA}% a ${pctB}%`}>
          <div className="barra-a" style={{ width: pctA + '%' }} />
          <div className="barra-b" style={{ width: pctB + '%' }} />
        </div>
        <div className="barra-legenda">
          <span>{pctA}%</span>
          <span>{pctB}%</span>
        </div>

        <section className="discussao">
          <button
            type="button"
            className="discussao-topo"
            aria-expanded={discussaoAberta}
            onClick={() => setDiscussaoAberta((v) => !v)}
          >
            <span className="chevron">{discussaoAberta ? '▾' : '▴'}</span>
            Discussão da comunidade
          </button>

          <div className="colunas" style={{ display: discussaoAberta ? 'grid' : 'none' }}>
            <div className="coluna">
              <h3>Team {nomeBaseA}</h3>
              {comentariosA.map((c, i) => (
                <div className="comentario" key={i}>
                  <span className="comentario-icone" aria-hidden="true">👤</span>
                  <p>{c.texto}</p>
                  <div className="reacoes">
                    <button type="button" className="btn-descurtir" aria-label="Descurtir" onClick={() => reagir(comentariosA, setComentariosA, i, 'descurtir')}>
                      👎 <span>{c.descurtir}</span>
                    </button>
                    <button type="button" className="btn-curtir" aria-label="Curtir" onClick={() => reagir(comentariosA, setComentariosA, i, 'curtir')}>
                      👍 <span>{c.curtir}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="coluna">
              <h3>Team {nomeBaseB}</h3>
              {comentariosB.map((c, i) => (
                <div className="comentario" key={i}>
                  <span className="comentario-icone" aria-hidden="true">👤</span>
                  <p>{c.texto}</p>
                  <div className="reacoes">
                    <button type="button" className="btn-descurtir" aria-label="Descurtir" onClick={() => reagir(comentariosB, setComentariosB, i, 'descurtir')}>
                      👎 <span>{c.descurtir}</span>
                    </button>
                    <button type="button" className="btn-curtir" aria-label="Curtir" onClick={() => reagir(comentariosB, setComentariosB, i, 'curtir')}>
                      👍 <span>{c.curtir}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>

      <footer className="rodape">
        <a className="rodape-cor" href="#sobre">SOBRE NÓS</a>
      </footer>
    </main>
  );
}
