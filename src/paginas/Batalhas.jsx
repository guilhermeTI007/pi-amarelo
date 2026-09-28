import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import './Batalhas.css';

const BUCKET_URL = 'https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/';

function getImagemUrl(imagemPath) {
  if (!imagemPath) return null;
  if (imagemPath.startsWith('http')) return imagemPath;
  return BUCKET_URL + imagemPath;
}

// ── Cartão de Batalha ─────────────────────────────────────────────
function CartaoBatalha({ postagem }) {
  const p1 = postagem.personagem1;
  const p2 = postagem.personagem2;
  const totalVotos = (postagem.votos_personagem1 || 0) + (postagem.votos_personagem2 || 0);
  const pct1 = totalVotos ? Math.round((postagem.votos_personagem1 / totalVotos) * 100) : 50;
  const pct2 = 100 - pct1;
  const vencedor = postagem.votos_personagem1 >= postagem.votos_personagem2 ? p1?.nome : p2?.nome;

  const [comentarios, setComentarios] = useState([]);
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [novoTexto, setNovoTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroComentario, setErroComentario] = useState('');
  const [comentariosAbertos, setComentariosAbertos] = useState(false);
  const [totalComentarios, setTotalComentarios] = useState(0);

  // Conta comentários sem carregar tudo
  useEffect(() => {
    supabase
      .from('comentarios')
      .select('*', { count: 'exact', head: true })
      .eq('id_postagem', postagem.id)
      .then(({ count }) => setTotalComentarios(count || 0));
  }, [postagem.id]);

  async function carregarComentarios() {
    setLoadingComentarios(true);
    try {
      const { data } = await supabase
        .from('comentarios')
        .select('id, texto, data_comentario, id_usuarios, usuarios(nome, foto)')
        .eq('id_postagem', postagem.id)
        .order('data_comentario', { ascending: true });
      setComentarios(data || []);
    } finally {
      setLoadingComentarios(false);
    }
  }

  function toggleComentarios() {
    const novoEstado = !comentariosAbertos;
    setComentariosAbertos(novoEstado);
    if (novoEstado && comentarios.length === 0) carregarComentarios();
  }

  async function enviarComentario() {
    const userStr = localStorage.getItem('usuario_logado');
    if (!userStr) {
      setErroComentario("Você precisa estar logado para comentar.");
      return;
    }
    const usuarioLogado = JSON.parse(userStr);

    const texto = novoTexto.trim();
    if (!texto) { setErroComentario('Digite um comentário.'); return; }
    setErroComentario('');
    setEnviando(true);
    try {
      const { data, error } = await supabase
        .from('comentarios')
        .insert([{ texto, id_postagem: postagem.id, id_usuarios: usuarioLogado.id }])
        .select('id, texto, data_comentario, id_usuarios, usuarios(nome, foto)')
        .single();

      if (error) throw error;
      setComentarios((prev) => [...prev, data]);
      setTotalComentarios((n) => n + 1);
      setNovoTexto('');
    } catch (err) {
      setErroComentario('Erro ao enviar: ' + err.message);
    } finally {
      setEnviando(false);
    }
  }

  const dataFormatada = postagem.data_postagem
    ? new Date(postagem.data_postagem).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '';

  return (
    <article className="batalha-card">
      {/* Topo */}
      <div className="batalha-card-topo">
        <span className="batalha-badge">⚔ Batalha</span>
        <span className="batalha-data">{dataFormatada}</span>
        <span className="batalha-votos">{totalVotos} votos</span>
      </div>

      {/* Confronto */}
      <div className="batalha-confronto">
        <div className={`batalha-lado ${vencedor === p1?.nome ? 'lado-vencedor' : ''}`}>
          <div className="batalha-avatar">
            {p1?.imagem ? (
              <img src={getImagemUrl(p1.imagem)} alt={p1.nome} className="batalha-img"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            ) : null}
            <span className="batalha-avatar-icon" style={{ display: p1?.imagem ? 'none' : 'flex' }}>⚔</span>
          </div>
          <p className="batalha-nome">{p1?.nome || 'Personagem 1'}</p>
          <p className="batalha-pct">{pct1}%</p>
          {vencedor === p1?.nome && <span className="badge-vencedor">🏆 Líder</span>}
        </div>

        <div className="batalha-vs-col">
          <span className="batalha-vs">VS</span>
          <div className="barra-progresso-batalha">
            <div className="barra-p1" style={{ width: pct1 + '%' }} />
            <div className="barra-p2" style={{ width: pct2 + '%' }} />
          </div>
        </div>

        <div className={`batalha-lado ${vencedor === p2?.nome ? 'lado-vencedor' : ''}`}>
          <div className="batalha-avatar">
            {p2?.imagem ? (
              <img src={getImagemUrl(p2.imagem)} alt={p2.nome} className="batalha-img"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            ) : null}
            <span className="batalha-avatar-icon" style={{ display: p2?.imagem ? 'none' : 'flex' }}>⚔</span>
          </div>
          <p className="batalha-nome">{p2?.nome || 'Personagem 2'}</p>
          <p className="batalha-pct">{pct2}%</p>
          {vencedor === p2?.nome && <span className="badge-vencedor">🏆 Líder</span>}
        </div>
      </div>

      {/* Toggle Comentários */}
      <button className="btn-toggle-comentarios" onClick={toggleComentarios} type="button">
        <span className="chevron-icon">{comentariosAbertos ? '▾' : '▸'}</span>
        💬 Comentários ({totalComentarios})
      </button>

      {comentariosAbertos && (
        <div className="batalha-comentarios">
          {loadingComentarios ? (
            <div className="comentarios-loading"><div className="spinner-sm" /> Carregando...</div>
          ) : (
            <>
              {comentarios.length === 0 && (
                <p className="comentarios-vazio">Seja o primeiro a comentar! 👇</p>
              )}
              <div className="lista-comentarios">
                {comentarios.map((c) => (
                  <div className="comentario-item" key={c.id}>
                    <div className="comentario-avatar">
                      {c.usuarios?.foto
                        ? <img src={c.usuarios.foto} alt={c.usuarios.nome} />
                        : <span>👤</span>}
                    </div>
                    <div className="comentario-corpo">
                      <div className="comentario-meta">
                        <span className="comentario-autor">{c.usuarios?.nome || 'Anônimo'}</span>
                        <span className="comentario-data">
                          {new Date(c.data_comentario).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="comentario-texto">{c.texto}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="novo-comentario-form">
                <textarea
                  className="comentario-input"
                  placeholder="Escreva seu comentário sobre essa batalha..."
                  value={novoTexto}
                  onChange={(e) => setNovoTexto(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarComentario(); } }}
                  rows={3}
                />
                {erroComentario && <p className="comentario-erro">{erroComentario}</p>}
                <button className="btn-comentar" onClick={enviarComentario} disabled={enviando} type="button">
                  {enviando ? '⏳ Enviando...' : '💬 Comentar'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}

// ── Página principal ───────────────────────────────────────────────
export default function Batalhas() {
  const [postagens, setPostagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => { carregarPostagens(); }, []);

  async function carregarPostagens() {
    setLoading(true);
    setErro(null);
    try {
      // Usa os nomes das colunas de FK diretamente (sem alias de constraint)
      const { data, error } = await supabase
        .from('postagem')
        .select(`
          id,
          votos_personagem1,
          votos_personagem2,
          data_postagem,
          id_usuario,
          personagem1:id_personagem1(id, nome, imagem),
          personagem2:id_personagem2(id, nome, imagem),
          usuario:id_usuario(nome)
        `)
        .order('data_postagem', { ascending: false });

      if (error) throw error;
      setPostagens(data || []);
    } catch (err) {
      setErro('Erro ao carregar batalhas: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="batalhas-page">
      <div className="batalhas-header">
        <h1 className="batalhas-titulo"><span className="estrela-batalha">⚔</span> Batalhas</h1>
        <p className="batalhas-sub">Confira todas as batalhas e deixe seu comentário!</p>
      </div>

      {loading && (
        <div className="batalhas-loading">
          <div className="spinner" />
          <p>Carregando batalhas...</p>
        </div>
      )}

      {erro && (
        <div className="batalhas-erro">
          <p>{erro}</p>
          <button onClick={carregarPostagens} className="btn-retry">Tentar novamente</button>
        </div>
      )}

      {!loading && !erro && (
        <>
          <p className="batalhas-count">{postagens.length} batalha(s) encontrada(s)</p>
          {postagens.length === 0 ? (
            <div className="batalhas-vazio"><p>Nenhuma batalha cadastrada ainda.</p></div>
          ) : (
            <div className="batalhas-lista">
              {postagens.map((p) => <CartaoBatalha key={p.id} postagem={p} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
