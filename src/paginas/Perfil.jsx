import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabase";
import { Link, useNavigate } from "react-router-dom";
import "./Perfil.css";

const BUCKET_URL = "https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/";

function getImagemUrl(p) {
    if (!p) return null;
    if (p.startsWith("http") || p.startsWith("data:")) return p;
    return BUCKET_URL + p;
}

// ── Plan info ──────────────────────────────────────────────────────
const PLANO_INFO = {
    2: { label: "VIP — R$ 80/mês",     emoji: "👑", cor: "#f8cb47", desc: "Personalização do perfil" },
    1: { label: "Pro — R$ 15/mês",     emoji: "⭐", cor: "#818cf8", desc: "Comentários em destaque" },
    0: { label: "Gratuito",             emoji: "🆓",    cor: "#ffffff", desc: "Acesso básico" },
};

// ── Toast ──────────────────────────────────────────────────────────
function Toast({ mensagem, tipo, onClose }) {
    useEffect(() => {
        if (!mensagem) return;
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [mensagem, onClose]);
    if (!mensagem) return null;
    return (
        <div className={`perfil-toast perfil-toast--${tipo}`}>
            <span className="perfil-toast-icon">{tipo === "sucesso" ? "✓" : tipo === "erro" ? "✕" : "ℹ"}</span>
            <span>{mensagem}</span>
            <button className="perfil-toast-close" onClick={onClose}>×</button>
        </div>
    );
}

// ── Modal Trocar Plano ────────────────────────────────────────────
function ModalTrocarPlano({ usuario, onClose, onSucesso, showToast }) {
    const [novoPlano, setNovoPlano] = useState(usuario.plano ?? 0);
    const [senhaConfirm, setSenhaConfirm] = useState("");
    const [loading, setLoading] = useState(false);

    const planoOpcoes = [
        { val: 2, emoji: "👑", nome: "VIP — R$ 80/mês", desc: "Personalização do perfil" },
        { val: 1, emoji: "⭐", nome: "Pro — R$ 15/mês", desc: "Comentários em destaque + prioridade" },
        { val: 0, emoji: "🆓",    nome: "Gratuito",         desc: "Acesso básico à arena" },
    ];

    async function confirmar() {
        if (!senhaConfirm) { showToast("Digite sua senha para confirmar", "erro"); return; }
        setLoading(true);
        try {
            const { data: check } = await supabase
                .from("usuarios").select("id").eq("id", usuario.id).eq("senha", senhaConfirm);
            if (!check || check.length === 0) { showToast("Senha incorreta", "erro"); return; }

            const { error } = await supabase.from("usuarios").update({ plano: novoPlano }).eq("id", usuario.id);
            if (error) { showToast("Erro ao atualizar plano: " + error.message, "erro"); return; }

            showToast("Plano atualizado com sucesso!", "sucesso");
            onSucesso(novoPlano);
            onClose();
        } finally { setLoading(false); }
    }

    return (
        <div className="perfil-modal-overlay" onClick={onClose}>
            <div className="perfil-modal" onClick={e => e.stopPropagation()}>
                <button className="perfil-modal-close" onClick={onClose}>×</button>
                <h2 className="perfil-modal-title">Trocar Plano</h2>
                <p className="perfil-modal-sub">Plano atual: <strong>{PLANO_INFO[usuario.plano ?? 0]?.label}</strong></p>

                <div className="perfil-planos-lista">
                    {planoOpcoes.map(op => (
                        <label key={op.val} className={`perfil-plano-item ${novoPlano === op.val ? "perfil-plano-item--ativo" : ""}`}>
                            <input type="radio" name="novoPlano" value={op.val} checked={novoPlano === op.val} onChange={() => setNovoPlano(op.val)} />
                            <span className="perfil-plano-emoji">{op.emoji}</span>
                            <div>
                                <span className="perfil-plano-nome">{op.nome}</span>
                                <span className="perfil-plano-desc-modal">{op.desc}</span>
                            </div>
                        </label>
                    ))}
                </div>

                <div className="perfil-modal-senha">
                    <label className="perfil-modal-label">Confirme sua senha para continuar</label>
                    <input
                        className="perfil-modal-input"
                        type="password"
                        placeholder="••••••••"
                        value={senhaConfirm}
                        onChange={e => setSenhaConfirm(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && confirmar()}
                    />
                </div>

                <div className="perfil-modal-actions">
                    <button className="perfil-modal-btn perfil-modal-btn--primary" onClick={confirmar} disabled={loading}>
                        {loading ? <span className="perfil-spinner" /> : "Confirmar troca e pagar"}
                    </button>
                    <button className="perfil-modal-btn perfil-modal-btn--ghost" onClick={onClose} type="button">Cancelar</button>
                </div>
            </div>
        </div>
    );
}

// ── Main Perfil ───────────────────────────────────────────────────
export default function Perfil() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [batalhas, setBatalhas] = useState([]);
    const [comentarios, setComentarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [abaAtiva, setAbaAtiva] = useState("batalhas");
    const [uploadingFoto, setUploadingFoto] = useState(false);
    const [showModalPlano, setShowModalPlano] = useState(false);
    const fileInputRef = useRef(null);

    const [toast, setToast] = useState({ mensagem: "", tipo: "info" });
    const showToast = useCallback((mensagem, tipo = "info") => setToast({ mensagem, tipo }), []);
    const closeToast = useCallback(() => setToast({ mensagem: "", tipo: "info" }), []);

    useEffect(() => {
        const userStr = localStorage.getItem("usuario_logado");
        if (!userStr) { setLoading(false); return; }
        try {
            const parsed = JSON.parse(userStr);
            const userObj = Array.isArray(parsed) ? parsed[0] : parsed;
            setUsuario(userObj);
            carregarHistoricos(userObj.id);
        } catch { setLoading(false); }
    }, []);

    async function carregarHistoricos(userId) {
        setLoading(true);
        try {
            const { data: bData, error: bErr } = await supabase
                .from("postagem")
                .select("id,data_postagem,votos_personagem1,votos_personagem2,personagem1:id_personagem1(id,nome,imagem),personagem2:id_personagem2(id,nome,imagem)")
                .eq("id_usuario", userId)
                .order("data_postagem", { ascending: false });
            if (bErr) console.error(bErr); else setBatalhas(bData || []);

            const { data: cData, error: cErr } = await supabase
                .from("comentarios")
                .select("id,texto,data_comentario,postagem:id_postagem(id,personagem1:id_personagem1(nome),personagem2:id_personagem2(nome))")
                .eq("id_usuarios", userId)
                .order("data_comentario", { ascending: false });
            if (cErr) console.error(cErr); else setComentarios(cData || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    function handleLogout() {
        localStorage.removeItem("usuario_logado");
        setUsuario(null);
        navigate("/");
    }

    async function handleTrocarFoto(e) {
        const file = e.target.files[0];
        if (!file || !usuario) return;
        setUploadingFoto(true);
        try {
            const ext = file.name.split(".").pop() || "png";
            const nomeArquivoLimpo = usuario.nome.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
            const caminhoStorage = `outros/${Date.now()}_perfil_${nomeArquivoLimpo}.${ext}`;
            const { error: uploadErr } = await supabase.storage.from("personagens").upload(caminhoStorage, file, { cacheControl: "3600", upsert: true });
            if (uploadErr) throw new Error("Erro no upload: " + uploadErr.message);
            const novaFotoUrl = `${BUCKET_URL}${caminhoStorage}`;
            const { error: updateErr } = await supabase.from("usuarios").update({ foto: novaFotoUrl }).eq("id", usuario.id);
            if (updateErr) throw updateErr;
            const novoUser = { ...usuario, foto: novaFotoUrl };
            setUsuario(novoUser);
            localStorage.setItem("usuario_logado", JSON.stringify(novoUser));
            showToast("Foto de perfil atualizada com sucesso!", "sucesso");
        } catch (err) { showToast(err.message, "erro"); }
        finally { setUploadingFoto(false); }
    }

    function handleTrocarPlanoSucesso(novoPlano) {
        const novoUser = { ...usuario, plano: novoPlano };
        setUsuario(novoUser);
        localStorage.setItem("usuario_logado", JSON.stringify(novoUser));
    }

    if (!loading && !usuario) {
        return (
            <div className="perfil-deslogado-page">
                <div className="perfil-deslogado-card">
                    <div className="perfil-deslogado-icone">⚔</div>
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

    const planoAtual = PLANO_INFO[usuario?.plano ?? 0] || PLANO_INFO[0];
    const totalVotosRecebidos = batalhas.reduce((acc, b) => acc + (b.votos_personagem1 || 0) + (b.votos_personagem2 || 0), 0);

    return (
        <div className="container">
            <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={closeToast} />

            {showModalPlano && (
                <ModalTrocarPlano
                    usuario={usuario}
                    onClose={() => setShowModalPlano(false)}
                    onSucesso={handleTrocarPlanoSucesso}
                    showToast={showToast}
                />
            )}

            {/* Seção Superior */}
            <div className="profile-section">
                <div className="profile-card">
                    <div className="banner-area" />

                    <button className="btn-sair-perfil" onClick={handleLogout} title="Sair da Conta" type="button">
                        Sair
                    </button>

                    <div className="profile-pic-container">
                        <img
                            src={usuario?.foto || `https://placehold.co/120x120/FFF/000?text=${usuario?.nome ? encodeURIComponent(usuario.nome.charAt(0).toUpperCase()) : "U"}`}
                            alt="Foto de Perfil"
                            className="profile-pic"
                        />
                        <button type="button" className="btn-alterar-foto" onClick={() => fileInputRef.current?.click()} disabled={uploadingFoto}>
                            {uploadingFoto ? "Enviando..." : "Alterar foto"}
                        </button>
                        <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleTrocarFoto} />
                    </div>

                    <h2 className="profile-nome">{usuario?.nome || "Guerreiro da Arena"}</h2>
                    <span className="profile-email">{usuario?.email}</span>

                    {/* Badge do plano */}
                    <div className="profile-plano-badge" style={{ borderColor: planoAtual.cor, color: planoAtual.cor }}>
                        <span>{planoAtual.emoji}</span>
                        <span>{planoAtual.label}</span>
                    </div>

                    {/* Botão trocar plano */}
                    <button
                        className="btn-trocar-plano"
                        onClick={() => setShowModalPlano(true)}
                        type="button"
                    >
                        Trocar Plano
                    </button>

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

                {/* Bio Card */}
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
                            <strong className="bio-info-val">{usuario?.data_nascimento || "Não informada"}</strong>
                        </div>
                        <div className="bio-info-item">
                            <span className="bio-info-label">Membro desde:</span>
                            <strong className="bio-info-val">
                                {usuario?.created_at ? new Date(usuario.created_at).toLocaleDateString("pt-BR") : "Recente"}
                            </strong>
                        </div>
                        <div className="bio-info-item bio-info-item--full">
                            <span className="bio-info-label" style={{ color: "#fff", fontWeight: "800" }}>Plano Atual:</span>
                            <strong className="bio-info-val" style={{ color: planoAtual.cor }}>
                                {planoAtual.emoji} {planoAtual.label} — {planoAtual.desc}
                            </strong>
                        </div>
                    </div>

                    <div className="bio-acoes-rapidas">
                        <Link to="/nova-batalha" className="btn-bio-nova-batalha">⚔ Criar Nova Batalha</Link>
                        <Link to="/batalhas" className="btn-bio-ver-batalhas">Ir para a Arena</Link>
                    </div>
                </div>
            </div>

            {/* Históricos */}
            <div className="historicos-section">
                <div className="historicos-tabs">
                    <button type="button" className={`tab-btn ${abaAtiva === "batalhas" ? "tab-btn--ativo" : ""}`} onClick={() => setAbaAtiva("batalhas")}>
                        ⚔ Histórico de Batalhas ({batalhas.length})
                    </button>
                    <button type="button" className={`tab-btn ${abaAtiva === "comentarios" ? "tab-btn--ativo" : ""}`} onClick={() => setAbaAtiva("comentarios")}>
                        Histórico de Comentários ({comentarios.length})
                    </button>
                </div>

                {abaAtiva === "batalhas" && (
                    <div className="historico-conteudo">
                        {loading ? (
                            <div className="historico-loading"><div className="spinner-sm" /> Carregando suas batalhas...</div>
                        ) : batalhas.length === 0 ? (
                            <div className="historico-vazio">
                                <p>Você ainda não criou nenhuma batalha na arena.</p>
                                <Link to="/nova-batalha" className="btn-criar-agora">+ Criar Minha Primeira Batalha</Link>
                            </div>
                        ) : (
                            <div className="historico-grid-batalhas">
                                {batalhas.map(b => {
                                    const total = (b.votos_personagem1 || 0) + (b.votos_personagem2 || 0);
                                    return (
                                        <div key={b.id} className="historico-batalha-card">
                                            <div className="hist-batalha-header">
                                                <span className="hist-badge">ID #{b.id}</span>
                                                <span className="hist-data">{b.data_postagem ? new Date(b.data_postagem).toLocaleDateString("pt-BR") : ""}</span>
                                                <span className="hist-votos">{total} votos</span>
                                            </div>
                                            <div className="hist-batalha-versus">
                                                <div className="hist-lutador">
                                                    <div className="hist-avatar">
                                                        {b.personagem1?.imagem ? <img src={getImagemUrl(b.personagem1.imagem)} alt={b.personagem1.nome} /> : <span>⚔</span>}
                                                    </div>
                                                    <span className="hist-lutador-nome">{b.personagem1?.nome || "Lutador 1"}</span>
                                                    <span className="hist-lutador-votos">{b.votos_personagem1 || 0} votos</span>
                                                </div>
                                                <span className="hist-vs">VS</span>
                                                <div className="hist-lutador">
                                                    <div className="hist-avatar">
                                                        {b.personagem2?.imagem ? <img src={getImagemUrl(b.personagem2.imagem)} alt={b.personagem2.nome} /> : <span>⚔</span>}
                                                    </div>
                                                    <span className="hist-lutador-nome">{b.personagem2?.nome || "Lutador 2"}</span>
                                                    <span className="hist-lutador-votos">{b.votos_personagem2 || 0} votos</span>
                                                </div>
                                            </div>
                                            <Link to="/batalhas" className="btn-ver-na-arena">Ver na Arena →</Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {abaAtiva === "comentarios" && (
                    <div className="historico-conteudo">
                        {loading ? (
                            <div className="historico-loading"><div className="spinner-sm" /> Carregando seus comentários...</div>
                        ) : comentarios.length === 0 ? (
                            <div className="historico-vazio">
                                <p>Você ainda não comentou em nenhuma batalha.</p>
                                <Link to="/batalhas" className="btn-criar-agora">Ir para Batalhas e Comentar</Link>
                            </div>
                        ) : (
                            <div className="historico-lista-comentarios">
                                {comentarios.map(c => (
                                    <div key={c.id} className="historico-comentario-item">
                                        <div className="hist-com-icone">•</div>
                                        <div className="hist-com-corpo">
                                            <div className="hist-com-header">
                                                <span className="hist-com-batalha">
                                                    Batalha: <strong>{c.postagem?.personagem1?.nome || "Lutador 1"} vs {c.postagem?.personagem2?.nome || "Lutador 2"}</strong>
                                                </span>
                                                <span className="hist-com-data">{c.data_comentario ? new Date(c.data_comentario).toLocaleDateString("pt-BR") : ""}</span>
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
