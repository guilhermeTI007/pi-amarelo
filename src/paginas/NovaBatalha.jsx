import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { useNavigate, Link } from 'react-router-dom';
import ModalImagem from '../components/ModalImagem';
import './NovaBatalha.css';

const BUCKET_URL = 'https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/';

function getImagemUrl(p) {
  if (!p) return null;
  if (p.startsWith('http') || p.startsWith('data:')) return p;
  return BUCKET_URL + p;
}

// ── Modal de Seleção de Personagem com Paginação (50 por página) ──
function ModalEscolherPersonagem({ aberto, onClose, onSelect, ladoNome }) {
  const [personagens, setPersonagens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const ITENS_POR_PAGINA = 50;

  useEffect(() => {
    if (aberto) {
      carregarPersonagens();
      setPagina(1);
      setBusca('');
    }
  }, [aberto]);

  async function carregarPersonagens() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('personagens')
        .select('*')
        .order('nome', { ascending: true });
      if (error) throw error;
      setPersonagens(data || []);
    } catch (err) {
      console.error('Erro ao buscar personagens:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!aberto) return null;

  const filtrados = personagens.filter((p) =>
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
            personagensPagina.map((p) => (
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
                    p.imagem.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                      <video src={getImagemUrl(p.imagem)} autoPlay loop muted playsInline style={{ pointerEvents: 'none', width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img
                        src={getImagemUrl(p.imagem)}
                        alt={p.nome}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
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
            ))
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
}) {
  const [nome, setNome] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [preview, setPreview] = useState(null);

  // Estados: null=aguardando | 'verificando' | 'encontrado' | 'novo' | 'salvo'
  const [estado, setEstado] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [imagemModal, setImagemModal] = useState(null);

  const inputArquivoRef = useRef();
  const debounceRef = useRef();

  // Se veio selecionado do modal exterior
  useEffect(() => {
    if (personagemSelecionado) {
      setNome(personagemSelecionado.nome);
      setPreview(getImagemUrl(personagemSelecionado.imagem));
      setEstado('encontrado');
      setErro('');
    }
  }, [personagemSelecionado]);

  // Debounce de verificação ao digitar nome
  useEffect(() => {
    if (personagemSelecionado && personagemSelecionado.nome === nome) return;

    if (!nome.trim()) {
      setEstado(null);
      setArquivo(null);
      setPreview(null);
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
      onPersonagemConfirmado(data[0]);
    } else {
      setEstado('novo');
      setPreview(null);
      onPersonagemConfirmado(null);
    }
  }

  function handleArquivo(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type.startsWith('video/')) {
        if (f.size > 50 * 1024 * 1024) {
            alert("Aviso: O arquivo de vídeo deve ter no máximo 50 MB.");
            return;
        }
    }
    setArquivo(f);
    setPreview(URL.createObjectURL(f));
    setErro('');
  }

  async function handleSalvarNovo() {
    if (!usuarioLogado) {
      setErro('Você precisa estar logado para cadastrar um personagem.');
      return;
    }

    if (!nome.trim()) {
      setErro('Informe o nome do personagem.');
      return;
    }

    if (!arquivo) {
      setErro('Por favor, selecione uma foto para o personagem.');
      return;
    }

    setSalvando(true);
    setErro('');

    try {
      let caminhoFinal = '';

      // Envia a foto para o Supabase Storage no bucket 'personagens' dentro da pasta 'outros/'
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

      // Insere o personagem na tabela do banco de dados
      const { data, error: insertErr } = await supabase
        .from('personagens')
        .insert([{ nome: nome.trim(), imagem: caminhoFinal, id_usuarios: usuarioLogado.id }])
        .select()
        .single();

      if (insertErr) throw insertErr;

      setEstado('salvo');
      setPreview(getImagemUrl(data.imagem));
      onPersonagemConfirmado(data);
    } catch (err) {
      setErro('Erro ao salvar personagem: ' + err.message);
    } finally {
      setSalvando(false);
    }
  }

  function handleLimpar() {
    setNome('');
    setArquivo(null);
    setPreview(null);
    setEstado(null);
    setErro('');
    onPersonagemConfirmado(null);
  }

  const corBorda =
    estado === 'encontrado' || estado === 'salvo'
      ? 'var(--accent-green, #2ecc71)'
      : estado === 'novo'
      ? 'var(--accent-red, #e74c3c)'
      : 'transparent';

  return (
    <div className="bloco-personagem" style={{ borderColor: corBorda }}>
      {/* Label e destaque de cor */}
      <div className="bloco-header" style={{ background: cor }}>
        <span className="bloco-label">{label}</span>
        {personagemSelecionado && (
          <button type="button" className="btn-trocar-personagem" onClick={handleLimpar} title="Trocar personagem">
            Trocar ✕
          </button>
        )}
      </div>

      {/* Preview da imagem */}
      <div className="bloco-preview">
        {preview ? (
          (arquivo?.type?.startsWith('video/') || (typeof preview === 'string' && preview.match(/\.(mp4|webm|ogg|mov)$/i))) ? (
            <video src={preview} className="bloco-img" autoPlay loop muted playsInline style={{ pointerEvents: 'none' }} />
          ) : (
            <img src={preview} alt="preview" className="bloco-img" onClick={() => setImagemModal(preview)} />
          )
        ) : (
          <div className="bloco-placeholder">VS</div>
        )}
      </div>

      {/* 1ª Opção — Campo de nome */}
      <div className="bloco-dica">
        <span className="bloco-dica-titulo">1ª Opção — Digite o nome</span>
        <span className="bloco-dica-desc">Pesquisamos automaticamente se o personagem já existe no banco.</span>
      </div>
      <div className="bloco-campo">
        <input
          type="text"
          className="campo-input"
          placeholder="Ex: Goku, Naruto, Batman..."
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          disabled={estado === 'salvo'}
        />
        <div className="bloco-status">
          {estado === 'verificando' && <span className="status-verificando">Verificando no banco...</span>}
          {estado === 'encontrado' && (
            <span className="status-ok">Personagem encontrado no banco</span>
          )}
          {estado === 'novo' && (
            <span className="status-novo">Não cadastrado. Envie uma foto:</span>
          )}
          {estado === 'salvo' && (
            <span className="status-salvo">Personagem cadastrado com sucesso!</span>
          )}
        </div>
      </div>

      {/* 2º — Ou escolher da lista */}
      <div className="bloco-separador">
        <span className="bloco-separador-linha" />
        <span className="bloco-separador-texto">ou</span>
        <span className="bloco-separador-linha" />
      </div>
      <div className="bloco-dica" style={{ marginBottom: '4px' }}>
        <span className="bloco-dica-titulo">2ª Opção — Escolha da lista</span>
        <span className="bloco-dica-desc">Pesquise e selecione um personagem já cadastrado.</span>
      </div>
      <div className="bloco-acoes-topo">
        <button
          type="button"
          className="btn-abrir-modal-lista"
          onClick={abrirModal}
        >
          Escolher da Lista
        </button>
      </div>

      {/* Upload quando o personagem é novo */}
      {estado === 'novo' && (
        <div className="bloco-upload">
          <div className="bloco-dica">
            <span className="bloco-dica-titulo">Etapa 2 — Adicione uma foto ou vídeo</span>
            <span className="bloco-dica-desc">Escolha uma imagem ou vídeo de até 50 MB para representar esse personagem.</span>
          </div>
          <div className="upload-controles-foto">
            <button
              type="button"
              className="btn-selecionar-img"
              onClick={() => inputArquivoRef.current?.click()}
            >
              {arquivo ? `Arquivo selecionado: ${arquivo.name}` : 'Selecionar foto ou vídeo (máx. 50 MB)'}
            </button>
            <input
              ref={inputArquivoRef}
              type="file"
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={handleArquivo}
            />
          </div>

          {erro && <p className="bloco-erro">{erro}</p>}

          <button
            type="button"
            className="btn-salvar-personagem"
            onClick={handleSalvarNovo}
            disabled={salvando}
          >
            {salvando ? 'Salvando no Storage e Banco...' : 'Salvar Personagem'}
          </button>
        </div>
      )}

      {/* Dados do personagem encontrado / salvo */}
      {(estado === 'encontrado' || estado === 'salvo') && (
        <div className="bloco-confirmacao">
          <p className="confirmacao-nome"><strong>{nome}</strong></p>
          {estado === 'salvo' && (
            <span className="confirmacao-badge">Cadastrado</span>
          )}
          {estado === 'encontrado' && (
            <span className="confirmacao-badge confirmacao-badge--existente">Pronto para lutar</span>
          )}
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
  const [criando, setCriando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

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
  }, []);

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

      const { error: insertErr } = await supabase
        .from('postagem')
        .insert([
          {
            id_usuario: usuarioLogado.id,
            id_personagem1: personagemA.id,
            id_personagem2: personagemB.id,
            votos_personagem1: 0,
            votos_personagem2: 0,
          },
        ])
        .select()
        .single();

      if (insertErr) throw insertErr;

      setSucesso(true);
    } catch (err) {
      setErro('Erro ao criar batalha: ' + err.message);
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
      />
    </div>
  );
}
