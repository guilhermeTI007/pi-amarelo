import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { Link } from "react-router-dom";
import ModalImagem from "../components/ModalImagem";
import "./Personagens.css";

const BUCKET_URL = "https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/";
const LIMITE_VIDEO_MB = 50;
const EXT_VIDEO = ["mp4", "webm", "mov", "m4v", "ogv", "ogg"];

function ehVideo(path) {
    if (!path) return false;
    if (path.startsWith("data:video")) return true;
    const limpo = path.split("?")[0].split("#")[0];
    const ext = limpo.split(".").pop().toLowerCase();
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

function ModalVideo({ url, onClose }) {
    useEffect(() => {
        function onKey(e) { if (e.key === "Escape") onClose(); }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, zIndex: 9999,
                background: "rgba(0,0,0,0.88)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 16,
            }}
        >
            <button
                type="button"
                onClick={onClose}
                style={{
                    position: "absolute", top: 16, right: 20,
                    background: "rgba(255,255,255,0.15)", color: "#fff",
                    border: "none", borderRadius: "50%", width: 40, height: 40,
                    fontSize: 20, cursor: "pointer",
                }}
            >
                ✕
            </button>
            <VideoMudo
                src={url}
                style={{
                    maxWidth: "92vw", maxHeight: "88vh",
                    borderRadius: 10, pointerEvents: "none",
                }}
            />
        </div>
    );
}

export default function Personagens() {
    const [personagens, setPersonagens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [imagemModal, setImagemModal] = useState(null);
    const [videoModal, setVideoModal] = useState(null);

    const [busca, setBusca] = useState("");
    const [sugestoes, setSugestoes] = useState([]);
    const [buscandoSugestoes, setBuscandoSugestoes] = useState(false);
    const [sugestoesVisiveis, setSugestoesVisiveis] = useState(false);
    const buscaRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        carregarTodosPersonagens();
    }, []);

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
                    .limit(10);
                setSugestoes(data || []);
                setSugestoesVisiveis(true);
            } finally {
                setBuscandoSugestoes(false);
            }
        }, 280);

        return () => clearTimeout(debounceRef.current);
    }, [busca]);

    useEffect(() => {
        function handleClick(e) {
            if (buscaRef.current && !buscaRef.current.contains(e.target)) {
                setSugestoesVisiveis(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    async function carregarTodosPersonagens() {
        setLoading(true);
        setErro(null);
        try {
            const { data, error } = await supabase
                .from("personagens")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setPersonagens(data || []);
        } catch (err) {
            setErro("Erro ao carregar personagens: " + err.message);
        } finally {
            setLoading(false);
        }
    }

    function getImagemUrl(imagemPath) {
        if (!imagemPath) return null;
        if (imagemPath.startsWith("http") || imagemPath.startsWith("data:")) return imagemPath;
        return BUCKET_URL + imagemPath;
    }

    function abrirMidia(imagemPath) {
        const url = getImagemUrl(imagemPath);
        if (!url) return;
        if (ehVideo(imagemPath)) setVideoModal(url);
        else setImagemModal(url);
    }

    function selecionarSugestao(sugestao) {
        setBusca(sugestao.nome);
        setSugestoesVisiveis(false);
        setPersonagens(prev => {
            if (!prev.find(p => p.id === sugestao.id)) {
                return [sugestao, ...prev];
            }
            return prev;
        });
    }

    const personagensMostrados = busca.trim()
        ? personagens.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
        : personagens;

    return (
        <div className="personagens-page">
            <div className="personagens-header">
                <h1 className="personagens-titulo">Personagens</h1>
                <p className="personagens-sub">Explore todos os guerreiros cadastrados</p>

                <p
                    style={{
                        background: "rgba(248, 203, 71, 0.12)",
                        border: "1px solid rgba(248, 203, 71, 0.5)",
                        color: "#f8cb47",
                        borderRadius: 8,
                        padding: "8px 14px",
                        fontSize: 13,
                        margin: "10px auto 14px",
                        maxWidth: 520,
                        textAlign: "center",
                    }}
                >
                    Vídeos devem ter no máximo {LIMITE_VIDEO_MB}MB e são exibidos sem som.
                </p>

                <div className="personagens-busca-wrap" ref={buscaRef}>
                    <div className="personagens-busca-inner">
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
                                    <div key={s.id} className="personagens-sugestao-item" onClick={() => selecionarSugestao(s)}>
                                        <div className="personagens-sugestao-img">
                                            {s.imagem ? (
                                                ehVideo(s.imagem) ? (
                                                    <VideoMudo src={getImagemUrl(s.imagem)} />
                                                ) : (
                                                    <img src={getImagemUrl(s.imagem)} alt={s.nome} />
                                                )
                                            ) : (
                                                <span>P</span>
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
                    <button onClick={carregarTodosPersonagens} className="btn-retry">Tentar novamente</button>
                </div>
            )}

            {!loading && !erro && (
                <>
                    <p className="personagens-count">
                        {busca.trim()
                            ? `${personagensMostrados.length} resultado(s) para "${busca}"`
                            : `Total no banco: ${personagens.length} personagem(s)`}
                    </p>

                    <div className="personagens-grid">
                        {personagensMostrados.map(p => (
                            <div key={p.id} className="personagem-card" onClick={() => abrirMidia(p.imagem)}>
                                <div className="personagem-imagem-wrap">
                                    {p.imagem ? (
                                        ehVideo(p.imagem) ? (
                                            <VideoMudo
                                                src={getImagemUrl(p.imagem)}
                                                className="personagem-imagem"
                                                onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
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

                    {personagensMostrados.length === 0 && !loading && (
                        <div className="personagens-vazio">
                            <p>Nenhum personagem encontrado para "{busca}".</p>
                        </div>
                    )}
                </>
            )}

            <div className="personagens-acoes">
                <Link to="/nova-batalha" className="btn-nova-batalha">Criar Nova Batalha</Link>
            </div>

            {imagemModal && <ModalImagem url={imagemModal} onClose={() => setImagemModal(null)} />}
            {videoModal && <ModalVideo url={videoModal} onClose={() => setVideoModal(null)} />}
        </div>
    );
}