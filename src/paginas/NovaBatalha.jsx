import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { useNavigate, Link } from 'react-router-dom';
import ModalImagem from '../components/ModalImagem';
import './NovaBatalha.css';

const BUCKET_URL = 'https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/';
const LIMITE_PERSONAGENS = 5000;
const LIMITE_VIDEO_MB = 50;
const LIMITE_VIDEO_BYTES = LIMITE_VIDEO_MB * 1024 * 1024;
const EXT_VIDEO = ['mp4', 'webm', 'mov', 'm4v', 'ogv', 'ogg'];

function getImagemUrl(p) {
  if (!p) return null;
  if (p.startsWith('http') || p.startsWith('data:')) return p;
  return BUCKET_URL + p;
}

function ehVideo(p) {
  if (!p) return false;
  if (p.startsWith('data:video')) return true;
  const limpo = p.split('?')[0].split('#')[0];
  const ext = limpo.split('.').pop().toLowerCase();
  return EXT_VIDEO.includes(ext);
}

// Vídeo mudo, em loop, sem controles (não dá pra mexer no tempo)
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
      onContextMenu={(e) => e.preventDefault()}
      onError={onError}
    />
  );
}

const estiloAvisoVideo = {
  background: 'rgba(248, 203, 71, 0.12)',
  border: '1px solid rgba(248, 203, 71, 0.5)',
  color: '#f8cb47',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 13,
  margin: '0 0 14px 0',
  textAlign: 'center',
};

// Função utilitária para buscar absolutamente todos os personagens do banco (sem limite padrão de 1000 do Supabase)
async function buscarTodosPersonagensBanco() {
  let todos = [];
  let inicio = 0;
  const TAMANHO_LOTE = 1000;
  let temMais = true;

  while (temMais) {
    const { data, error } = await supabase
      .from('personagens')
      .select('id, nome, imagem')
      .order('nome', { ascending: true })
      .range(inicio, inicio + TAMANHO_LOTE - 1);

    if (error) throw error;
    if (data && data.length > 0) {
      todos = todos.concat(data);
      if (data.length < TAMANHO_LOTE) {
        temMais = false;
      } else {
        inicio += TAMANHO_LOTE;
      }
    } else {
      temMais = false;
    }
  }
  return todos;
}

