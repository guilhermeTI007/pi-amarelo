import React, { useState } from "react";
import "./DadosPostagem.css";

const batalhasIniciais = [
  {
    id: 1,
    personagemA: { nome: "Batman", votos: 62 },
    personagemB: { nome: "Homem de Ferro", votos: 38 },
    totalVotos: 230,
    encerrada: true,
    teoria: "Tomate e uma fruta",
    autorTeoria: "Membro da comunidade",
  },
  {
    id: 2,
    personagemA: { nome: "Darth Vader", votos: 71 },
    personagemB: { nome: "Obi-Wan Kenobi", votos: 29 },
    totalVotos: 675,
    encerrada: true,
    teoria: "A Forca sempre equilibra o confronto no final",
    autorTeoria: "Fa de Star Wars",
  },
  {
    id: 3,
    personagemA: { nome: "Leia Organa", votos: 45 },
    personagemB: { nome: "Yoda", votos: 55 },
    totalVotos: 412,
    encerrada: true,
    teoria: "Experiencia de guerra conta mais que tamanho",
    autorTeoria: "Analista de batalhas",
  },
];

const comentariosIniciais = [
  {
    id: 1,
    autor: "Ricardo M.",
    texto: "Essa votacao foi mais equilibrada do que eu esperava.",
  },
  {
    id: 2,
    autor: "Fernanda L.",
    texto: "O resultado ficou justo, os dois tem argumentos fortes.",
  },
];

function calcularVencedor(batalha) {
  return batalha.personagemA.votos >= batalha.personagemB.votos
    ? batalha.personagemA.nome
    : batalha.personagemB.nome;
}

function CartaoBatalha({ batalha }) {
  const vencedor = calcularVencedor(batalha);

  return (
    <article className="cartao-batalha">
      <div className="cartao-batalha-cabecalho">
        <span className="etiqueta-status">Batalha encerrada</span>
        <span className="etiqueta-votos">{batalha.totalVotos} votos</span>
      </div>

      <div className="confronto">
        <div
          className={
            "lado-confronto" +
            (vencedor === batalha.personagemA.nome ? " lado-vencedor" : "")
          }
        >
          <div className="avatar-personagem" aria-hidden="true" />
          <p className="nome-personagem">{batalha.personagemA.nome}</p>
          <p className="porcentagem">{batalha.personagemA.votos}%</p>
        </div>

        <span className="separador-vs">VS</span>

        <div
          className={
            "lado-confronto" +
            (vencedor === batalha.personagemB.nome ? " lado-vencedor" : "")
          }
        >
          <div className="avatar-personagem" aria-hidden="true" />
          <p className="nome-personagem">{batalha.personagemB.nome}</p>
          <p className="porcentagem">{batalha.personagemB.votos}%</p>
        </div>
      </div>

      <div className="barra-progresso">
        <div
          className="barra-progresso-preenchida"
          style={{ width: batalha.personagemA.votos + "%" }}
        />
      </div>

      <p className="linha-vencedor">
        Vencedor: <strong>{vencedor}</strong>
      </p>

      <div className="teoria-destaque">
        <div className="avatar-usuario" aria-hidden="true" />
        <div>
          <p className="teoria-texto">{batalha.teoria}</p>
          <p className="teoria-autor">{batalha.autorTeoria}</p>
        </div>
      </div>
    </article>
  );
}

export default function DadosPostagem() {
  const [batalhas] = useState(batalhasIniciais);
  const [comentarios, setComentarios] = useState(comentariosIniciais);
  const [novoComentario, setNovoComentario] = useState("");

  function adicionarComentario() {
    const texto = novoComentario.trim();
    if (texto === "") {
      return;
    }

    setComentarios([
      ...comentarios,
      {
        id: Date.now(),
        autor: "Voce",
        texto: texto,
      },
    ]);
    setNovoComentario("");
  }

  function tratarTecla(evento) {
    if (evento.key === "Enter" && !evento.shiftKey) {
      evento.preventDefault();
      adicionarComentario();
    }
  }

  return (
    <div className="dados-postagem">
      <section className="secao-batalhas">
        <div className="secao-cabecalho">
          <span className="marcador-estrela" aria-hidden="true" />
          <h2>Batalhas encerradas</h2>
        </div>

        <div className="lista-batalhas">
          {batalhas.map((batalha) => (
            <CartaoBatalha key={batalha.id} batalha={batalha} />
          ))}
        </div>
      </section>

      <section className="secao-comentarios">
        <div className="secao-cabecalho">
          <h2>Comentarios</h2>
          <span className="contador-comentarios">{comentarios.length}</span>
        </div>

        <div className="lista-comentarios">
          {comentarios.map((comentario) => (
            <div className="item-comentario" key={comentario.id}>
              <div className="avatar-usuario" aria-hidden="true" />
              <div className="conteudo-comentario">
                <p className="autor-comentario">{comentario.autor}</p>
                <p className="texto-comentario">{comentario.texto}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="caixa-novo-comentario">
          <textarea
            className="campo-comentario"
            placeholder="Escreva um comentario"
            value={novoComentario}
            onChange={(evento) => setNovoComentario(evento.target.value)}
            onKeyDown={tratarTecla}
            rows={3}
          />
          <button
            type="button"
            className="botao-comentar"
            onClick={adicionarComentario}
          >
            Adicionar comentario
          </button>
        </div>
      </section>
    </div>
  );
}
