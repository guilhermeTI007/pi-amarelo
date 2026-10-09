import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const BUCKET_URL = 'https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/';
const EXT_VIDEO = ['mp4', 'webm', 'mov', 'm4v', 'ogv', 'ogg'];

function ehVideo(path) {
  if (!path) return false;
  if (path.startsWith('data:video')) return true;
  const limpo = path.split('?')[0].split('#')[0];
  const ext = limpo.split('.').pop().toLowerCase();
  return EXT_VIDEO.includes(ext);
}

function VideoMudo({ src, className, style, onError }) {
  return (
    <video
      src={src}
      className={className}
      style={style}
      muted
      loop
      autoPlay
      playsInline
      preload="metadata"
      controls={false}
      disablePictureInPicture
      controlsList="nodownload noplaybackrate noremoteplayback"
      tabIndex={-1}
      onContextMenu={e => e.preventDefault()}
      onError={onError}
    />
  );
}

function getImagemUrl(imagemPath) {
  if (!imagemPath) return null;
  if (imagemPath.startsWith('http') || imagemPath.startsWith('data:')) return imagemPath;
  return BUCKET_URL + imagemPath;
}

// ── Helpers ─────────────────────────────────────────────────────────
const PLANO_INFO = {
  2: { label: 'VIP', cor: '#f8cb47' },
  1: { label: 'Pro', cor: '#818cf8' },
  0: { label: 'Gratuito', cor: '#a0aec0' },
};

function formatarData(str) {
  if (!str) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-');
    return `${d}/${m}/${y}`;
  }
  return new Date(str).toLocaleDateString('pt-BR');
}

function StatCard({ label, value, color }) {
  return (
    <div className="adm-stat-card" style={{ borderColor: color }}>
      <div className="adm-stat-info">
        <span className="adm-stat-value" style={{ color }}>{value}</span>
        <span className="adm-stat-label">{label}</span>
      </div>
    </div>
  );
}