// ── Modal de Seleção de Personagem com Paginação (50 por página) ──
function ModalEscolherPersonagem({ aberto, onClose, onSelect, ladoNome, listaCompleta = [] }) {
  const [personagens, setPersonagens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const ITENS_POR_PAGINA = 50;

  useEffect(() => {
    if (aberto) {
      if (listaCompleta && listaCompleta.length > 0) {
        setPersonagens(listaCompleta);
      } else {
        carregarPersonagens();
      }
      setPagina(1);
      setBusca('');
    }
  }, [aberto, listaCompleta]);

  async function carregarPersonagens() {
    setLoading(true);
    try {
      const data = await buscarTodosPersonagensBanco();
      setPersonagens(data || []);
    } catch (err) {
      console.error('Erro ao buscar personagens:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!aberto) return null;

  const listaAtual = (listaCompleta && listaCompleta.length > 0) ? listaCompleta : personagens;
  const filtrados = listaAtual.filter((p) =>
    p.nome?.toLowerCase().includes(busca.toLowerCase().trim())
  );

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));
  const inicio = (pagina - 1) * ITENS_POR_PAGINA;
  const personagensPagina = filtrados.slice(inicio, inicio + ITENS_POR_PAGINA);

  return (
    <div className="modal-personagens-overlay" onClick={onClose}>
      <div className="modal-personagens-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-personagens-header">
          <h3>Escolher {ladoNome} do Banco</h3>
          <button className="modal-btn-fechar" onClick={onClose} type="button">✕</button>
        </div>

        <div className="modal-personagens-busca">
          <input
            type="text"
            placeholder="Pesquisar personagem por nome..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
            autoFocus
          />
        </div>

        <div className="modal-personagens-lista">
          {loading ? (
            <div className="modal-loading">
              <div className="spinner-sm" />
              <p>Carregando personagens...</p>
            </div>
          ) : personagensPagina.length === 0 ? (
            <div className="modal-vazio">
              <p>Nenhum personagem encontrado no banco.</p>
              <small>Você pode fechar e cadastrar um novo lutador.</small>
            </div>
          ) : (
            personagensPagina.map((p) => {
              const onErroMidia = (e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              };
              return (
                <div
                  key={p.id}
                  className="modal-personagem-item"
                  onClick={() => {
                    onSelect(p);
                    onClose();
                  }}
                >
                  <div className="modal-personagem-avatar">
                    {p.imagem ? (
                      ehVideo(p.imagem) ? (
                        <VideoMudo src={getImagemUrl(p.imagem)} onError={onErroMidia} />
                      ) : (
                        <img src={getImagemUrl(p.imagem)} alt={p.nome} onError={onErroMidia} />
                      )
                    ) : null}
                    <span className="modal-avatar-fallback" style={{ display: p.imagem ? 'none' : 'flex' }}>
                      VS
                    </span>
                  </div>
                  <div className="modal-personagem-info">
                    <strong className="modal-personagem-nome">{p.nome}</strong>
                    <span className="modal-personagem-id">ID: #{p.id}</span>
                  </div>
                  <button type="button" className="btn-modal-escolher">
                    Selecionar
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Paginação */}
        <div className="modal-personagens-paginacao">
          <button
            type="button"
            className="btn-pag"
            disabled={pagina <= 1}
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span className="info-pag">
            Página <strong>{pagina}</strong> de <strong>{totalPaginas}</strong> ({filtrados.length} encontrados)
          </span>
          <button
            type="button"
            className="btn-pag"
            disabled={pagina >= totalPaginas}
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Bloco de seleção de personagem ────────────────────────────────
function BlocoPersonagem({
  label,
  cor,
  onPersonagemConfirmado,
  personagemSelecionado,
  abrirModal,
  usuarioLogado,
  onPersonagemCriado,
  todosPersonagens,
  carregandoPersonagens,
}) {
  const [nome, setNome] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(false);

  // Estados: null=aguardando | 'verificando' | 'encontrado' | 'novo' | 'salvo'
  const [estado, setEstado] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [imagemModal, setImagemModal] = useState(null);

  // Aba ativa: 'lista' ou 'novo'
  const [abaAtiva, setAbaAtiva] = useState('lista');

  // Busca na lista inline
  const [buscaLista, setBuscaLista] = useState('');

  const inputArquivoRef = useRef();
  const debounceRef = useRef();
  // Ref para saber se a seleção veio do modal/lista (impede debounce de sobrescrever)
  const selecionadoPorModalRef = useRef(false);

  const limiteAtingido = (todosPersonagens?.length || 0) >= LIMITE_PERSONAGENS;

  // Se veio selecionado do modal exterior
  useEffect(() => {
    if (personagemSelecionado) {
      selecionadoPorModalRef.current = true;
      setNome(personagemSelecionado.nome);
      setPreview(getImagemUrl(personagemSelecionado.imagem));
      setPreviewVideo(ehVideo(personagemSelecionado.imagem));
      setEstado('encontrado');
      setErro('');
    }
  }, [personagemSelecionado]);

  // Debounce de verificação ao digitar nome — só ativa quando NÃO veio do modal
  useEffect(() => {
    if (selecionadoPorModalRef.current) {
      selecionadoPorModalRef.current = false;
      return;
    }

    if (!nome.trim()) {
      setEstado(null);
      setArquivo(null);
      setPreview(null);
      setPreviewVideo(false);
      setErro('');
      onPersonagemConfirmado(null);
      return;
    }

    setEstado('verificando');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => verificar(nome.trim()), 600);
    return () => clearTimeout(debounceRef.current);
  }, [nome]);

  async function verificar(n) {
    const { data } = await supabase
      .from('personagens')
      .select('*')
      .ilike('nome', n)
      .limit(1);

    if (data && data.length > 0) {
      setEstado('encontrado');
      setPreview(getImagemUrl(data[0].imagem));
      setPreviewVideo(ehVideo(data[0].imagem));
      onPersonagemConfirmado(data[0]);
    } else {
      setEstado('novo');
      setPreview(null);
      setPreviewVideo(false);
      onPersonagemConfirmado(null);
    }
  }

  function handleArquivo(e) {
    const f = e.target.files[0];
    if (!f) return;

    const ehArquivoVideo = f.type.startsWith('video/');

    if (ehArquivoVideo && f.size > LIMITE_VIDEO_BYTES) {
      setErro(
        `Vídeo muito grande (${(f.size / 1024 / 1024).toFixed(1)}MB). O máximo permitido é ${LIMITE_VIDEO_MB}MB.`
      );
      e.target.value = '';
      return;
    }

    setArquivo(f);
    setPreview(URL.createObjectURL(f));
    setPreviewVideo(ehArquivoVideo);
    setErro('');
  }

  async function handleSalvarNovo() {
    if (!usuarioLogado) {
      setErro('Você precisa estar logado para cadastrar personagens.');
      return;
    }

    if (!nome.trim()) {
      setErro('Informe o nome do personagem.');
      return;
    }

    if (!arquivo) {
      setErro('Por favor, selecione uma foto ou vídeo para o personagem.');
      return;
    }

    if (arquivo.type.startsWith('video/') && arquivo.size > LIMITE_VIDEO_BYTES) {
      setErro(`O vídeo deve ter no máximo ${LIMITE_VIDEO_MB}MB.`);
      return;
    }

    setSalvando(true);
    setErro('');

    try {
      let caminhoFinal = '';

      // Envia a mídia para o Supabase Storage no bucket 'personagens' dentro da pasta 'outros/'
      const ext = arquivo.name.split('.').pop() || 'png';
      const nomeArquivoLimpo = nome.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      const caminhoStorage = `outros/${Date.now()}_${nomeArquivoLimpo}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('personagens')
        .upload(caminhoStorage, arquivo, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadErr) {
        throw new Error('Falha no upload para o storage: ' + uploadErr.message);
      }

      // Salva o caminho relativo "outros/..." na coluna imagem
      caminhoFinal = caminhoStorage;

      const imagem = caminhoFinal;
      const id_usuarios = usuarioLogado?.id;

      const payloadBase = { nome: nome.trim(), imagem: caminhoFinal };
      let payload = { ...payloadBase };
      if (id_usuarios) {
        payload.id_usuarios = id_usuarios;
      }

      console.log("vai inserir:", payload);

      // Usando estritamente .insert() para não exigir policy de UPDATE (upsert)
      let { data, error: insertErr } = await supabase
        .from('personagens')
        .insert([payload])
        .select()
        .single();

      // Caso a coluna no banco tenha outro nome (ex: id_usuario), tenta alternativas
      if (insertErr && insertErr.message && (insertErr.message.includes('id_usuarios') || insertErr.code === 'PGRST204')) {
        console.warn("Tentando com coluna alternativa 'id_usuario'...");
        payload = { ...payloadBase, id_usuario: id_usuarios };
        console.log("vai inserir (tentativa 2):", payload);
        const res2 = await supabase
          .from('personagens')
          .insert([payload])
          .select()
          .single();
        data = res2.data;
        insertErr = res2.error;

        if (insertErr && insertErr.message && insertErr.message.includes('id_usuario')) {
          console.warn("Tentando sem id de usuário...");
          payload = payloadBase;
          console.log("vai inserir (tentativa 3):", payload);
          const res3 = await supabase
            .from('personagens')
            .insert([payload])
            .select()
            .single();
          data = res3.data;
          insertErr = res3.error;
        }
      }

      if (insertErr) {
        console.error("Erro detalhado do Supabase ao salvar personagem:", insertErr);
        throw insertErr;
      }

      selecionadoPorModalRef.current = true;
      setEstado('salvo');
      setPreview(getImagemUrl(data.imagem));
      setPreviewVideo(ehVideo(data.imagem));
      onPersonagemConfirmado(data);
      onPersonagemCriado?.(data);
    } catch (err) {
      console.error("Erro ao salvar personagem:", err);
      setErro('Erro ao salvar personagem: ' + (err.message || 'Erro desconhecido. Verifique o console.'));
    } finally {
      setSalvando(false);
    }
  }

  function handleLimpar() {
    selecionadoPorModalRef.current = false;
    setNome('');
    setArquivo(null);
    setPreview(null);
    setPreviewVideo(false);
    setEstado(null);
    setErro('');
    setBuscaLista('');
    onPersonagemConfirmado(null);
  }

  function selecionarDaLista(p) {
    selecionadoPorModalRef.current = true;
    setNome(p.nome);
    setPreview(getImagemUrl(p.imagem));
    setPreviewVideo(ehVideo(p.imagem));
    setEstado('encontrado');
    setErro('');
    onPersonagemConfirmado(p);
  }

  const corBorda =
    estado === 'encontrado' || estado === 'salvo'
      ? 'var(--accent-green, #2ecc71)'
      : estado === 'novo'
        ? 'var(--accent-red, #e74c3c)'
        : 'transparent';

  const personagensFiltrados = todosPersonagens.filter((p) =>
    p.nome?.toLowerCase().includes(buscaLista.toLowerCase().trim())
  );

  // Se já tiver personagem confirmado, mostrar cartão de confirmação
  if (personagemSelecionado && (estado === 'encontrado' || estado === 'salvo')) {
    return (
      <div className="bloco-personagem bloco-personagem--confirmado" style={{ borderColor: corBorda }}>
        <div className="bloco-header" style={{ background: cor }}>
          <span className="bloco-label">{label}</span>
          <button type="button" className="btn-trocar-personagem" onClick={handleLimpar} title="Trocar personagem">
            Trocar ✕
          </button>
        </div>

        <div className="bloco-preview">
          {preview ? (
            previewVideo ? (
              <VideoMudo src={preview} className="bloco-img" />
            ) : (
              <img src={preview} alt="preview" className="bloco-img" onClick={() => setImagemModal(preview)} />
            )
          ) : (
            <div className="bloco-placeholder">VS</div>
          )}
        </div>

        <div className="bloco-confirmacao">
          <p className="confirmacao-nome"><strong>{nome}</strong></p>
          {estado === 'salvo' && (
            <span className="confirmacao-badge">Cadastrado</span>
          )}
          {estado === 'encontrado' && (
            <span className="confirmacao-badge confirmacao-badge--existente">Pronto para lutar</span>
          )}
        </div>

        {imagemModal && <ModalImagem url={imagemModal} onClose={() => setImagemModal(null)} />}
      </div>
    );
  }

  return (
    <div className="bloco-personagem" style={{ borderColor: corBorda }}>
      {/* Label e destaque de cor */}
      <div className="bloco-header" style={{ background: cor }}>
        <span className="bloco-label">{label}</span>
      </div>

      {/* Abas: Da Lista | Novo Personagem */}
      <div className="bloco-abas">
        <button
          type="button"
          className={`bloco-aba-btn ${abaAtiva === 'lista' ? 'bloco-aba-btn--ativo' : ''}`}
          onClick={() => setAbaAtiva('lista')}
        >
          📋 Da Lista
        </button>
        <button
          type="button"
          className={`bloco-aba-btn ${abaAtiva === 'novo' ? 'bloco-aba-btn--ativo' : ''}`}
          onClick={() => setAbaAtiva('novo')}
        >
          ➕ Novo Personagem
        </button>
      </div>

      {/* ─── ABA: DA LISTA ─── */}
      {abaAtiva === 'lista' && (
        <div className="bloco-aba-conteudo">
          <p className="bloco-aba-descricao">
            Escolha um personagem já cadastrado no banco de dados.
          </p>
          <div className="bloco-lista-busca-wrap">
            <input
              type="text"
              className="bloco-lista-busca"
              placeholder="Buscar na lista..."
              value={buscaLista}
              onChange={(e) => setBuscaLista(e.target.value)}
            />
            <button
              type="button"
              className="btn-abrir-modal-lista"
              onClick={abrirModal}
              style={{ marginTop: 8 }}
            >
              🔍 Busca Avançada / Modal
            </button>
          </div>

          <div className="bloco-lista-personagens">
            {carregandoPersonagens ? (
              <div className="bloco-lista-loading">
                <div className="spinner-sm" /> Carregando personagens...
              </div>
            ) : personagensFiltrados.length === 0 ? (
              <div className="bloco-lista-vazio">
                {buscaLista ? `Nenhum personagem encontrado para "${buscaLista}"` : 'Nenhum personagem cadastrado.'}
              </div>
            ) : (
              personagensFiltrados.map((p) => (
                <div
                  key={p.id}
                  className="bloco-lista-item"
                  onClick={() => selecionarDaLista(p)}
                >
                  <div className="bloco-lista-avatar">
                    {p.imagem ? (
                      ehVideo(p.imagem) ? (
                        <VideoMudo src={getImagemUrl(p.imagem)} />
                      ) : (
                        <img src={getImagemUrl(p.imagem)} alt={p.nome} />
                      )
                    ) : (
                      <span>P</span>
                    )}
                  </div>
                  <div className="bloco-lista-info">
                    <strong>{p.nome}</strong>
                    <span>ID #{p.id}</span>
                  </div>
                  <button type="button" className="btn-modal-escolher">Selecionar</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── ABA: NOVO PERSONAGEM ─── */}
      {abaAtiva === 'novo' && (
        <div className="bloco-aba-conteudo">
          <p className="bloco-aba-descricao">
            Cadastre um personagem novo digitando o nome e enviando uma foto ou vídeo.
          </p>

          {/* Preview da mídia */}
          <div className="bloco-preview bloco-preview--sm">
            {preview ? (
              previewVideo ? (
                <VideoMudo src={preview} className="bloco-img" />
              ) : (
                <img src={preview} alt="preview" className="bloco-img" onClick={() => setImagemModal(preview)} />
              )
            ) : (
              <div className="bloco-placeholder">VS</div>
            )}
          </div>

          {/* Campo de nome */}
          <div className="bloco-campo">
            <input
              type="text"
              className="campo-input"
              placeholder="Nome do personagem..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={estado === 'salvo'}
            />
            <div className="bloco-status">
              {estado === 'verificando' && <span className="status-verificando">Verificando no banco...</span>}
              {estado === 'encontrado' && (
                <span className="status-ok">Personagem encontrado no banco — use a aba &quot;Da Lista&quot; ou selecione abaixo</span>
              )}
              {estado === 'novo' && (
                <span className="status-novo">Não cadastrado. Envie uma foto ou vídeo:</span>
              )}
              {estado === 'salvo' && (
                <span className="status-salvo">Personagem cadastrado com sucesso!</span>
              )}
            </div>
          </div>

          {/* Upload quando o personagem é novo */}
          {(estado === 'novo') && (
            <div className="bloco-upload">
              <div className="upload-controles-foto">
                <button
                  type="button"
                  className="btn-selecionar-img"
                  onClick={() => inputArquivoRef.current?.click()}
                >
                  {arquivo ? `Arquivo selecionado: ${arquivo.name}` : 'Selecionar foto ou vídeo do computador'}
                </button>
                <input
                  ref={inputArquivoRef}
                  type="file"
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  onChange={handleArquivo}
                />
              </div>

              <p style={{ fontSize: 12, opacity: 0.8, margin: '6px 0' }}>
                Vídeos: máximo de {LIMITE_VIDEO_MB}MB. Serão exibidos sem som.
              </p>

              {limiteAtingido && (
                <p className="bloco-erro">
                  Você atingiu o limite de {LIMITE_PERSONAGENS} personagens cadastrados.
                </p>
              )}

              {erro && <p className="bloco-erro">{erro}</p>}

              <button
                type="button"
                className="btn-salvar-personagem"
                onClick={handleSalvarNovo}
                disabled={salvando || limiteAtingido}
              >
                {salvando ? 'Salvando no Storage e Banco...' : 'Salvar Personagem'}
              </button>
            </div>
          )}

          {estado === 'encontrado' && (
            <div className="bloco-upload" style={{ textAlign: 'center' }}>
              <p style={{ color: '#4cd137', fontWeight: 700, marginBottom: 8 }}>
                ✓ Personagem encontrado! Você pode selecioná-lo:
              </p>
              <button
                type="button"
                className="btn-salvar-personagem"
                style={{ background: '#27ae60' }}
                onClick={() => onPersonagemConfirmado(
                  // Usar dados que já foram carregados pelo verificar()
                  { nome: nome, imagem: preview ? preview.replace(BUCKET_URL, '') : '' }
                )}
              >
                Usar este personagem
              </button>
            </div>
          )}

          {estado === 'salvo' && (
            <div className="bloco-confirmacao">
              <p className="confirmacao-nome"><strong>{nome}</strong></p>
              <span className="confirmacao-badge">Cadastrado</span>
            </div>
          )}

          {estado !== 'novo' && estado !== 'encontrado' && erro && <p className="bloco-erro" style={{ padding: '0 16px 12px' }}>{erro}</p>}
        </div>
      )}

      {imagemModal && <ModalImagem url={imagemModal} onClose={() => setImagemModal(null)} />}
    </div>
  );
}


// ── Página principal ───────────────────────────────────────────────

export default function NovaBatalha() {
  const navigate = useNavigate();

  const [personagemA, setPersonagemA] = useState(null);
  const [personagemB, setPersonagemB] = useState(null);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [totalCriados, setTotalCriados] = useState(0);
  const [criando, setCriando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  // Todos os personagens do banco para lista inline
  const [todosPersonagens, setTodosPersonagens] = useState([]);
  const [carregandoPersonagens, setCarregandoPersonagens] = useState(false);

  // Estado do modal de personagens
  const [modalAberto, setModalAberto] = useState(false);
  const [ladoAlvo, setLadoAlvo] = useState('Personagem 1');

  useEffect(() => {
    function verificarLogin() {
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
    verificarLogin();
    carregarTodosPersonagens();
  }, []);

  async function carregarTodosPersonagens() {
    setCarregandoPersonagens(true);
    try {
      const dados = await buscarTodosPersonagensBanco();
      setTodosPersonagens(dados || []);
    } catch (err) {
      console.error('Erro ao carregar todos os personagens:', err);
    } finally {
      setCarregandoPersonagens(false);
    }
  }

  function handlePersonagemCriado(novo) {
    if (novo) {
      setTodosPersonagens((prev) => [novo, ...prev]);
    }
  }

  function abrirModalPara(lado) {
    setLadoAlvo(lado);
    setModalAberto(true);
  }

  function handleSelecionarPersonagemDoModal(p) {
    if (ladoAlvo === 'Personagem 1') {
      setPersonagemA(p);
    } else {
      setPersonagemB(p);
    }
  }

  async function handleCriarBatalha() {
    setErro('');

    if (!usuarioLogado) {
      setErro('Atenção: Você precisa estar logado para criar uma batalha.');
      return;
    }

    if (!personagemA) {
      setErro('Personagem 1 não foi confirmado. Escolha ou cadastre-o.');
      return;
    }
    if (!personagemB) {
      setErro('Personagem 2 não foi confirmado. Escolha ou cadastre-o.');
      return;
    }
    if (personagemA.id === personagemB.id) {
      setErro('Os dois personagens não podem ser iguais.');
      return;
    }

    setCriando(true);
    try {
      // Verifica duplicata de batalha
      const { data: existente } = await supabase
        .from('postagem')
        .select('id')
        .or(
          `and(id_personagem1.eq.${personagemA.id},id_personagem2.eq.${personagemB.id}),and(id_personagem1.eq.${personagemB.id},id_personagem2.eq.${personagemA.id})`
        )
        .limit(1);

      if (existente?.length) {
        setErro('Já existe uma batalha entre esses dois personagens.');
        setCriando(false);
        return;
      }

      const payloadBase = {
        id_personagem1: personagemA.id,
        id_personagem2: personagemB.id,
        votos_personagem1: 0,
        votos_personagem2: 0,
      };

      let payload = { ...payloadBase, id_usuario: usuarioLogado.id };
      console.log("vai inserir postagem:", payload);

      let { data, error: insertErr } = await supabase
        .from('postagem')
        .insert([payload])
        .select()
        .single();

      if (insertErr && insertErr.message && (insertErr.message.includes('id_usuario') || insertErr.code === 'PGRST204')) {
        console.warn("Tentando com coluna alternativa 'id_usuarios' para postagem...");
        payload = { ...payloadBase, id_usuarios: usuarioLogado.id };
        console.log("vai inserir postagem (tentativa 2):", payload);
        const res2 = await supabase
          .from('postagem')
          .insert([payload])
          .select()
          .single();
        data = res2.data;
        insertErr = res2.error;
      }

      if (insertErr) {
        console.error("Erro detalhado ao criar postagem:", insertErr);
        throw insertErr;
      }

      setSucesso(true);
    } catch (err) {
      console.error("Erro ao criar batalha:", err);
      setErro('Erro ao criar batalha: ' + (err.message || 'Erro no banco de dados. Verifique o console.'));
    } finally {
      setCriando(false);
    }
  }

  // Tela de sucesso
  if (sucesso) {
    return (
      <div className="nova-batalha-page">
        <div className="sucesso-card">
          <h2 className="sucesso-titulo">Batalha Criada com Sucesso</h2>
          <p className="sucesso-desc">
            <strong>{personagemA?.nome}</strong>
            <span className="sucesso-vs"> VS </span>
            <strong>{personagemB?.nome}</strong>
          </p>
          <p className="sucesso-sub">A batalha foi registrada no banco de dados e está aberta para votos e comentários.</p>
          <div className="sucesso-acoes">
            <Link to="/batalhas" className="btn-ver-batalhas">Ver Batalhas</Link>
            <button
              type="button"
              className="btn-nova-outra"
              onClick={() => {
                setSucesso(false);
                setPersonagemA(null);
                setPersonagemB(null);
              }}
            >
              Criar Outra Batalha
            </button>
          </div>
        </div>
      </div>
    );
  }

  const prontoParaCriar = personagemA && personagemB;

  return (
    <div className="nova-batalha-page">
      <div className="nova-batalha-container">
        <div className="nova-batalha-header">
          <h1 className="nova-batalha-titulo">Nova Batalha</h1>
          <p className="nova-batalha-sub">
            Escolha dois guerreiros existentes ou cadastre novos personagens.
          </p>
        </div>

        {/* Aviso de mídia */}
        <div style={estiloAvisoVideo}>
          Vídeos devem ter no máximo {LIMITE_VIDEO_MB}MB e serão exibidos em loop sem som.
        </div>

        {/* Alerta Destacado caso a pessoa esteja deslogada */}
        {!usuarioLogado && (
          <div className="aviso-deslogado-box">
            <div className="aviso-deslogado-conteudo">
              <div>
                <h4 className="aviso-deslogado-titulo">Você não está conectado</h4>
                <p className="aviso-deslogado-texto">
                  Para criar e registrar uma nova batalha na arena, você precisa estar autenticado no sistema.
                </p>
              </div>
            </div>
            <div className="aviso-deslogado-acoes">
              <Link to="/login" className="btn-aviso-login">Fazer Login</Link>
              <Link to="/cadastro" className="btn-aviso-cadastro">Criar Conta</Link>
            </div>
          </div>
        )}

        <div className="blocos-wrapper">
          <BlocoPersonagem
            label="PERSONAGEM 1"
            cor="linear-gradient(135deg, #f8cb47, #e5a800)"
            onPersonagemConfirmado={setPersonagemA}
            personagemSelecionado={personagemA}
            abrirModal={() => abrirModalPara('Personagem 1')}
            usuarioLogado={usuarioLogado}
            onPersonagemCriado={handlePersonagemCriado}
            todosPersonagens={todosPersonagens}
            carregandoPersonagens={carregandoPersonagens}
          />


          <div className="vs-separador">
            <span>VS</span>
          </div>

          <BlocoPersonagem
            label="PERSONAGEM 2"
            cor="linear-gradient(135deg, #e74c3c, #c0392b)"
            onPersonagemConfirmado={setPersonagemB}
            personagemSelecionado={personagemB}
            abrirModal={() => abrirModalPara('Personagem 2')}
            usuarioLogado={usuarioLogado}
            onPersonagemCriado={handlePersonagemCriado}
            todosPersonagens={todosPersonagens}
            carregandoPersonagens={carregandoPersonagens}
          />
        </div>

        {/* Mensagem de Erro */}
        {erro && <p className="nova-batalha-erro">{erro}</p>}

        {/* Botão de Criação */}
        <div className="criar-batalha-footer">
          {!prontoParaCriar && (
            <p className="aguardando-hint">
              Selecione ou cadastre os dois personagens acima para liberar a criação da batalha
            </p>
          )}

          <button
            className={`btn-criar-batalha ${prontoParaCriar && usuarioLogado ? 'btn-criar-batalha--pronto' : ''}`}
            onClick={handleCriarBatalha}
            disabled={criando || !prontoParaCriar || !usuarioLogado}
            type="button"
          >
            {criando ? 'Criando Batalha...' : 'Criar Batalha'}
          </button>
        </div>
      </div>

      {/* Modal de Personagens */}
      <ModalEscolherPersonagem
        aberto={modalAberto}
        onClose={() => setModalAberto(false)}
        onSelect={handleSelecionarPersonagemDoModal}
        ladoNome={ladoAlvo}
        listaCompleta={todosPersonagens}
      />
    </div>
  );
}