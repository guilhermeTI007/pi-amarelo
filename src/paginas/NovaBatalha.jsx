import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { useNavigate, Link } from 'react-router-dom';
import './NovaBatalha.css';

const BUCKET_URL = 'https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/';

function getImagemUrl(p) {
  if (!p) return null;
  if (p.startsWith('http')) return p;
  return BUCKET_URL + p;
}

// ── Bloco de seleção de personagem ────────────────────────────────
function BlocoPersonagem({ label, cor, onPersonagemConfirmado }) {
  const [nome, setNome] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [preview, setPreview] = useState(null);

  // Estados: null=aguardando | 'verificando' | 'encontrado' | 'novo' | 'salvo'
  const [estado, setEstado] = useState(null);
  const [personagemData, setPersonagemData] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const inputArquivoRef = useRef();
  const debounceRef = useRef();

  // Debounce de verificação ao digitar nome
  useEffect(() => {
    if (!nome.trim()) {
      setEstado(null);
      setPersonagemData(null);
      setArquivo(null);
      setPreview(null);
      setErro('');
      onPersonagemConfirmado(null);
      return;
    }
    setEstado('verificando');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => verificar(nome.trim()), 700);
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
      setPersonagemData(data[0]);
      setPreview(getImagemUrl(data[0].imagem));
      onPersonagemConfirmado(data[0]);
    } else {
      setEstado('novo');
      setPersonagemData(null);
      setPreview(null);
      onPersonagemConfirmado(null);
    }
  }

  function handleArquivo(e) {
    const f = e.target.files[0];
    if (!f) return;
    setArquivo(f);
    setPreview(URL.createObjectURL(f));
    setErro('');
  }

  async function handleSalvarNovo() {
    if (!arquivo) { setErro('Selecione uma imagem para o personagem.'); return; }
    setSalvando(true);
    setErro('');
    try {
      const ext = arquivo.name.split('.').pop();
      const nomeArquivo = `outros/${Date.now()}_${nome.replace(/\s+/g, '_')}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('personagens')
        .upload(nomeArquivo, arquivo, { upsert: false });
      if (uploadErr) throw uploadErr;

      const { data, error: insertErr } = await supabase
        .from('personagens')
        .insert([{ nome: nome.trim(), imagem: nomeArquivo }])
        .select()
        .single();
      if (insertErr) throw insertErr;

      setEstado('salvo');
      setPersonagemData(data);
      setPreview(getImagemUrl(data.imagem));
      onPersonagemConfirmado(data);
    } catch (err) {
      setErro('Erro: ' + err.message);
    } finally {
      setSalvando(false);
    }
  }

  const corBorda =
    estado === 'encontrado' || estado === 'salvo'
      ? 'var(--accent-green)'
      : estado === 'novo'
      ? 'var(--accent-red)'
      : 'transparent';

  return (
    <div className="bloco-personagem" style={{ borderColor: corBorda }}>
      {/* Label e destaque de cor */}
      <div className="bloco-header" style={{ background: cor }}>
        <span className="bloco-label">{label}</span>
      </div>

      {/* Preview da imagem */}
      <div className="bloco-preview">
        {preview ? (
          <img src={preview} alt="preview" className="bloco-img" />
        ) : (
          <div className="bloco-placeholder">⚔</div>
        )}
      </div>

      {/* Campo de nome */}
      <div className="bloco-campo">
        <input
          type="text"
          className="campo-input"
          placeholder="Digite o nome do personagem..."
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          disabled={estado === 'salvo'}
        />
        <div className="bloco-status">
          {estado === 'verificando' && <span className="status-verificando">🔄 Verificando...</span>}
          {estado === 'encontrado' && (
            <span className="status-ok">✅ Encontrado no banco!</span>
          )}
          {estado === 'novo' && (
            <span className="status-novo">🆕 Não cadastrado — adicione uma imagem abaixo</span>
          )}
          {estado === 'salvo' && (
            <span className="status-salvo">🎉 Personagem cadastrado com sucesso!</span>
          )}
        </div>
      </div>

      {/* Upload só aparece quando o personagem é novo ou para substituir */}
      {(estado === 'novo') && (
        <div className="bloco-upload">
          <p className="upload-instrucao">
            📸 Selecione uma imagem para cadastrar <strong>"{nome}"</strong>:
          </p>
          <button
            type="button"
            className="btn-selecionar-img"
            onClick={() => inputArquivoRef.current?.click()}
          >
            {arquivo ? `✔ ${arquivo.name}` : '📁 Escolher imagem'}
          </button>
          <input
            ref={inputArquivoRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleArquivo}
          />

          {erro && <p className="bloco-erro">{erro}</p>}

          <button
            type="button"
            className="btn-salvar-personagem"
            onClick={handleSalvarNovo}
            disabled={salvando || !arquivo}
          >
            {salvando ? '⏳ Salvando...' : '💾 Salvar Personagem'}
          </button>
        </div>
      )}

      {/* Dados do personagem encontrado / salvo */}
      {(estado === 'encontrado' || estado === 'salvo') && personagemData && (
        <div className="bloco-confirmacao">
          <p className="confirmacao-nome">📋 <strong>{personagemData.nome}</strong></p>
          <p className="confirmacao-id">ID: #{personagemData.id}</p>
          {estado === 'salvo' && (
            <span className="confirmacao-badge">✅ Cadastrado agora</span>
          )}
          {estado === 'encontrado' && (
            <span className="confirmacao-badge confirmacao-badge--existente">✅ Já existia</span>
          )}
        </div>
      )}
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
  const [batalhaId, setBatalhaId] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('usuario_logado');
    if (userStr) {
      setUsuarioLogado(JSON.parse(userStr));
    }
  }, []);
  async function handleCriarBatalha() {
    setErro('');
    if (!personagemA) { setErro('Personagem 1 não confirmado. Verifique ou cadastre-o.'); return; }
    if (!personagemB) { setErro('Personagem 2 não confirmado. Verifique ou cadastre-o.'); return; }
    if (personagemA.id === personagemB.id) { setErro('Os dois personagens são iguais!'); return; }
    if (!usuarioLogado) { setErro('Você precisa estar logado para criar uma batalha.'); return; }

    setCriando(true);
    try {
      // Verifica duplicata
      const { data: existente } = await supabase
        .from('postagem')
        .select('id')
        .or(`and(id_personagem1.eq.${personagemA.id},id_personagem2.eq.${personagemB.id}),and(id_personagem1.eq.${personagemB.id},id_personagem2.eq.${personagemA.id})`)
        .limit(1);

      if (existente?.length) {
        setErro('⚠️ Já existe uma batalha entre esses dois personagens!');
        setCriando(false);
        return;
      }

      const { data: nova, error: insertErr } = await supabase
        .from('postagem')
        .insert([{
          id_usuario: usuarioLogado.id,
          id_personagem1: personagemA.id,
          id_personagem2: personagemB.id,
          votos_personagem1: 0,
          votos_personagem2: 0,
        }])
        .select()
        .single();

      if (insertErr) throw insertErr;

      setSucesso(true);
      setBatalhaId(nova.id);
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
          <div className="sucesso-icone">🎉</div>
          <h2 className="sucesso-titulo">Batalha Criada!</h2>
          <p className="sucesso-desc">
            <strong>{personagemA?.nome}</strong>
            <span className="sucesso-vs"> VS </span>
            <strong>{personagemB?.nome}</strong>
          </p>
          <p className="sucesso-sub">A batalha foi registrada com sucesso no banco de dados.</p>
          <div className="sucesso-acoes">
            <Link to="/batalhas" className="btn-ver-batalhas">🔥 Ver Batalhas</Link>
            <button
              type="button"
              className="btn-nova-outra"
              onClick={() => { setSucesso(false); setPersonagemA(null); setPersonagemB(null); }}
            >
              ➕ Criar Outra
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
          <h1 className="nova-batalha-titulo">⚔ Nova Batalha</h1>
          <p className="nova-batalha-sub">
            Digite o nome de cada personagem. Se não existir no banco, você poderá
            cadastrá-lo com uma imagem.
          </p>
        </div>

        <div className="blocos-wrapper">
          <BlocoPersonagem
            label="Personagem 1"
            cor="linear-gradient(135deg, #f8cb47, #e5a800)"
            onPersonagemConfirmado={setPersonagemA}
          />

          <div className="vs-separador">
            <span>VS</span>
          </div>

          <BlocoPersonagem
            label="Personagem 2"
            cor="linear-gradient(135deg, #e74c3c, #c0392b)"
            onPersonagemConfirmado={setPersonagemB}
          />
        </div>

        {/* Aviso se não estiver logado */}
        {!usuarioLogado && (
          <div className="aviso-login">
            <p>⚠️ Você precisa estar logado para criar uma batalha.</p>
            <Link to="/login" className="btn-ir-login">Fazer Login</Link>
          </div>
        )}

        {/* Status e botão de criar */}
        {erro && <p className="nova-batalha-erro">{erro}</p>}

        <div className="criar-batalha-footer">
          {!prontoParaCriar && (
            <p className="aguardando-hint">
              ⏳ Confirme os dois personagens acima para criar a batalha
            </p>
          )}
          <button
            className={`btn-criar-batalha ${prontoParaCriar && usuarioLogado ? 'btn-criar-batalha--pronto' : ''}`}
            onClick={handleCriarBatalha}
            disabled={criando || !prontoParaCriar || !usuarioLogado}
            type="button"
          >
            {criando ? '⏳ Criando...' : '⚔ Criar Batalha'}
          </button>
        </div>
      </div>
    </div>
  );
}
