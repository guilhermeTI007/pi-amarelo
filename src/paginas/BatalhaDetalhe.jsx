import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useParams, Link } from 'react-router-dom';
import ModalImagem from '../components/ModalImagem';
import './BatalhaDetalhe.css';

const BUCKET_URL = 'https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/';

function getImagemUrl(p) {
  if (!p) return null;
  if (p.startsWith('http') || p.startsWith('data:')) return p;
  return BUCKET_URL + p;
}

function isVideo(path) {
  if (!path) return false;
  return /\.(mp4|webm|ogg|mov)$/i.test(path);
}

function MidiaPersonagem({ src, alt, className, onClick }) {
  if (!src) return null;
  if (isVideo(src)) {
    return (
      <video src={src} autoPlay loop muted playsInline className={className} style={{ pointerEvents: 'none' }} />
    );
  }
  return (
    <img src={src} alt={alt} className={className} onClick={onClick} onError={(e) => { e.target.style.display = 'none'; }} />
  );
}

export default function BatalhaDetalhe() {
  const { id } = useParams();

  const [postagem, setPostagem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [votos1, setVotos1] = useState(0);
  const [votos2, setVotos2] = useState(0);
  const [meuVoto, setMeuVoto] = useState(null);
  const [votando, setVotando] = useState(false);
  const [erroVoto, setErroVoto] = useState('');
  const [comentarios, setComentarios] = useState([]);
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [novoTexto, setNovoTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroComentario, setErroComentario] = useState('');
  const [imagemModal, setImagemModal] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('usuario_logado');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUsuarioLogado(Array.isArray(parsed) ? parsed[0] : parsed);
      } catch { setUsuarioLogado(null); }
    }
    carregarBatalha();
  }, [id]);

  async function carregarBatalha() {
    setLoading(true);
    setErro(null);
    try {
      const { data, error } = await supabase
        .from('postagem')
        .select(`
          id, votos_personagem1, votos_personagem2, data_postagem, id_usuario,
          personagem1:id_personagem1(id, nome, imagem),
          personagem2:id_personagem2(id, nome, imagem),
          usuario:id_usuario(nome, foto)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPostagem(data);
      setVotos1(data.votos_personagem1 || 0);
      setVotos2(data.votos_personagem2 || 0);

      const userStr = localStorage.getItem('usuario_logado');
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          const u = Array.isArray(parsed) ? parsed[0] : parsed;
          const votoSalvo = localStorage.getItem(`voto_post_${data.id}_user_${u.id}`);
          if (votoSalvo) setMeuVoto(votoSalvo);
        } catch {}
      }

      carregarComentarios(data.id);
    } catch (err) {
      setErro('Batalha nao encontrada: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function carregarComentarios(postId) {
    setLoadingComentarios(true);
    try {
      const { data } = await supabase
        .from('comentarios')
        .select('id, texto, data_comentario, id_usuarios, usuarios(nome, foto, plano)')
        .eq('id_postagem', postId)
        .order('data_comentario', { ascending: true });
      const sorted = (data || []).sort((a, b) => (b.usuarios?.plano ?? 0) - (a.usuarios?.plano ?? 0));
      setComentarios(sorted);
    } finally {
      setLoadingComentarios(false);
    }
  }

  async function handleVotar(lado) {
    if (!usuarioLogado) { setErroVoto('Faca login para votar!'); setTimeout(() => setErroVoto(''), 3000); return; }
    if (meuVoto) { setErroVoto('Voce ja votou nesta batalha!'); setTimeout(() => setErroVoto(''), 3000); return; }
    setVotando(true);
    try {
      const novosVotos1 = lado === 'p1' ? votos1 + 1 : votos1;
      const novosVotos2 = lado === 'p2' ? votos2 + 1 : votos2;
      const { error } = await supabase.from('postagem').update({ votos_personagem1: novosVotos1, votos_personagem2: novosVotos2 }).eq('id', postagem.id);
      if (error) throw error;
      if (lado === 'p1') setVotos1(novosVotos1);
      if (lado === 'p2') setVotos2(novosVotos2);
      setMeuVoto(lado);
      localStorage.setItem(`voto_post_${postagem.id}_user_${usuarioLogado.id}`, lado);
    } catch (err) {
      setErroVoto('Erro ao votar: ' + err.message);
      setTimeout(() => setErroVoto(''), 3000);
    } finally {
      setVotando(false);
    }
  }

  async function enviarComentario() {
    if (!usuarioLogado) { setErroComentario('Faca login para comentar.'); return; }
    const texto = novoTexto.trim();
    if (!texto) { setErroComentario('Digite um comentario.'); return; }
    setErroComentario('');
    setEnviando(true);
    try {
      const { data, error } = await supabase
        .from('comentarios')
        .insert([{ texto, id_postagem: postagem.id, id_usuarios: usuarioLogado.id }])
        .select('id, texto, data_comentario, id_usuarios, usuarios(nome, foto, plano)')
        .single();
      if (error) throw error;
      setComentarios(prev => [...prev, data]);
      setNovoTexto('');
    } catch (err) {
      setErroComentario('Erro ao enviar: ' + err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (loading) {
    return (
      <div className="bdet-loading">
        <div className="bdet-spinner" />
        <p>Carregando batalha...</p>
      </div>
    );
  }

  if (erro || !postagem) {
    return (
      <div className="bdet-erro-page">
        <p>{erro || 'Batalha nao encontrada.'}</p>
        <Link to="/batalhas" className="bdet-btn-voltar">larr; Voltar para a Arena</Link>
      </div>
    );
  }

  const p1 = postagem.personagem1;
  const p2 = postagem.personagem2;
  const totalVotos = votos1 + votos2;
  const pct1 = totalVotos ? Math.round((votos1 / totalVotos) * 100) : 50;
  const pct2 = 100 - pct1;
  const vencedor = votos1 > votos2 ? p1?.nome : votos2 > votos1 ? p2?.nome : null;

  const dataFormatada = postagem.data_postagem
    ? new Date(postagem.data_postagem).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="bdet-page">

      <div className="bdet-breadcrumb">
        <Link to="/batalhas" className="bdet-back-link">&#8592; Arena de Batalhas</Link>
        <span className="bdet-breadcrumb-sep">/</span>
        <span className="bdet-breadcrumb-atual">Batalha #{postagem.id}</span>
      </div>

      <div className="bdet-header">
        <span className="bdet-badge-header">&#9876; Batalha #{postagem.id}</span>
        <div className="bdet-meta">
          <span className="bdet-data">{dataFormatada}</span>
          <span className="bdet-total-votos">{totalVotos} voto(s) no total</span>
          {postagem.usuario?.nome && <span className="bdet-criador">Criado por <strong>{postagem.usuario.nome}</strong></span>}
        </div>
      </div>

      <div className="bdet-arena">

        <div className={`bdet-lado ${vencedor === p1?.nome ? 'bdet-lado--lider' : ''} ${meuVoto === 'p1' ? 'bdet-lado--votado' : ''}`}>
          <div className="bdet-avatar-wrap" onClick={() => !isVideo(p1?.imagem) && p1?.imagem && setImagemModal(getImagemUrl(p1.imagem))}>
            {p1?.imagem ? (
              <MidiaPersonagem src={getImagemUrl(p1.imagem)} alt={p1.nome} className="bdet-midia" onClick={() => !isVideo(p1.imagem) && setImagemModal(getImagemUrl(p1.imagem))} />
            ) : (
              <span className="bdet-avatar-icon">&#9876;</span>
            )}
            {vencedor === p1?.nome && <div className="bdet-lider-overlay">Na Lideranca &#128081;</div>}
          </div>
          <h2 className="bdet-nome">{p1?.nome || 'Personagem 1'}</h2>
          <div className="bdet-stat">
            <span className="bdet-pct bdet-pct--p1">{pct1}%</span>
            <span className="bdet-votos-count">{votos1} voto(s)</span>
          </div>
          {meuVoto === 'p1' && <span className="bdet-badge-meu-voto">&#10003; Seu Voto</span>}
          <button
            type="button"
            className={`bdet-btn-votar bdet-btn-votar--p1 ${meuVoto === 'p1' ? 'bdet-btn-votar--ativo' : ''}`}
            onClick={() => handleVotar('p1')}
            disabled={votando || meuVoto !== null}
          >
            {meuVoto === 'p1' ? 'Votado &#10003;' : 'Votar'}
          </button>
        </div>

        <div className="bdet-vs-col">
          <span className="bdet-vs">VS</span>
          <div className="bdet-barra-vert">
            <div className="bdet-barra-p1" style={{ height: pct1 + '%' }} />
            <div className="bdet-barra-p2" style={{ height: pct2 + '%' }} />
          </div>
          {vencedor && (
            <div className="bdet-vencedor-label">
              <span>Liderando:</span>
              <strong>{vencedor}</strong>
            </div>
          )}
        </div>

        <div className={`bdet-lado ${vencedor === p2?.nome ? 'bdet-lado--lider' : ''} ${meuVoto === 'p2' ? 'bdet-lado--votado' : ''}`}>
          <div className="bdet-avatar-wrap" onClick={() => !isVideo(p2?.imagem) && p2?.imagem && setImagemModal(getImagemUrl(p2.imagem))}>
            {p2?.imagem ? (
              <MidiaPersonagem src={getImagemUrl(p2.imagem)} alt={p2.nome} className="bdet-midia" onClick={() => !isVideo(p2.imagem) && setImagemModal(getImagemUrl(p2.imagem))} />
            ) : (
              <span className="bdet-avatar-icon">&#9876;</span>
            )}
            {vencedor === p2?.nome && <div className="bdet-lider-overlay">Na Lideranca &#128081;</div>}
          </div>
          <h2 className="bdet-nome">{p2?.nome || 'Personagem 2'}</h2>
          <div className="bdet-stat">
            <span className="bdet-pct bdet-pct--p2">{pct2}%</span>
            <span className="bdet-votos-count">{votos2} voto(s)</span>
          </div>
          {meuVoto === 'p2' && <span className="bdet-badge-meu-voto">&#10003; Seu Voto</span>}
          <button
            type="button"
            className={`bdet-btn-votar bdet-btn-votar--p2 ${meuVoto === 'p2' ? 'bdet-btn-votar--ativo' : ''}`}
            onClick={() => handleVotar('p2')}
            disabled={votando || meuVoto !== null}
          >
            {meuVoto === 'p2' ? 'Votado &#10003;' : 'Votar'}
          </button>
        </div>
      </div>

      <div className="bdet-barra-horiz-wrap">
        <span className="bdet-barra-label">{p1?.nome}</span>
        <div className="bdet-barra-horiz">
          <div className="bdet-barra-horiz-p1" style={{ width: pct1 + '%' }} />
          <div className="bdet-barra-horiz-p2" style={{ width: pct2 + '%' }} />
        </div>
        <span className="bdet-barra-label">{p2?.nome}</span>
      </div>

      {erroVoto && <div className="bdet-erro-voto">{erroVoto}</div>}

      {!usuarioLogado && (
        <div className="bdet-aviso-login">
          <span>&#9888; Faca <Link to="/login" className="bdet-link-login">login</Link> para votar e comentar nessa batalha.</span>
        </div>
      )}

      <div className="bdet-comentarios-section">
        <div className="bdet-comentarios-header">
          <h3 className="bdet-comentarios-titulo">&#128172; Discussao e Comentarios</h3>
          <span className="bdet-comentarios-count">{comentarios.length} comentario(s)</span>
        </div>

        <div className="bdet-form-comentario">
          {usuarioLogado && (
            <div className="bdet-form-avatar">
              {usuarioLogado.foto ? (
                /\.(mp4|webm|ogg|mov)$/i.test(usuarioLogado.foto) ? (
                  <video src={usuarioLogado.foto} autoPlay loop muted playsInline style={{ pointerEvents: 'none', width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={usuarioLogado.foto} alt={usuarioLogado.nome} />
                )
              ) : (
                <span>{usuarioLogado.nome?.charAt(0).toUpperCase()}</span>
              )}
            </div>
          )}
          <div className="bdet-form-input-wrap">
            <textarea
              className="bdet-comentario-input"
              placeholder={usuarioLogado ? 'Escreva seu argumento sobre quem venceria essa batalha...' : 'Faca login para entrar na discussao...'}
              value={novoTexto}
              onChange={e => setNovoTexto(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarComentario(); } }}
              rows={3}
              disabled={!usuarioLogado}
            />
            {erroComentario && <p className="bdet-comentario-erro">{erroComentario}</p>}
            <div className="bdet-form-actions">
              <span className="bdet-char-hint">Enter para enviar</span>
              <button className="bdet-btn-comentar" onClick={enviarComentario} disabled={enviando || !usuarioLogado} type="button">
                {enviando ? 'Enviando...' : 'Comentar'}
              </button>
            </div>
          </div>
        </div>

        <div className="bdet-lista-comentarios">
          {loadingComentarios ? (
            <div className="bdet-comentarios-loading"><div className="bdet-spinner-sm" /> Carregando comentarios...</div>
          ) : comentarios.length === 0 ? (
            <div className="bdet-comentarios-vazio">
              <span>&#127967;</span>
              <p>Nenhum comentario ainda. Seja o primeiro a opinar!</p>
            </div>
          ) : (
            comentarios.map(c => (
              <div key={c.id} className="bdet-comentario-item">
                <div className="bdet-comentario-avatar">
                  {c.usuarios?.foto ? (
                    /\.(mp4|webm|ogg|mov)$/i.test(c.usuarios.foto) ? (
                      <video src={c.usuarios.foto} autoPlay loop muted playsInline style={{ pointerEvents: 'none', width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={c.usuarios.foto} alt={c.usuarios.nome} />
                    )
                  ) : (
                    <span>{c.usuarios?.nome?.charAt(0)?.toUpperCase() || '?'}</span>
                  )}
                </div>
                <div className="bdet-comentario-corpo">
                  <div className="bdet-comentario-meta">
                    <span className="bdet-comentario-autor">{c.usuarios?.nome || 'Guerreiro'}</span>
                    {c.usuarios?.plano === 2 && <span className="bdet-badge-vip">&#128081; VIP</span>}
                    {c.usuarios?.plano === 1 && <span className="bdet-badge-pro">&#11088; Pro</span>}
                    <span className="bdet-comentario-data">{c.data_comentario ? new Date(c.data_comentario).toLocaleDateString('pt-BR') : ''}</span>
                  </div>
                  <p className="bdet-comentario-texto">{c.texto}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {imagemModal && <ModalImagem url={imagemModal} onClose={() => setImagemModal(null)} />}
    </div>
  );
}
