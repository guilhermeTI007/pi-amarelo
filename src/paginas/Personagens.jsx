import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { Link } from "react-router-dom";
import ModalImagem from "../components/ModalImagem";
import "./Personagens.css";

const BUCKET_URL = "https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/";
const LIMIT = 20;

export default function Personagens() {
    const [personagens, setPersonagens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [offset, setOffset] = useState(0);
    const [temMais, setTemMais] = useState(true);
    const [imagemModal, setImagemModal] = useState(null);

    // Busca / autocomplete
    const [busca, setBusca] = useState("");
    const [sugestoes, setSugestoes] = useState([]);
    const [buscandoSugestoes, setBuscandoSugestoes] = useState(false);
    const [sugestoesVisiveis, setSugestoesVisiveis] = useState(false);
    const buscaRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        buscarPersonagens(0);
    }, []);

    // Autocomplete com debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!busca.trim()) { setSugestoes([]); setSugestoesVisiveis(false); return; }

        debounceRef.current = setTimeout(async () => {
            setBuscandoSugestoes(true);
            try {
                const { data } = await supabase
                    .from("personagens")
                    .select("id, nome, imagem")
                    .ilike("nome", `%${busca}%`)
                    .limit(8);
                setSugestoes(data || []);
                setSugestoesVisiveis(true);
            } finally {
                setBuscandoSugestoes(false);
            }
        }, 280);

        return () => clearTimeout(debounceRef.current);
    }, [busca]);

    // Fechar sugestões ao clicar fora
    useEffect(() => {
        function handleClick(e) {
            if (buscaRef.current && !buscaRef.current.contains(e.target)) {
                setSugestoesVisiveis(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    async function buscarPersonagens(novoOffset = 0) {
        if (novoOffset === 0) setLoading(true);
        setErro(null);
        try {
            const { data, error } = await supabase
                .from("personagens")
                .select("*")
                .order("created_at", { ascending: false })
                .range(novoOffset, novoOffset + LIMIT - 1);

            if (error) throw error;

            if (novoOffset === 0) { setPersonagens(data || []); }
            else { setPersonagens(prev => [...prev, ...(data || [])]); }

            setTemMais(data && data.length === LIMIT);
            setOffset(novoOffset);
        } catch (err) {
            setErro("Erro ao carregar personagens: " + err.message);
        } finally {
            setLoading(false);
        }
    }

    function carregarMais() { buscarPersonagens(offset + LIMIT); }

    function getImagemUrl(imagemPath) {
        if (!imagemPath) return null;
        if (imagemPath.startsWith("http") || imagemPath.startsWith("data:")) return imagemPath;
        return BUCKET_URL + imagemPath;
    }

    function selecionarSugestao(nome) {
        setBusca(nome);
        setSugestoesVisiveis(false);
    }

    // Quando busca está ativa, filtra localmente. Quando vazia, exibe os 20 carregados.
    const personagensMostrados = busca.trim()
        ? personagens.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
        : personagens;

    return (
        <div className="personagens-page">
            <div className="personagens-header">
                <h1 className="personagens-titulo">
                    <span className="estrela">⚔</span> Personagens
                </h1>
                <p className="personagens-sub">Explore os guerreiros do universo</p>

                {/* Search com autocomplete */}
                <div className="personagens-busca-wrap" ref={buscaRef}>
                    <div className="personagens-busca-inner">
                        <span className="personagens-busca-icon">🔍</span>
                        <input
                            className="personagens-busca"
                            type="text"
                            placeholder="Buscar personagem pelo nome..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            onFocus={() => sugestoes.length > 0 && setSugestoesVisiveis(true)}
                        />
                        {busca && (
                            <button className="personagens-busca-clear" onClick={() => { setBusca(""); setSugestoes([]); setSugestoesVisiveis(false); }}>×</button>
                        )}
                    </div>

                    {sugestoesVisiveis && (
                        <div className="personagens-sugestoes">
                            {buscandoSugestoes ? (
                                <div className="personagens-sugestao-loading">Buscando...</div>
                            ) : sugestoes.length === 0 ? (
                                <div className="personagens-sugestao-vazio">Nenhum personagem encontrado</div>
                            ) : (
                                sugestoes.map(s => (
                                    <div key={s.id} className="personagens-sugestao-item" onClick={() => selecionarSugestao(s.nome)}>
                                        <div className="personagens-sugestao-img">
                                            {s.imagem ? (
                                                <img src={getImagemUrl(s.imagem)} alt={s.nome} />
                                            ) : (
                                                <span>⚔</span>
                                            )}
                                        </div>
                                        <span className="personagens-sugestao-nome">
                                            {s.nome}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
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
                    <button onClick={() => buscarPersonagens(0)} className="btn-retry">Tentar novamente</button>
                </div>
            )}

            {!loading && !erro && (
                <>
                    <p className="personagens-count">
                        {busca.trim()
                            ? `${personagensMostrados.length} resultado(s) para "${busca}"`
                            : `${personagens.length} personagem(s) carregado(s)`}
                    </p>

                    <div className="personagens-grid">
                        {personagensMostrados.map(p => (
                            <div key={p.id} className="personagem-card" onClick={() => p.imagem && setImagemModal(getImagemUrl(p.imagem))}>
                                <div className="personagem-imagem-wrap">
                                    {p.imagem ? (
                                        <img
                                            src={getImagemUrl(p.imagem)}
                                            alt={p.nome}
                                            className="personagem-imagem"
                                            onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                                        />
                                    ) : null}
                                    <div className="personagem-avatar-fallback" style={{ display: p.imagem ? "none" : "flex" }}>VS</div>
                                </div>
                                <div className="personagem-info">
                                    <p className="personagem-nome">{p.nome}</p>
                                    <span className="personagem-badge">Personagem</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {personagensMostrados.length === 0 && !loading && (
                        <div className="personagens-vazio">
                            <p>Nenhum personagem encontrado para "{busca}".</p>
                        </div>
                    )}

                    {/* "Carregar mais" só aparece quando NÃO está filtrando */}
                    {!busca.trim() && temMais && !loading && (
                        <div className="personagens-carregar-mais">
                            <button className="btn-carregar-mais" onClick={carregarMais}>
                                Carregar mais personagens
                            </button>
                        </div>
                    )}

                    {/* Aviso quando está filtrando e só exibe locais */}
                    {busca.trim() && (
                        <div className="personagens-busca-info">
                            <span>
                                🔍 Mostrando correspondências nos {personagens.length} personagens carregados.
                                {temMais && " Para busca mais ampla, limpe o filtro e carregue mais."}
                            </span>
                        </div>
                    )}
                </>
            )}

            <div className="personagens-acoes">
                <Link to="/nova-batalha" className="btn-nova-batalha">Criar Nova Batalha</Link>
            </div>

            {imagemModal && <ModalImagem url={imagemModal} onClose={() => setImagemModal(null)} />}
        </div>
    );
}
