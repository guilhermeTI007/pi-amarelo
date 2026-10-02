import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import ModalImagem from '../components/ModalImagem';
import './Batalhas.css';

const BUCKET_URL = 'https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/';

function getImagemUrl(imagemPath) {
  if (!imagemPath) return null;
  if (imagemPath.startsWith('http') || imagemPath.startsWith('data:')) return imagemPath;
  return BUCKET_URL + imagemPath;
}

// ── Cartão de Batalha ─────────────────────────────────────────────
function CartaoBatalha({ postagem, usuarioLogado, onAlertaLogin }) {
  const p1 = postagem.personagem1;
  const p2 = postagem.personagem2;

  const [votos1, setVotos1] = useState(postagem.votos_personagem1 || 0);
  const [votos2, setVotos2] = useState(postagem.votos_personagem2 || 0);
  const [votando, setVotando] = useState(false);
  const [meuVoto, setMeuVoto] = useState(null); // 'p1' | 'p2' | null
  const [erroVoto, setErroVoto] = useState('');

  const [comentarios, setComentarios] = useState([]);
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [novoTexto, setNovoTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroComentario, setErroComentario] = useState('');
  const [comentariosAbertos, setComentariosAbertos] = useState(false);
  const [totalComentarios, setTotalComentarios] = useState(0);
  const [imagemModal, setImagemModal] = useState(null);

  // Carrega voto salvo localmente para o usuário logado
  useEffect(() => {
    if (usuarioLogado?.id) {
      const votoSalvo = localStorage.getItem(`voto_post_${postagem.id}_user_${usuarioLogado.id}`);
      if (votoSalvo) {
        setMeuVoto(votoSalvo);
      }
    }
  }, [postagem.id, usuarioLogado?.id]);

  // Conta comentários sem carregar tudo
  useEffect(() => {
    supabase
      .from('comentarios')
      .select('*', { count: 'exact', head: true })
      .eq('id_postagem', postagem.id)
      .then(({ count }) => setTotalComentarios(count || 0));
  }, [postagem.id]);

  const totalVotos = votos1 + votos2;
  const pct1 = totalVotos ? Math.round((votos1 / totalVotos) * 100) : 50;
  const pct2 = 100 - pct1;
  const vencedor = votos1 > votos2 ? p1?.nome : votos2 > votos1 ? p2?.nome : null;

  async function handleVotar(lado) {
    if (!usuarioLogado) {
      onAlertaLogin('votar');
      return;
    }

    if (meuVoto) {
      setErroVoto(`Você já votou nesta batalha em ${meuVoto === 'p1' ? p1?.nome : p2?.nome}!`);
      setTimeout(() => setErroVoto(''), 3000);
      return;
    }

    setVotando(true);
    try {
      const novosVotos1 = lado === 'p1' ? votos1 + 1 : votos1;
      const novosVotos2 = lado === 'p2' ? votos2 + 1 : votos2;

      const { error } = await supabase
        .from('postagem')
        .update({
          votos_personagem1: novosVotos1,
          votos_personagem2: novosVotos2,
        })
        .eq('id', postagem.id);

      if (error) throw error;

      if (lado === 'p1') setVotos1(novosVotos1);
      if (lado === 'p2') setVotos2(novosVotos2);

      setMeuVoto(lado);
      localStorage.setItem(`voto_post_${postagem.id}_user_${usuarioLogado.id}`, lado);
    } catch (err) {
      setErroVoto('Erro ao registrar voto: ' + err.message);
      setTimeout(() => setErroVoto(''), 3000);
    } finally {
      setVotando(false);
    }
  }

  async function carregarComentarios() {
    setLoadingComentarios(true);
    try {
      const { data } = await supabase
        .from('comentarios')
        .select('id, texto, data_comentario, id_usuarios, usuarios(nome, foto, plano)')
        .eq('id_postagem', postagem.id)
        .order('data_comentario', { ascending: true });
      // Ordenar por plano do usuário: VIP (2) > Pro (1) > Gratuito (0)
      const sorted = (data || []).sort((a, b) => {
        const pa = a.usuarios?.plano ?? 0;
        const pb = b.usuarios?.plano ?? 0;
        return pb - pa;
      });
      setComentarios(sorted);
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
    if (!usuarioLogado) {
      onAlertaLogin('comentar');
      setErroComentario('Você precisa estar logado para comentar.');
      return;
    }

    const texto = novoTexto.trim();
    if (!texto) {
      setErroComentario('Digite um comentário.');
      return;
    }

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
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <article className="batalha-card">
      {/* Topo */}
      <div className="batalha-card-topo">
        <span className="batalha-badge">⚔ Batalha</span>
        <span className="batalha-data">{dataFormatada}</span>
        <span className="batalha-votos">{totalVotos} voto(s) no total</span>
      </div>

      {/* Confronto */}
      <div className="batalha-confronto">
        {/* Lado Personagem 1 */}
        <div className={`batalha-lado ${vencedor === p1?.nome ? 'lado-vencedor' : ''} ${meuVoto === 'p1' ? 'lado-votado' : ''}`}>
          <div className="batalha-avatar">
            {p1?.imagem ? (
              <img
                src={getImagemUrl(p1.imagem)}
                alt={p1.nome}
                className="batalha-img"
                onClick={() => setImagemModal(getImagemUrl(p1.imagem))}
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <span className="batalha-avatar-icon" style={{ display: p1?.imagem ? 'none' : 'flex' }}>
              ⚔
            </span>
          </div>
          <p className="batalha-nome">{p1?.nome || 'Personagem 1'}</p>
          <p className="batalha-pct">{pct1}%</p>
          <span className="batalha-contagem-votos">{votos1} voto(s)</span>

          {vencedor === p1?.nome && <span className="badge-vencedor">Na Liderança</span>}
          {meuVoto === 'p1' && <span className="badge-meu-voto">Seu Voto</span>}

          <button
            type="button"
            className={`btn-votar-personagem btn-votar-p1 ${meuVoto === 'p1' ? 'btn-votado' : ''}`}
            onClick={() => handleVotar('p1')}
            disabled={votando || meuVoto !== null}
          >
            {meuVoto === 'p1' ? 'Votado' : 'Votar'}
          </button>
        </div>

        {/* Separador Central e Barra */}
        <div className="batalha-vs-col">
          <span className="batalha-vs">VS</span>
          <div className="barra-progresso-batalha">
            <div className="barra-p1" style={{ height: pct1 + '%' }} />
            <div className="barra-p2" style={{ height: pct2 + '%' }} />
          </div>
        </div>

        {/* Lado Personagem 2 */}
        <div className={`batalha-lado ${vencedor === p2?.nome ? 'lado-vencedor' : ''} ${meuVoto === 'p2' ? 'lado-votado' : ''}`}>
          <div className="batalha-avatar">
            {p2?.imagem ? (
              <img
                src={getImagemUrl(p2.imagem)}
                alt={p2.nome}
                className="batalha-img"
                onClick={() => setImagemModal(getImagemUrl(p2.imagem))}
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <span className="batalha-avatar-icon" style={{ display: p2?.imagem ? 'none' : 'flex' }}>
              ⚔
            </span>
          </div>
          <p className="batalha-nome">{p2?.nome || 'Personagem 2'}</p>
          <p className="batalha-pct">{pct2}%</p>
          <span className="batalha-contagem-votos">{votos2} voto(s)</span>

          {vencedor === p2?.nome && <span className="badge-vencedor">Na Liderança</span>}
          {meuVoto === 'p2' && <span className="badge-meu-voto">Seu Voto</span>}

          <button
            type="button"
            className={`btn-votar-personagem btn-votar-p2 ${meuVoto === 'p2' ? 'btn-votado' : ''}`}
            onClick={() => handleVotar('p2')}
            disabled={votando || meuVoto !== null}
          >
            {meuVoto === 'p2' ? 'Votado' : 'Votar'}
          </button>
        </div>
      </div>

      {/* Mensagem de erro de voto inline */}
      {erroVoto && (
        <div className="batalha-erro-voto">{erroVoto}</div>
      )}

      {/* Toggle Comentários */}
      <button className="btn-toggle-comentarios" onClick={toggleComentarios} type="button">
        <span className="chevron-icon">{comentariosAbertos ? '▾' : '▸'}</span>
        Discussão e Comentários ({totalComentarios})
      </button>

      {comentariosAbertos && (
        <div className="batalha-comentarios">
          {loadingComentarios ? (
            <div className="comentarios-loading">
              <div className="spinner-sm" /> Carregando comentários...
            </div>
          ) : (
            <>
              {comentarios.length === 0 && (
                <p className="comentarios-vazio">Nenhum comentário ainda. Deixe sua opinião sobre quem venceria!</p>
              )}
              <div className="lista-comentarios">
                {comentarios.map((c) => (
                  <div className="comentario-item" key={c.id}>
                    <div className="comentario-avatar">
                      {c.usuarios?.foto ? (
                        <img src={c.usuarios.foto} alt={c.usuarios.nome} />
                      ) : (
                        <span>•</span>
                      )}
                    </div>
                    <div className="comentario-corpo">
                      <div className="comentario-meta">
                        <span className="comentario-autor">{c.usuarios?.nome || 'Guerreiro da Arena'}</span>
                        {c.usuarios?.plano === 2 && <span className="comentario-badge-plano comentario-badge-vip">👑 VIP</span>}
                        {c.usuarios?.plano === 1 && <span className="comentario-badge-plano comentario-badge-pro">⭐ Pro</span>}
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
                  placeholder={
                    usuarioLogado
                      ? 'Escreva seu argumento sobre quem venceria essa batalha...'
                      : 'Faça login para entrar na discussão e comentar...'
                  }
                  value={novoTexto}
                  onChange={(e) => setNovoTexto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      enviarComentario();
                    }
                  }}
                  rows={3}
                />
                {erroComentario && <p className="comentario-erro">{erroComentario}</p>}
                <button
                  className="btn-comentar"
                  onClick={enviarComentario}
                  disabled={enviando}
                  type="button"
                >
                  {enviando ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Botão Ver Batalha */}
      <div className="batalha-card-rodape">
        <Link to={`/batalha/${postagem.id}`} className="btn-ver-batalha">
          Ver Batalha Completa →
        </Link>
      </div>

      {imagemModal && <ModalImagem url={imagemModal} onClose={() => setImagemModal(null)} />}
    </article>
  );
}

// ── Página principal ───────────────────────────────────────────────
export default function Batalhas() {
  const [postagens, setPostagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [alertaLoginVisivel, setAlertaLoginVisivel] = useState(false);
  const [acaoBloqueada, setAcaoBloqueada] = useState('votar');

  useEffect(() => {
    function checarLogin() {
      const userStr = localStorage.getItem('usuario_logado');
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          setUsuarioLogado(Array.isArray(parsed) ? parsed[0] : parsed);
        } catch {
          setUsuarioLogado(null);
        }
      } else {
        setUsuarioLogado(null);
      }
    }

    checarLogin();
    carregarPostagens();
  }, []);

  async function carregarPostagens() {
    setLoading(true);
    setErro(null);
    try {
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

  function dispararAlertaLogin(acao) {
    setAcaoBloqueada(acao);
    setAlertaLoginVisivel(true);
  }

  return (
    <div className="batalhas-page">
      <div className="batalhas-header">
        <h1 className="batalhas-titulo"><span className="estrela-batalha">⚔</span> Arena de Batalhas</h1>
        <p className="batalhas-sub">Vote nos confrontos lendários e defenda quem venceria!</p>
      </div>

      {/* Alerta Destacado caso a pessoa esteja deslogada */}
      {!usuarioLogado && (
        <div className="aviso-deslogado-batalhas">
          <div className="aviso-deslogado-info">
            <span className="aviso-icone-pulse">!</span>
            <div>
              <strong>Visitante identificado:</strong>
              <p>Você precisa estar logado para votar nos lutadores e comentar nas batalhas.</p>
            </div>
          </div>
          <div className="aviso-deslogado-botoes">
            <Link to="/login" className="btn-ir-login">Fazer Login</Link>
            <Link to="/cadastro" className="btn-ir-cadastro">Cadastrar-se</Link>
          </div>
        </div>
      )}

      {/* Modal/Toast de Alerta quando tenta votar ou comentar sem estar logado */}
      {alertaLoginVisivel && (
        <div className="modal-login-bloqueio-overlay" onClick={() => setAlertaLoginVisivel(false)}>
          <div className="modal-login-bloqueio-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-login-icone">Acesso Restrito</div>
            <h3>Login Obrigatório</h3>
            <p>
              Você precisa estar conectado à sua conta para <strong>{acaoBloqueada === 'votar' ? 'votar no seu lutador' : 'enviar comentários'}</strong>!
            </p>
            <div className="modal-login-acoes">
              <Link to="/login" className="btn-ir-login">Ir para Login</Link>
              <button
                type="button"
                className="btn-fechar-alerta"
                onClick={() => setAlertaLoginVisivel(false)}
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="batalhas-loading">
          <div className="spinner" />
          <p>Carregando batalhas da arena...</p>
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
          <p className="batalhas-count">{postagens.length} batalha(s) na arena</p>
          {postagens.length === 0 ? (
            <div className="batalhas-vazio">
              <p>Nenhuma batalha cadastrada ainda.</p>
              <Link to="/nova-batalha" className="btn-criar-primeira">
                ⚔ Crie a primeira batalha!
              </Link>
            </div>
          ) : (
            <div className="batalhas-lista">
              {postagens.map((p) => (
                <CartaoBatalha
                  key={p.id}
                  postagem={p}
                  usuarioLogado={usuarioLogado}
                  onAlertaLogin={dispararAlertaLogin}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
