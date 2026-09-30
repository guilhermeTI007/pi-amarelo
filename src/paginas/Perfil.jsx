import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Link, useNavigate } from 'react-router-dom';
import './Perfil.css';

const BUCKET_URL = 'https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/';

function getImagemUrl(p) {
  if (!p) return null;
  if (p.startsWith('http') || p.startsWith('data:')) return p;
  return BUCKET_URL + p;
}

export default function Perfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [batalhas, setBatalhas] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('batalhas'); // 'batalhas' | 'comentarios'
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem('usuario_logado');
    if (!userStr) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(userStr);
      const userObj = Array.isArray(parsed) ? parsed[0] : parsed;
      setUsuario(userObj);
      carregarHistoricos(userObj.id);
    } catch {
      setLoading(false);
    }
  }, []);

  async function carregarHistoricos(userId) {
    setLoading(true);
    try {
      // 1. Carrega histórico de batalhas criadas pelo usuário
      const { data: bData, error: bErr } = await supabase
        .from('postagem')
        .select(`
          id,
          data_postagem,
          votos_personagem1,
          votos_personagem2,
          personagem1:id_personagem1(id, nome, imagem),
          personagem2:id_personagem2(id, nome, imagem)
        `)
        .eq('id_usuario', userId)
        .order('data_postagem', { ascending: false });

      if (bErr) console.error('Erro ao carregar histórico de batalhas:', bErr);
      else setBatalhas(bData || []);

      // 2. Carrega histórico de comentários feitos pelo usuário
      const { data: cData, error: cErr } = await supabase
        .from('comentarios')
        .select(`
          id,
          texto,
          data_comentario,
          postagem:id_postagem(
            id,
            personagem1:id_personagem1(nome),
            personagem2:id_personagem2(nome)
          )
        `)
        .eq('id_usuarios', userId)
        .order('data_comentario', { ascending: false });

      if (cErr) console.error('Erro ao carregar histórico de comentários:', cErr);
      else setComentarios(cData || []);
    } catch (err) {
      console.error('Erro ao carregar dados do perfil:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('usuario_logado');
    setUsuario(null);
    navigate('/');
  }

  async function handleTrocarFoto(e) {
    const file = e.target.files[0];
    if (!file || !usuario) return;

    setUploadingFoto(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const nomeArquivoLimpo = usuario.nome.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      const caminhoStorage = `outros/${Date.now()}_perfil_${nomeArquivoLimpo}.${ext}`;

      // Upload para storage
      const { error: uploadErr } = await supabase.storage
        .from('personagens')
        .upload(caminhoStorage, file, { cacheControl: '3600', upsert: true });

      if (uploadErr) {
        throw new Error('Erro no Storage: ' + uploadErr.message + '\n\nCertifique-se de ter criado uma Policy de INSERT no bucket "personagens"!');
      }

      const novaFotoUrl = `${BUCKET_URL}${caminhoStorage}`;

      // Update banco de dados
      const { error: updateErr } = await supabase
        .from('usuarios')
        .update({ foto: novaFotoUrl })
        .eq('id', usuario.id);

      if (updateErr) throw updateErr;

      // Update local state and localStorage
      const novoUser = { ...usuario, foto: novaFotoUrl };
      setUsuario(novoUser);
      localStorage.setItem('usuario_logado', JSON.stringify(novoUser));
      alert('Foto de perfil atualizada com sucesso!');

    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingFoto(false);
    }
  }

  // Se o usuário não estiver logado
  if (!loading && !usuario) {
    return (
      <div className="perfil-deslogado-page">
        <div className="perfil-deslogado-card">
          <div className="perfil-deslogado-icone">•</div>
          <h2>Você não está conectado</h2>
          <p>Faça login ou crie sua conta para acessar seu perfil e visualizar seu histórico de batalhas e comentários.</p>
          <div className="perfil-deslogado-botoes">
            <Link to="/login" className="btn-perfil-login">Fazer Login</Link>
            <Link to="/cadastro" className="btn-perfil-cadastro">Criar Conta</Link>
          </div>
        </div>
      </div>
    );
  }

  const totalVotosRecebidos = batalhas.reduce(
    (acc, b) => acc + (b.votos_personagem1 || 0) + (b.votos_personagem2 || 0),
    0
  );

  return (
    <div className="container">
      {/* Seção Superior do Perfil */}
      <div className="profile-section">
        <div className="profile-card">
          <div className="banner-area"></div>
          
          <button
            className="btn-sair-perfil"
            onClick={handleLogout}
            title="Sair da Conta"
            type="button"
          >
            Sair
          </button>

          <div className="profile-pic-container">
            <img
              src={
                usuario?.foto ||
                `https://placehold.co/120x120/FFF/000?text=${usuario?.nome ? encodeURIComponent(usuario.nome.charAt(0).toUpperCase()) : 'U'}`
              }
              alt="Foto de Perfil"
              className="profile-pic"
            />
            <button 
              type="button" 
              className="btn-alterar-foto" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFoto}
            >
              {uploadingFoto ? 'Enviando...' : '📷 Alterar'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleTrocarFoto} 
            />
          </div>

          <h2 className="profile-nome">{usuario?.nome || 'Guerreiro da Arena'}</h2>
          <span className="profile-email">{usuario?.email}</span>

          <span className="profile-badge-papel">
            ⚔ Combatente Oficial
          </span>

          <div className="stats-container">
            <div className="stat-box">
              <span>Batalhas Criadas</span>
              <strong>{batalhas.length}</strong>
            </div>
            <div className="stat-box">
              <span>Comentários</span>
              <strong>{comentarios.length}</strong>
            </div>
            <div className="stat-box">
              <span>Votos Recebidos</span>
              <strong>{totalVotosRecebidos}</strong>
            </div>
          </div>
        </div>

        {/* Card Informativo / Biografia */}
        <div className="bio-card">
          <h3>INFORMAÇÕES DO GUERREIRO</h3>
          <div className="bio-info-grid">
            <div className="bio-info-item">
              <span className="bio-info-label">ID do Usuário:</span>
              <strong className="bio-info-val">#{usuario?.id}</strong>
            </div>
            <div className="bio-info-item">
              <span className="bio-info-label">E-mail Cadastrado:</span>
              <strong className="bio-info-val">{usuario?.email}</strong>
            </div>
            <div className="bio-info-item">
              <span className="bio-info-label">Data de Nascimento:</span>
              <strong className="bio-info-val">{usuario?.data_nascimento || 'Não informada'}</strong>
            </div>
            <div className="bio-info-item">
              <span className="bio-info-label">Membro da Arena Desde:</span>
              <strong className="bio-info-val">
                {usuario?.created_at
                  ? new Date(usuario.created_at).toLocaleDateString('pt-BR')
                  : 'Recente'}
              </strong>
            </div>
          </div>

          <div className="bio-acoes-rapidas">
            <Link to="/nova-batalha" className="btn-bio-nova-batalha">
              ⚔ Criar Nova Batalha
            </Link>
            <Link to="/batalhas" className="btn-bio-ver-batalhas">
              Ir para a Arena de Batalhas
            </Link>
          </div>
        </div>
      </div>

      {/* Seção de Históricos (Batalhas e Comentários) */}
      <div className="historicos-section">
        {/* Navegação entre Abas */}
        <div className="historicos-tabs">
          <button
            type="button"
            className={`tab-btn ${abaAtiva === 'batalhas' ? 'tab-btn--ativo' : ''}`}
            onClick={() => setAbaAtiva('batalhas')}
          >
            ⚔ Histórico de Batalhas ({batalhas.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${abaAtiva === 'comentarios' ? 'tab-btn--ativo' : ''}`}
            onClick={() => setAbaAtiva('comentarios')}
          >
            Histórico de Comentários ({comentarios.length})
          </button>
        </div>

        {/* Conteúdo: Histórico de Batalhas */}
        {abaAtiva === 'batalhas' && (
          <div className="historico-conteudo">
            {loading ? (
              <div className="historico-loading">
                <div className="spinner-sm" /> Carregando suas batalhas...
              </div>
            ) : batalhas.length === 0 ? (
              <div className="historico-vazio">
                <p>Você ainda não criou nenhuma batalha na arena.</p>
                <Link to="/nova-batalha" className="btn-criar-agora">
                  + Criar Minha Primeira Batalha
                </Link>
              </div>
            ) : (
              <div className="historico-grid-batalhas">
                {batalhas.map((b) => {
                  const total = (b.votos_personagem1 || 0) + (b.votos_personagem2 || 0);
                  const p1 = b.personagem1;
                  const p2 = b.personagem2;

                  return (
                    <div key={b.id} className="historico-batalha-card">
                      <div className="hist-batalha-header">
                        <span className="hist-badge">ID #{b.id}</span>
                        <span className="hist-data">
                          {b.data_postagem
                            ? new Date(b.data_postagem).toLocaleDateString('pt-BR')
                            : ''}
                        </span>
                        <span className="hist-votos">{total} votos</span>
                      </div>

                      <div className="hist-batalha-versus">
                        {/* Lutador 1 */}
                        <div className="hist-lutador">
                          <div className="hist-avatar">
                            {p1?.imagem ? (
                              <img src={getImagemUrl(p1.imagem)} alt={p1.nome} />
                            ) : (
                              <span>⚔</span>
                            )}
                          </div>
                          <span className="hist-lutador-nome">{p1?.nome || 'Lutador 1'}</span>
                          <span className="hist-lutador-votos">{b.votos_personagem1 || 0} votos</span>
                        </div>

                        <span className="hist-vs">VS</span>

                        {/* Lutador 2 */}
                        <div className="hist-lutador">
                          <div className="hist-avatar">
                            {p2?.imagem ? (
                              <img src={getImagemUrl(p2.imagem)} alt={p2.nome} />
                            ) : (
                              <span>⚔</span>
                            )}
                          </div>
                          <span className="hist-lutador-nome">{p2?.nome || 'Lutador 2'}</span>
                          <span className="hist-lutador-votos">{b.votos_personagem2 || 0} votos</span>
                        </div>
                      </div>

                      <Link to="/batalhas" className="btn-ver-na-arena">
                        Ver na Arena →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Conteúdo: Histórico de Comentários */}
        {abaAtiva === 'comentarios' && (
          <div className="historico-conteudo">
            {loading ? (
              <div className="historico-loading">
                <div className="spinner-sm" /> Carregando seus comentários...
              </div>
            ) : comentarios.length === 0 ? (
              <div className="historico-vazio">
                <p>Você ainda não comentou em nenhuma batalha.</p>
                <Link to="/batalhas" className="btn-criar-agora">
                  Ir para Batalhas e Comentar
                </Link>
              </div>
            ) : (
              <div className="historico-lista-comentarios">
                {comentarios.map((c) => (
                  <div key={c.id} className="historico-comentario-item">
                    <div className="hist-com-icone">•</div>
                    <div className="hist-com-corpo">
                      <div className="hist-com-header">
                        <span className="hist-com-batalha">
                          Batalha:{' '}
                          <strong>
                            {c.postagem?.personagem1?.nome || 'Lutador 1'} vs{' '}
                            {c.postagem?.personagem2?.nome || 'Lutador 2'}
                          </strong>
                        </span>
                        <span className="hist-com-data">
                          {c.data_comentario
                            ? new Date(c.data_comentario).toLocaleDateString('pt-BR')
                            : ''}
                        </span>
                      </div>
                      <p className="hist-com-texto">"{c.texto}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
