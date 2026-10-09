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
  const [ladoComentario, setLadoComentario] = useState('p1');
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
        } catch { }
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
        .select('*, usuarios(nome, foto, plano)')
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
    if (!usuarioLogado || !usuarioLogado.id) { setErroComentario('Faça login para comentar.'); return; }
    const texto = novoTexto.trim();
    if (!texto) { setErroComentario('Digite um comentário.'); return; }
    setErroComentario('');
    setEnviando(true);
    try {
      const payloadBase = { texto, id_postagem: postagem.id, lado: ladoComentario };
      let payload = { ...payloadBase, id_usuarios: usuarioLogado.id };

      let { data, error } = await supabase
        .from('comentarios')
        .insert([payload])
        .select('*')
        .single();

      if (error && (error.message?.includes('lado') || error.code === 'PGRST204')) {
        // se a coluna lado não existir no DB, tenta enviar com fallback no texto
        const textoComTag = `[${ladoComentario.toUpperCase()}] ${texto}`;
        payload = { texto: textoComTag, id_postagem: postagem.id, id_usuarios: usuarioLogado.id };
        const res2 = await supabase.from('comentarios').insert([payload]).select('*').single();
        data = res2.data;
        error = res2.error;
      }

      if (error && error.message && (error.message.includes('id_usuarios') || error.code === 'PGRST204')) {
        payload = { texto, id_postagem: postagem.id, id_usuario: usuarioLogado.id };
        const res3 = await supabase.from('comentarios').insert([payload]).select('*').single();
        data = res3.data;
        error = res3.error;
      }

      if (error) {
        console.error("Erro detalhado ao inserir comentario em detalhe:", error);
        throw error;
      }

      const comentarioMontado = {
        ...data,
        lado: data?.lado || ladoComentario,
        usuarios: {
          nome: usuarioLogado.nome,
          foto: usuarioLogado.foto,
          plano: usuarioLogado.plano,
        },
      };

      setComentarios(prev => [...prev, comentarioMontado]);
      setNovoTexto('');
    } catch (err) {
      console.error("Erro ao enviar comentario:", err);
      setErroComentario('Erro ao enviar: ' + (err.message || 'Verifique o console.'));
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
        <p>{erro || 'Batalha não encontrada.'}</p>
        <Link to="/batalhas" className="bdet-btn-voltar">&larr; Voltar para a Arena</Link>
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

  const comentariosP1 = comentarios.filter((c, i) => {
    if (c.lado) return c.lado === 'p1';
    if (c.texto && c.texto.startsWith('[P1]')) return true;
    if (c.texto && c.texto.startsWith('[P2]')) return false;
    return i % 2 === 0;
  });

  const comentariosP2 = comentarios.filter((c, i) => {
    if (c.lado) return c.lado === 'p2';
    if (c.texto && c.texto.startsWith('[P2]')) return true;
    if (c.texto && c.texto.startsWith('[P1]')) return false;
    return i % 2 !== 0;
  });

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
          <h3 className="bdet-comentarios-titulo">&#128172; Discussão e Comentários</h3>
          <span className="bdet-comentarios-count">{comentarios.length} comentário(s)</span>
        </div>

        {/* Formulário de comentário */}
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
            <div className="bdet-selecionar-lado">
              <span className="bdet-lado-label">Comentar em apoio a:</span>
              <div className="bdet-lado-botoes">
                <button
                  type="button"
                  className={`bdet-btn-lado bdet-btn-lado--p1 ${ladoComentario === 'p1' ? 'ativo' : ''}`}
                  onClick={() => setLadoComentario('p1')}
                >
                  <span className="bdet-lado-dot p1-dot" />
                  {p1?.nome || 'Personagem 1'}
                </button>
                <button
                  type="button"
                  className={`bdet-btn-lado bdet-btn-lado--p2 ${ladoComentario === 'p2' ? 'ativo' : ''}`}
                  onClick={() => setLadoComentario('p2')}
                >
                  <span className="bdet-lado-dot p2-dot" />
                  {p2?.nome || 'Personagem 2'}
                </button>
              </div>
            </div>

            <textarea
              className="bdet-comentario-input"
              placeholder={usuarioLogado ? `Escreva seu comentário apoiando ${ladoComentario === 'p1' ? (p1?.nome || 'Personagem 1') : (p2?.nome || 'Personagem 2')}...` : 'Faça login para entrar na discussão...'}
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

        {/* Dois lados de comentários: P1 esquerda, P2 direita */}
        {loadingComentarios ? (
          <div className="bdet-comentarios-loading"><div className="bdet-spinner-sm" /> Carregando comentários...</div>
        ) : comentarios.length === 0 ? (
          <div className="bdet-comentarios-vazio">
            <span>&#127967;</span>
            <p>Nenhum comentário ainda. Seja o primeiro a opinar!</p>
          </div>
        ) : (
          <div className="bdet-comentarios-dois-lados">
            {/* Coluna do Personagem 1 */}
            <div className="bdet-comentarios-lado bdet-comentarios-lado--p1">
              <div className="bdet-comentarios-lado-header">
                <span className="bdet-comentarios-lado-nome">{p1?.nome || 'Personagem 1'}</span>
                <span className="bdet-comentarios-lado-badge bdet-comentarios-lado-badge--p1">
                  {comentariosP1.length} comentário(s)
                </span>
              </div>
              <div className="bdet-lista-comentarios">
                {comentariosP1.length === 0 ? (
                  <p className="bdet-lado-vazio">Nenhum comentário para este personagem ainda</p>
                ) : (
                  comentariosP1.map(c => {
                    const textoLimpo = c.texto ? c.texto.replace(/^\[P1\]\s*/i, '').replace(/^\[P2\]\s*/i, '') : '';
                    return (
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
                          <p className="bdet-comentario-texto">{textoLimpo}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Divisor central */}
            <div className="bdet-comentarios-divisor">
              <div className="bdet-comentarios-divisor-linha" />
              <span className="bdet-comentarios-divisor-vs">VS</span>
              <div className="bdet-comentarios-divisor-linha" />
            </div>

            {/* Coluna do Personagem 2 */}
            <div className="bdet-comentarios-lado bdet-comentarios-lado--p2">
              <div className="bdet-comentarios-lado-header">
                <span className="bdet-comentarios-lado-nome">{p2?.nome || 'Personagem 2'}</span>
                <span className="bdet-comentarios-lado-badge bdet-comentarios-lado-badge--p2">
                  {comentariosP2.length} comentário(s)
                </span>
              </div>
              <div className="bdet-lista-comentarios">
                {comentariosP2.length === 0 ? (
                  <p className="bdet-lado-vazio">Nenhum comentário para este personagem ainda</p>
                ) : (
                  comentariosP2.map(c => {
                    const textoLimpo = c.texto ? c.texto.replace(/^\[P1\]\s*/i, '').replace(/^\[P2\]\s*/i, '') : '';
                    return (
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
                          <p className="bdet-comentario-texto">{textoLimpo}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {imagemModal && <ModalImagem url={imagemModal} onClose={() => setImagemModal(null)} />}
    </div>
  );
}
