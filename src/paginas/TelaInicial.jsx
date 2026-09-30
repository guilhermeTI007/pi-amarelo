import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import './tela-inicial.css';

const BUCKET_URL = 'https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/';

function getImagemUrl(p) {
  if (!p) return null;
  if (p.startsWith('http') || p.startsWith('data:')) return p;
  return BUCKET_URL + p;
}

export default function TelaInicial() {
  const [stats, setStats] = useState({ personagens: 0, batalhas: 0, usuarios: 0 });
  const [spotlight, setSpotlight] = useState(null);
  const [ultimasBatalhas, setUltimasBatalhas] = useState([]);
  const [comentariosRecentes, setComentariosRecentes] = useState([]);

  useEffect(() => {
    carregarStats();
    carregarSpotlight();
    carregarUltimasBatalhas();
    carregarComentariosRecentes();
  }, []);

  async function carregarStats() {
    const [{ count: cP }, { count: cB }, { count: cU }] = await Promise.all([
      supabase.from('personagens').select('*', { count: 'exact', head: true }),
      supabase.from('postagem').select('*', { count: 'exact', head: true }),
      supabase.from('usuarios').select('*', { count: 'exact', head: true }),
    ]);
    setStats({ personagens: cP || 0, batalhas: cB || 0, usuarios: cU || 0 });
  }

  async function carregarSpotlight() {
    const { data } = await supabase
      .from('postagem')
      .select(`
        id, votos_personagem1, votos_personagem2,
        personagem1:id_personagem1(nome, imagem),
        personagem2:id_personagem2(nome, imagem)
      `)
      .order('data_postagem', { ascending: false })
      .limit(1)
      .maybeSingle();
    setSpotlight(data);
  }

  async function carregarUltimasBatalhas() {
    const { data } = await supabase
      .from('postagem')
      .select(`
        id, votos_personagem1, votos_personagem2,
        personagem1:id_personagem1(nome, imagem),
        personagem2:id_personagem2(nome, imagem)
      `)
      .order('data_postagem', { ascending: false })
      .limit(3);
    setUltimasBatalhas(data || []);
  }

  async function carregarComentariosRecentes() {
    const { data } = await supabase
      .from('comentarios')
      .select(`
        id, texto, data_comentario,
        usuarios(nome),
        postagem:id_postagem(
          id,
          personagem1:id_personagem1(nome),
          personagem2:id_personagem2(nome)
        )
      `)
      .order('data_comentario', { ascending: false })
      .limit(5);
    setComentariosRecentes(data || []);
  }

  return (
    <>
      <main className="conteudo">
        {/* Hero */}
        <section className="hero">
          <div className="hero-texto">
            <h1>
              Tudo que eu pensava era{' '}
              <span className="hero-briga">"BRIGA!"</span>
            </h1>
            <p className="hero-sub">Vote em batalhas épicas e prove quem venceria!</p>
            <div className="stats">
              <div className="stat">
                <span className="stat-valor">{stats.personagens.toLocaleString('pt-BR')}</span>
                <span className="stat-label">Personagens</span>
              </div>
              <div className="stat">
                <span className="stat-valor">{stats.batalhas.toLocaleString('pt-BR')}</span>
                <span className="stat-label">Batalhas</span>
              </div>
            </div>
          </div>
          <div className="hero-cta">
            <p>Vote em confrontos lendários, defenda seu time e mostre para a comunidade quem realmente manda!</p>
            <Link to="/cadastro" className="botao-principal">FAÇA PARTE</Link>
          </div>
        </section>

        {/* Spotlight */}
        <section className="painel">
          <h2><span className="estrela">★</span> Spotlight diário de batalha</h2>
          {spotlight ? (
            <Link className="spotlight-batalha" to="/batalhas">
              <span className="confronto-icones">
                {spotlight.personagem1?.imagem ? (
                  <img src={getImagemUrl(spotlight.personagem1.imagem)} alt={spotlight.personagem1.nome} className="spotlight-img" />
                ) : (
                  <span className="icone icone-a">{spotlight.personagem1?.nome?.slice(0, 2).toUpperCase()}</span>
                )}
                <span className="vs-mini">VS</span>
                {spotlight.personagem2?.imagem ? (
                  <img src={getImagemUrl(spotlight.personagem2.imagem)} alt={spotlight.personagem2.nome} className="spotlight-img" />
                ) : (
                  <span className="icone icone-b">{spotlight.personagem2?.nome?.slice(0, 2).toUpperCase()}</span>
                )}
              </span>
              <span className="confronto-info">
                <span className="confronto-titulo">
                  {spotlight.personagem1?.nome} VS {spotlight.personagem2?.nome}
                </span>
                <span className="confronto-votos">
                  {((spotlight.votos_personagem1 || 0) + (spotlight.votos_personagem2 || 0))} votos totais
                </span>
              </span>
              <span className="seta">›</span>
            </Link>
          ) : (
            <p className="sem-dados">
              Nenhuma batalha ainda.{' '}
              <Link to="/nova-batalha" className="link-destaque">Crie a primeira!</Link>
            </p>
          )}
        </section>

        {/* Criar batalha rápida */}
        <section className="painel">
          <h2>⚔ Vamos batalhar!</h2>
          <div className="duelo-cta">
            <p className="duelo-cta-desc">Cadastre uma nova batalha entre seus personagens favoritos</p>
            <Link to="/nova-batalha" className="botao-duelo">+ Criar Nova Batalha</Link>
          </div>
        </section>

        {/* Últimas Batalhas */}
        {ultimasBatalhas.length > 0 && (
          <section className="painel">
            <h2><span className="estrela">★</span> Batalhas recentes</h2>
            <div className="ultimas-batalhas">
              {ultimasBatalhas.map((b) => (
                <Link key={b.id} to="/batalhas" className="spotlight-batalha">
                  <span className="confronto-icones">
                    <span className="icone icone-a">{b.personagem1?.nome?.slice(0, 2).toUpperCase() || 'P1'}</span>
                    <span className="vs-mini">VS</span>
                    <span className="icone icone-b">{b.personagem2?.nome?.slice(0, 2).toUpperCase() || 'P2'}</span>
                  </span>
                  <span className="confronto-info">
                    <span className="confronto-titulo">{b.personagem1?.nome} vs {b.personagem2?.nome}</span>
                    <span className="confronto-votos">{(b.votos_personagem1 || 0) + (b.votos_personagem2 || 0)} votos</span>
                  </span>
                  <span className="seta">›</span>
                </Link>
              ))}
            </div>
            <Link to="/batalhas" className="link-ver-todas">Ver todas as batalhas →</Link>
          </section>
        )}

        {/* Comentários Recentes */}
        {comentariosRecentes.length > 0 && (
          <section className="painel">
            <h2>Comentários recentes</h2>
            <div className="comentarios-recentes">
              {comentariosRecentes.map((c) => (
                <div key={c.id} className="comentario-recente">
                  <div className="com-rec-avatar">•</div>
                  <div className="com-rec-corpo">
                    <div className="com-rec-meta">
                      <span className="com-rec-autor">{c.usuarios?.nome || 'Anônimo'}</span>
                      <span className="com-rec-batalha">
                        {' '}em{' '}
                        <Link to="/batalhas" className="link-destaque">
                          {c.postagem?.personagem1?.nome} vs {c.postagem?.personagem2?.nome}
                        </Link>
                      </span>
                    </div>
                    <p className="com-rec-texto">{c.texto}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/batalhas" className="link-ver-todas">Ver batalhas e comentar →</Link>
          </section>
        )}

        {/* Links rápidos */}
        <section className="painel painel-links">
          <h2>Explore</h2>
          <div className="links-rapidos">
            <Link to="/personagens" className="link-rapido link-personagens">
              <span className="link-rapido-icon">⚔</span>
              <span className="link-rapido-txt">Personagens</span>
            </Link>
            <Link to="/batalhas" className="link-rapido link-batalhas">
              <span className="link-rapido-icon">⚔</span>
              <span className="link-rapido-txt">Batalhas</span>
            </Link>
            <Link to="/nova-batalha" className="link-rapido link-nova">
              <span className="link-rapido-icon">+</span>
              <span className="link-rapido-txt">Nova Batalha</span>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