// ── Seção: Usuários ──────────────────────────────────────────────────
function SecaoUsuarios({ dados, onRecarregar, admin }) {
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState(null);
  const [novoPlano, setNovoPlano] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtrados = dados.filter(u =>
    u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    u.email?.toLowerCase().includes(busca.toLowerCase())
  );

  async function salvarPlano(userId) {
    setSalvando(true);
    const { error } = await supabase.rpc('admin_atualizar_plano', {
      p_admin_id: admin.id, p_admin_senha: admin.senha, p_user_id: userId, p_plano: novoPlano,
    });
    if (error) alert('Erro ao salvar plano: ' + error.message);
    setSalvando(false);
    setEditando(null);
    onRecarregar();
  }

  async function deletarUsuario(userId) {
    const { error } = await supabase.rpc('admin_deletar_usuario', {
      p_admin_id: admin.id, p_admin_senha: admin.senha, p_user_id: userId,
    });
    if (error) alert('Erro ao deletar usuário: ' + error.message);
    setConfirmDelete(null);
    onRecarregar();
  }

  return (
    <div className="adm-secao">
      <div className="adm-secao-header">
        <h2 className="adm-secao-titulo">Usuários ({dados.length})</h2>
        <input className="adm-busca" type="text" placeholder="Buscar por nome ou e-mail..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>ID</th><th>Nome</th><th>E-mail</th><th>Nascimento</th><th>Plano</th><th>Membro desde</th><th>Ações</th></tr></thead>
          <tbody>
            {filtrados.map(u => {
              const urlFoto = getImagemUrl(u.foto);
              const isVid = ehVideo(u.foto);
              return (
                <tr key={u.id}>
                  <td className="adm-td-id">#{u.id}</td>
                  <td>
                    <div className="adm-user-cell">
                      <div className="adm-user-avatar-wrap">
                        {urlFoto ? (
                          isVid ? (
                            <VideoMudo src={urlFoto} className="adm-user-avatar" />
                          ) : (
                            <img className="adm-user-avatar" src={urlFoto} alt={u.nome} />
                          )
                        ) : (
                          <div className="adm-avatar-fallback">{(u.nome || 'U').charAt(0).toUpperCase()}</div>
                        )}
                      </div>
                      <span>{u.nome || '—'}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{formatarData(u.data_nascimento)}</td>
                  <td>
                    {editando === u.id ? (
                      <select className="adm-select" value={novoPlano ?? u.plano} onChange={e => setNovoPlano(Number(e.target.value))}>
                        <option value={2}>VIP</option>
                        <option value={1}>Pro</option>
                        <option value={0}>Gratuito</option>
                      </select>
                    ) : (
                      <span className="adm-badge-plano" style={{ color: PLANO_INFO[u.plano ?? 0]?.cor }}>
                        {PLANO_INFO[u.plano ?? 0]?.label}
                      </span>
                    )}
                  </td>
                  <td>{formatarData(u.created_at)}</td>
                  <td>
                    <div className="adm-acoes">
                      {editando === u.id ? (
                        <>
                          <button className="adm-btn adm-btn--save" onClick={() => salvarPlano(u.id)} disabled={salvando}>{salvando ? '...' : 'Salvar'}</button>
                          <button className="adm-btn adm-btn--cancel" onClick={() => setEditando(null)}>Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button className="adm-btn adm-btn--edit" title="Editar plano" onClick={() => { setEditando(u.id); setNovoPlano(u.plano ?? 0); }}>Editar</button>
                          <button className="adm-btn adm-btn--del" title="Deletar" onClick={() => setConfirmDelete(u)}>Deletar</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {confirmDelete && (
        <div className="adm-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3>Confirmar exclusão</h3>
            <p>Deseja deletar o usuário <strong>{confirmDelete.nome}</strong>? Comentários e batalhas dele também serão apagados.</p>
            <div className="adm-modal-actions">
              <button className="adm-btn adm-btn--del-confirm" onClick={() => deletarUsuario(confirmDelete.id)}>Deletar</button>
              <button className="adm-btn adm-btn--cancel" onClick={() => setConfirmDelete(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Seção: Comentários ───────────────────────────────────────────────
function SecaoComentarios({ dados, onRecarregar }) {
  const [busca, setBusca] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtrados = dados.filter(c =>
    c.texto?.toLowerCase().includes(busca.toLowerCase()) ||
    c.usuarios?.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  async function deletarComentario(id) {
    await supabase.from('comentarios').delete().eq('id', id);
    setConfirmDelete(null);
    onRecarregar();
  }

  return (
    <div className="adm-secao">
      <div className="adm-secao-header">
        <h2 className="adm-secao-titulo">Comentários ({dados.length})</h2>
        <input className="adm-busca" type="text" placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>ID</th><th>Autor</th><th>Batalha</th><th>Comentário</th><th>Data</th><th>Ação</th></tr></thead>
          <tbody>
            {filtrados.map(c => (
              <tr key={c.id}>
                <td className="adm-td-id">#{c.id}</td>
                <td><span style={{ color: PLANO_INFO[c.usuarios?.plano ?? 0]?.cor }}>{c.usuarios?.nome || '—'}</span></td>
                <td className="adm-td-small">{c.postagem?.personagem1?.nome || '?'} vs {c.postagem?.personagem2?.nome || '?'}</td>
                <td className="adm-td-texto">{c.texto}</td>
                <td>{formatarData(c.data_comentario)}</td>
                <td><button className="adm-btn adm-btn--del" onClick={() => setConfirmDelete(c)}>Deletar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {confirmDelete && (
        <div className="adm-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3>Deletar comentário?</h3>
            <p>"{confirmDelete.texto}"</p>
            <div className="adm-modal-actions">
              <button className="adm-btn adm-btn--del-confirm" onClick={() => deletarComentario(confirmDelete.id)}>Deletar</button>
              <button className="adm-btn adm-btn--cancel" onClick={() => setConfirmDelete(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Seção: Batalhas ──────────────────────────────────────────────────
function SecaoBatalhas({ dados, onRecarregar }) {
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function deletarBatalha(id) {
    await supabase.from('comentarios').delete().eq('id_postagem', id);
    await supabase.from('postagem').delete().eq('id', id);
    setConfirmDelete(null);
    onRecarregar();
  }

  return (
    <div className="adm-secao">
      <div className="adm-secao-header">
        <h2 className="adm-secao-titulo">Batalhas ({dados.length})</h2>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>ID</th><th>Personagem 1</th><th>Personagem 2</th><th>Criador</th><th>Data</th><th>V. P1</th><th>V. P2</th><th>Total</th><th>Ação</th></tr></thead>
          <tbody>
            {dados.map(b => {
              const total = (b.votos_personagem1 || 0) + (b.votos_personagem2 || 0);
              const p1Url = getImagemUrl(b.personagem1?.imagem);
              const p2Url = getImagemUrl(b.personagem2?.imagem);
              return (
                <tr key={b.id}>
                  <td className="adm-td-id">#{b.id}</td>
                  <td>
                    <div className="adm-char-cell">
                      {p1Url && (ehVideo(b.personagem1?.imagem) ? <VideoMudo src={p1Url} className="adm-mini-thumb" /> : <img src={p1Url} className="adm-mini-thumb" alt="" />)}
                      <span>{b.personagem1?.nome || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="adm-char-cell">
                      {p2Url && (ehVideo(b.personagem2?.imagem) ? <VideoMudo src={p2Url} className="adm-mini-thumb" /> : <img src={p2Url} className="adm-mini-thumb" alt="" />)}
                      <span>{b.personagem2?.nome || '—'}</span>
                    </div>
                  </td>
                  <td>{b.usuario?.nome || '—'}</td>
                  <td>{formatarData(b.data_postagem)}</td>
                  <td className="adm-td-center">{b.votos_personagem1 || 0}</td>
                  <td className="adm-td-center">{b.votos_personagem2 || 0}</td>
                  <td className="adm-td-center adm-td-bold">{total}</td>
                  <td><button className="adm-btn adm-btn--del" onClick={() => setConfirmDelete(b)}>Deletar</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {confirmDelete && (
        <div className="adm-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3>Deletar batalha?</h3>
            <p><strong>{confirmDelete.personagem1?.nome} vs {confirmDelete.personagem2?.nome}</strong></p>
            <div className="adm-modal-actions">
              <button className="adm-btn adm-btn--del-confirm" onClick={() => deletarBatalha(confirmDelete.id)}>Deletar</button>
              <button className="adm-btn adm-btn--cancel" onClick={() => setConfirmDelete(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Seção: Personagens Com Paginação Servidor ─────────────────────────
function SecaoPersonagens({ onRecarregarTotal }) {
  const [personagens, setPersonagens] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(50);
  const [busca, setBusca] = useState('');

  const [editandoId, setEditandoId] = useState(null);
  const [novoNome, setNovoNome] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [mensagemErro, setMensagemErro] = useState('');

  const carregarPagina = useCallback(async (p, termoBusca, porPagina) => {
    setLoading(true);
    setMensagemErro('');
    try {
      const from = (p - 1) * porPagina;
      const to = p * porPagina - 1;

      let query = supabase
        .from('personagens')
        .select('*', { count: 'exact' })
        .order('id', { ascending: true });

      const t = termoBusca.trim();
      if (t) {
        if (/^\d+$/.test(t)) {
          query = query.or(`id.eq.${t},nome.ilike.%${t}%`);
        } else {
          query = query.ilike('nome', `%${t}%`);
        }
      }

      const { data, count, error } = await query.range(from, to);

      if (error) throw error;

      setPersonagens(data || []);
      setTotalCount(count || 0);
      if (onRecarregarTotal) onRecarregarTotal(count || 0);
    } catch (err) {
      setMensagemErro('Erro ao carregar personagens: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [onRecarregarTotal]);

  useEffect(() => {
    carregarPagina(pagina, busca, itensPorPagina);
  }, [pagina, itensPorPagina, carregarPagina]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPagina(1);
      carregarPagina(1, busca, itensPorPagina);
    }, 300);
    return () => clearTimeout(timer);
  }, [busca, itensPorPagina, carregarPagina]);

  async function salvarNome(id) {
    if (!novoNome.trim()) return;
    setSalvando(true);
    setMensagemErro('');
    try {
      const { error } = await supabase
        .from('personagens')
        .update({ nome: novoNome.trim() })
        .eq('id', id);
      if (error) throw error;
      setEditandoId(null);
      carregarPagina(pagina, busca, itensPorPagina);
    } catch (err) {
      setMensagemErro('Erro ao atualizar nome: ' + err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function deletarPersonagem(id) {
    setMensagemErro('');
    try {
      const { error } = await supabase.from('personagens').delete().eq('id', id);
      if (error) {
        if (error.code === '23503') {
          throw new Error('Este personagem está em uso em batalhas ativas e não pode ser deletado.');
        }
        throw error;
      }
      setConfirmDelete(null);
      carregarPagina(pagina, busca, itensPorPagina);
    } catch (err) {
      setMensagemErro(err.message);
      setConfirmDelete(null);
    }
  }

  const totalPaginas = Math.ceil(totalCount / itensPorPagina) || 1;

  return (
    <div className="adm-secao">
      <div className="adm-secao-header">
        <div>
          <h2 className="adm-secao-titulo">Personagens ({totalCount})</h2>
          <small className="adm-secao-sub">Listando do banco de dados (Página {pagina} de {totalPaginas})</small>
        </div>
        <div className="adm-header-controles">
          <input
            className="adm-busca"
            type="text"
            placeholder="Buscar por nome ou ID no banco..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <select
            className="adm-select-pag"
            value={itensPorPagina}
            onChange={e => { setItensPorPagina(Number(e.target.value)); setPagina(1); }}
          >
            <option value={25}>25 por pág</option>
            <option value={50}>50 por pág</option>
            <option value={100}>100 por pág</option>
          </select>
        </div>
      </div>

      {mensagemErro && (
        <div className="adm-alerta-erro">
          <span>Aviso: {mensagemErro}</span>
          <button onClick={() => setMensagemErro('')}>✕</button>
        </div>
      )}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mídia / Foto</th>
              <th>Nome do Personagem</th>
              <th>Data de Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#8e9bb3' }}>
                  Carregando personagens do banco...
                </td>
              </tr>
            ) : personagens.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>
                  Nenhum personagem encontrado.
                </td>
              </tr>
            ) : (
              personagens.map(p => {
                const url = getImagemUrl(p.imagem);
                const isVid = ehVideo(p.imagem);
                const isEditing = editandoId === p.id;

                return (
                  <tr key={p.id}>
                    <td className="adm-td-id">#{p.id}</td>
                    <td>
                      <div className="adm-char-thumb-wrap">
                        {url ? (
                          isVid ? (
                            <VideoMudo src={url} className="adm-char-thumb" />
                          ) : (
                            <img src={url} alt={p.nome} className="adm-char-thumb" />
                          )
                        ) : (
                          <div className="adm-char-thumb-fallback">P</div>
                        )}
                      </div>
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="adm-edit-nome-wrap">
                          <input
                            type="text"
                            className="adm-input-inline"
                            value={novoNome}
                            onChange={e => setNovoNome(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') salvarNome(p.id);
                              if (e.key === 'Escape') setEditandoId(null);
                            }}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span className="adm-char-nome">{p.nome}</span>
                      )}
                    </td>
                    <td>{formatarData(p.created_at)}</td>
                    <td>
                      <div className="adm-acoes">
                        {isEditing ? (
                          <>
                            <button
                              className="adm-btn adm-btn--save"
                              title="Salvar alteração de nome"
                              onClick={() => salvarNome(p.id)}
                              disabled={salvando}
                            >
                              {salvando ? '...' : 'Salvar'}
                            </button>
                            <button
                              className="adm-btn adm-btn--cancel"
                              title="Cancelar"
                              onClick={() => setEditandoId(null)}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="adm-btn adm-btn--edit"
                              title="Editar nome"
                              onClick={() => {
                                setEditandoId(p.id);
                                setNovoNome(p.nome || '');
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="adm-btn adm-btn--del"
                              title="Deletar personagem"
                              onClick={() => setConfirmDelete(p)}
                            >
                              Deletar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {!loading && totalCount > 0 && (
        <div className="adm-pagination">
          <button
            className="adm-btn-pag"
            disabled={pagina <= 1 || loading}
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            type="button"
          >
            Anterior
          </button>

          <div className="adm-pag-botoes">
            {Array.from({ length: Math.min(7, totalPaginas) }, (_, i) => {
              let pageNum;
              if (totalPaginas <= 7) {
                pageNum = i + 1;
              } else if (pagina <= 4) {
                pageNum = i + 1;
              } else if (pagina >= totalPaginas - 3) {
                pageNum = totalPaginas - 6 + i;
              } else {
                pageNum = pagina - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={`adm-btn-pag-num ${pagina === pageNum ? 'adm-btn-pag-num--ativo' : ''}`}
                  onClick={() => setPagina(pageNum)}
                  type="button"
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <span className="adm-pag-info">
            Página <strong>{pagina}</strong> de <strong>{totalPaginas}</strong> (Exibindo {personagens.length} de {totalCount})
          </span>

          <button
            className="adm-btn-pag"
            disabled={pagina >= totalPaginas || loading}
            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
            type="button"
          >
            Próxima
          </button>
        </div>
      )}

      {confirmDelete && (
        <div className="adm-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3>Confirmar exclusão do personagem</h3>
            <p>
              Tem certeza que deseja deletar <strong>{confirmDelete.nome}</strong> (ID #{confirmDelete.id})?
            </p>
            <div className="adm-modal-actions">
              <button
                className="adm-btn adm-btn--del-confirm"
                onClick={() => deletarPersonagem(confirmDelete.id)}
              >
                Deletar
              </button>
              <button
                className="adm-btn adm-btn--cancel"
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Página Principal ─────────────────────────────────────────────────
export default function Admin() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [admin, setAdmin] = useState(null);
  const [aba, setAba] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const [usuarios, setUsuarios] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [batalhas, setBatalhas] = useState([]);
  const [totalPersonagensCount, setTotalPersonagensCount] = useState(0);
  const [personagensRecentes, setPersonagensRecentes] = useState([]);

  useEffect(() => {
    const userStr = localStorage.getItem('usuario_logado');
    if (!userStr) { navigate('/login', { replace: true }); return; }
    try {
      const parsed = JSON.parse(userStr);
      const user = Array.isArray(parsed) ? parsed[0] : parsed;
      if (!user.is_admin) { navigate('/', { replace: true }); return; }
      setAdmin(user);
    } catch { navigate('/login', { replace: true }); }
  }, [navigate]);

  const carregarTodos = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: u, error: uErr }, { data: c }, { data: b }, { count: pCount, data: pRecentes }] = await Promise.all([
        supabase.rpc('admin_listar_usuarios', { p_admin_id: admin.id, p_admin_senha: admin.senha }),
        supabase.from('comentarios')
          .select('id, texto, data_comentario, id_usuarios, id_postagem, usuarios(nome, plano), postagem:id_postagem(id, personagem1:id_personagem1(nome), personagem2:id_personagem2(nome))')
          .order('data_comentario', { ascending: false }),
        supabase.from('postagem')
          .select('id, votos_personagem1, votos_personagem2, data_postagem, id_usuario, personagem1:id_personagem1(id,nome,imagem), personagem2:id_personagem2(id,nome,imagem), usuario:id_usuario(nome)')
          .order('data_postagem', { ascending: false }),
        supabase.from('personagens').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
      ]);
      if (uErr) console.error('Erro ao listar usuários:', uErr);
      setUsuarios(u || []);
      setComentarios(c || []);
      setBatalhas(b || []);
      setTotalPersonagensCount(pCount || 0);
      setPersonagensRecentes(pRecentes || []);
    } finally { setLoading(false); }
  }, [admin]);

  useEffect(() => { if (admin) carregarTodos(); }, [admin, carregarTodos]);

  function handleLogout() { localStorage.removeItem('usuario_logado'); navigate('/'); }

  async function handleTrocarFotoAdmin(e) {
    const file = e.target.files[0];
    if (!file || !admin) return;
    setUploadingFoto(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const nomeArquivoLimpo = (admin.nome || 'admin').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      const caminhoStorage = `outros/${Date.now()}_admin_${nomeArquivoLimpo}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('personagens')
        .upload(caminhoStorage, file, { cacheControl: '3600', upsert: true });

      if (uploadErr) throw new Error('Erro no upload da foto: ' + uploadErr.message);

      const novaFotoUrl = `${BUCKET_URL}${caminhoStorage}`;

      const { error: updateErr } = await supabase
        .from('usuarios')
        .update({ foto: novaFotoUrl })
        .eq('id', admin.id);

      if (updateErr) throw updateErr;

      const novoAdmin = { ...admin, foto: novaFotoUrl };
      setAdmin(novoAdmin);
      localStorage.setItem('usuario_logado', JSON.stringify(novoAdmin));

      setUsuarios(prev => prev.map(u => (u.id === admin.id ? { ...u, foto: novaFotoUrl } : u)));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingFoto(false);
    }
  }

  if (!admin) return null;

  const totalVotos = batalhas.reduce((acc, b) => acc + (b.votos_personagem1 || 0) + (b.votos_personagem2 || 0), 0);

  const abas = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'usuarios', label: `Usuários (${usuarios.length})` },
    { id: 'personagens', label: `Personagens (${totalPersonagensCount})` },
    { id: 'comentarios', label: `Comentários (${comentarios.length})` },
    { id: 'batalhas', label: `Batalhas (${batalhas.length})` },
  ];

  const adminFotoUrl = getImagemUrl(admin.foto);
  const adminFotoIsVid = ehVideo(admin.foto);

  return (
    <div className="adm-page">
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} title="Clique para ir à Tela Inicial">
          <div>
            <span className="adm-brand-text">ARENA</span>
            <small className="adm-brand-sub">Painel Admin</small>
          </div>
        </div>

        <div className="adm-sidebar-profile">
          <div className="adm-profile-avatar-wrap">
            {adminFotoUrl ? (
              adminFotoIsVid ? (
                <VideoMudo src={adminFotoUrl} className="adm-profile-avatar" />
              ) : (
                <img className="adm-profile-avatar" src={adminFotoUrl} alt={admin.nome} />
              )
            ) : (
              <div className="adm-avatar-fallback adm-profile-avatar-fallback">
                {(admin.nome || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <button
              className="adm-profile-avatar-btn"
              title="Trocar foto de perfil do Admin"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFoto}
              type="button"
            >
              {uploadingFoto ? '...' : 'Trocar'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleTrocarFotoAdmin}
            />
          </div>
          <div className="adm-profile-info">
            <span className="adm-profile-nome">{admin.nome}</span>
            <span className="adm-profile-role">Administrador</span>
          </div>
        </div>

        <nav className="adm-nav">
          {abas.map(a => (
            <button key={a.id} className={`adm-nav-item ${aba === a.id ? 'adm-nav-item--ativo' : ''}`} onClick={() => setAba(a.id)} type="button">
              {a.label}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <button className="adm-btn-site" onClick={() => navigate('/')} type="button" title="Voltar para a página principal do site">
            Ir para a Tela Inicial
          </button>
          <button className="adm-btn-reload" onClick={carregarTodos} type="button">Recarregar</button>
          <button className="adm-btn-logout" onClick={handleLogout} type="button">Sair da conta</button>
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-topbar">
          <button className="adm-btn-voltar-topo" onClick={() => navigate('/')} type="button">
            &larr; Voltar para a Tela Inicial
          </button>
          <span className="adm-topbar-user">Conectado como <strong>{admin.nome}</strong></span>
        </div>

        {loading ? (
          <div className="adm-loading"><div className="adm-spinner" /><p>Carregando dados...</p></div>
        ) : (
          <>
            {aba === 'dashboard' && (
              <div className="adm-dashboard">
                <h1 className="adm-page-titulo">Dashboard</h1>
                <p className="adm-page-sub">Visão geral e controle da plataforma Arena</p>
                <div className="adm-stats-grid">
                  <StatCard label="Usuários Cadastrados" value={usuarios.length} color="#f8cb47" />
                  <StatCard label="Personagens Cadastrados" value={totalPersonagensCount} color="#fb923c" />
                  <StatCard label="Batalhas na Arena" value={batalhas.length} color="#818cf8" />
                  <StatCard label="Comentários" value={comentarios.length} color="#38bdf8" />
                  <StatCard label="Votos Registrados" value={totalVotos} color="#4ade80" />
                  <StatCard label="Usuários VIP" value={usuarios.filter(u => u.plano === 2).length} color="#f8cb47" />
                  <StatCard label="Usuários Pro" value={usuarios.filter(u => u.plano === 1).length} color="#818cf8" />
                  <StatCard label="Usuários Gratuitos" value={usuarios.filter(u => (u.plano ?? 0) === 0).length} color="#a0aec0" />
                </div>

                <div className="adm-dashboard-recentes">
                  <div className="adm-recentes-card">
                    <h3>Últimos cadastros de usuários</h3>
                    <div className="adm-recentes-lista">
                      {[...usuarios].reverse().slice(0, 5).map(u => {
                        const foto = getImagemUrl(u.foto);
                        const isVid = ehVideo(u.foto);
                        return (
                          <div key={u.id} className="adm-recente-item">
                            {foto ? (
                              isVid ? (
                                <VideoMudo src={foto} className="adm-recente-avatar" />
                              ) : (
                                <img className="adm-recente-avatar" src={foto} alt={u.nome} />
                              )
                            ) : (
                              <div className="adm-avatar-fallback adm-recente-avatar">{(u.nome || 'U').charAt(0).toUpperCase()}</div>
                            )}
                            <div className="adm-recente-info-col">
                              <span className="adm-recente-nome">{u.nome}</span>
                              <span className="adm-recente-sub">{u.email}</span>
                            </div>
                            <span style={{ color: PLANO_INFO[u.plano ?? 0]?.cor }}>{PLANO_INFO[u.plano ?? 0]?.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="adm-recentes-card">
                    <h3>Personagens Recentes</h3>
                    <div className="adm-recentes-lista">
                      {personagensRecentes.map(p => {
                        const imgUrl = getImagemUrl(p.imagem);
                        const isVid = ehVideo(p.imagem);
                        return (
                          <div key={p.id} className="adm-recente-item">
                            {imgUrl ? (
                              isVid ? (
                                <VideoMudo src={imgUrl} className="adm-recente-avatar" />
                              ) : (
                                <img className="adm-recente-avatar" src={imgUrl} alt={p.nome} />
                              )
                            ) : (
                              <div className="adm-avatar-fallback adm-recente-avatar">P</div>
                            )}
                            <div className="adm-recente-info-col">
                              <span className="adm-recente-nome">{p.nome}</span>
                              <span className="adm-recente-sub">ID #{p.id}</span>
                            </div>
                            <span className="adm-recente-data">{formatarData(p.created_at)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {aba === 'usuarios' && <SecaoUsuarios dados={usuarios} onRecarregar={carregarTodos} admin={admin} />}
            {aba === 'personagens' && <SecaoPersonagens onRecarregarTotal={c => setTotalPersonagensCount(c)} />}
            {aba === 'comentarios' && <SecaoComentarios dados={comentarios} onRecarregar={carregarTodos} />}
            {aba === 'batalhas' && <SecaoBatalhas dados={batalhas} onRecarregar={carregarTodos} />}
          </>
        )}
      </main>
    </div>
  );
}
