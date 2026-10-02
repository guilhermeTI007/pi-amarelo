import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { Link } from "react-router-dom";
import ModalImagem from "../components/ModalImagem";
import "./Personagens.css";

const BUCKET_URL = "https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/";
const LIMIT = 20;

// Verifica se o caminho é um vídeo — ignora query-string da URL
function isVideo(path) {
    if (!path) return false;
    const clean = path.split('?')[0];
    return /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv)$/i.test(clean);
}

export default function Personagens() {
    const [personagens, setPersonagens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [offset, setOffset] = useState(0);
    const [temMais, setTemMais] = useState(true);
    const [imagemModal, setImagemModal] = useState(null);

    // Busca
    const [busca, setBusca] = useState("");
    const [resultadosBusca, setResultadosBusca] = useState([]);
    const [buscandoDB, setBuscandoDB] = useState(false);
    const buscaRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        buscarPersonagens(0);
    }, []);

    // Busca completa no banco com debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!busca.trim()) { setResultadosBusca([]); return; }

        debounceRef.current = setTimeout(async () => {
            setBuscandoDB(true);
            try {
                const { data } = await supabase
                    .from("personagens")
                    .select("*")
                    .ilike("nome", `%${busca.trim()}%`)
                    .order("nome", { ascending: true })
                    .limit(200);
                setResultadosBusca(data || []);
            } finally {
                setBuscandoDB(false);
            }
        }, 350);

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

    // Quando busca está ativa, usa resultados do banco. Quando vazia, exibe os carregados.
    const personagensMostrados = busca.trim() ? resultadosBusca : personagens;

    return (
        <div className="personagens-page">
            <div className="personagens-header">
                <h1 className="personagens-titulo">
                    <span className="estrela">⚔</span> Personagens
                </h1>
                <p className="personagens-sub">Explore os guerreiros do universo</p>

                {/* Campo de busca */}
                <div className="personagens-busca-wrap" ref={buscaRef}>
                    <div className="personagens-busca-inner">
                        <span className="personagens-busca-icon">🔍</span>
                        <input
                            className="personagens-busca"
                            type="text"
                            placeholder="Buscar personagem pelo nome em todo o banco..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                        {busca && (
                            <button className="personagens-busca-clear" onClick={() => { setBusca(""); setResultadosBusca([]); }}>×</button>
                        )}
                    </div>
                    {buscandoDB && busca.trim() && (
                        <div className="personagens-sugestao-loading" style={{ padding: '8px 14px', fontSize: '13px', color: '#a0aec0' }}>Buscando no banco...</div>
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
                            ? `${personagensMostrados.length} resultado(s) para "${busca}" (busca em todo o banco)`
                            : `${personagens.length} personagem(s) carregado(s)`}
                    </p>

                    <div className="personagens-grid">
                        {personagensMostrados.map(p => (
                            <div
                                key={p.id}
                                className="personagem-card"
                                onClick={() => p.imagem && setImagemModal(getImagemUrl(p.imagem))}
                                style={{ cursor: p.imagem ? 'pointer' : 'default' }}
                            >
                                <div className="personagem-imagem-wrap">
                                    {p.imagem ? (
                                        isVideo(p.imagem) ? (
                                            <video
                                                src={getImagemUrl(p.imagem)}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="personagem-imagem"
                                                style={{ pointerEvents: 'none' }}
                                            />
                                        ) : (
                                            <img
                                                src={getImagemUrl(p.imagem)}
                                                alt={p.nome}
                                                className="personagem-imagem"
                                                onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                                            />
                                        )
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

                    {personagensMostrados.length === 0 && !loading && !buscandoDB && (
                        <div className="personagens-vazio">
                            <p>{busca.trim() ? `Nenhum personagem encontrado para "${busca}".` : 'Nenhum personagem cadastrado ainda.'}</p>
                        </div>
                    )}

                    {/* "Carregar mais" só aparece quando NÃO está buscando */}
                    {!busca.trim() && temMais && !loading && (
                        <div className="personagens-carregar-mais">
                            <button className="btn-carregar-mais" onClick={carregarMais}>
                                Carregar mais personagens
                            </button>
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
