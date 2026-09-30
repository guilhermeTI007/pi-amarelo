import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import ModalImagem from '../components/ModalImagem';
import './Personagens.css';

const BUCKET_URL = 'https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/';

export default function Personagens() {
  const [personagens, setPersonagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [offset, setOffset] = useState(0);
  const [temMais, setTemMais] = useState(true);
  const [imagemModal, setImagemModal] = useState(null);
  const limit = 20;

  useEffect(() => {
    buscarPersonagens();
  }, []);

  async function buscarPersonagens(novoOffset = 0) {
    if (novoOffset === 0) {
      setLoading(true);
    }
    setErro(null);
    try {
      const { data, error } = await supabase
        .from('personagens')
        .select('*')
        .order('created_at', { ascending: false })
        .range(novoOffset, novoOffset + limit - 1);

      if (error) throw error;
      
      if (novoOffset === 0) {
        setPersonagens(data || []);
      } else {
        setPersonagens((prev) => [...prev, ...(data || [])]);
      }

      setTemMais(data && data.length === limit);
      setOffset(novoOffset);
    } catch (err) {
      setErro('Erro ao carregar personagens: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function carregarMais() {
    buscarPersonagens(offset + limit);
  }

  function getImagemUrl(imagemPath) {
    if (!imagemPath) return null;
    if (imagemPath.startsWith('http') || imagemPath.startsWith('data:')) return imagemPath;
    return BUCKET_URL + imagemPath;
  }

  const personagensFiltrados = personagens.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="personagens-page">
      <div className="personagens-header">
        <h1 className="personagens-titulo">
          <span className="estrela">⚔</span> Personagens
        </h1>
        <p className="personagens-sub">Explore os guerreiros do universo</p>
        <input
          className="personagens-busca"
          type="text"
          placeholder="Filtrar personagem..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {loading && (
        <div className="personagens-loading">
          <div className="spinner" />
          <p>Carregando personagens...</p>
        </div>
      )}

      {erro && (
        <div className="personagens-erro">
          <p>{erro}</p>
          <button onClick={buscarPersonagens} className="btn-retry">Tentar novamente</button>
        </div>
      )}

      {!loading && !erro && (
        <>
          <p className="personagens-count">{personagensFiltrados.length} personagem(s) encontrado(s)</p>
          <div className="personagens-grid">
            {personagensFiltrados.map((p) => (
              <div key={p.id} className="personagem-card" onClick={() => p.imagem && setImagemModal(getImagemUrl(p.imagem))}>
                <div className="personagem-imagem-wrap">
                  {p.imagem ? (
                    <img
                      src={getImagemUrl(p.imagem)}
                      alt={p.nome}
                      className="personagem-imagem"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="personagem-avatar-fallback"
                    style={{ display: p.imagem ? 'none' : 'flex' }}
                  >
                    VS
                  </div>
                </div>
                <div className="personagem-info">
                  <p className="personagem-nome">{p.nome}</p>
                  <span className="personagem-badge">Personagem</span>
                </div>
              </div>
            ))}
          </div>
          {personagensFiltrados.length === 0 && !loading && (
            <div className="personagens-vazio">
              <p>Nenhum personagem encontrado.</p>
            </div>
          )}
          
          {temMais && !loading && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                onClick={carregarMais} 
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--accent-red, #c0392b)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Carregar mais personagens
              </button>
            </div>
          )}
        </>
      )}

      <div className="personagens-acoes">
        <Link to="/nova-batalha" className="btn-nova-batalha">
          Criar Nova Batalha
        </Link>
      </div>

      {imagemModal && <ModalImagem url={imagemModal} onClose={() => setImagemModal(null)} />}
    </div>
  );
}
