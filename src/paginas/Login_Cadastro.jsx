import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabase";
import { useLocation, useNavigate } from "react-router-dom";
import "./Login_cadastro.css";

function Toast({ mensagem, tipo, onClose }) {
    useEffect(() => {
        if (!mensagem) return;
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [mensagem, onClose]);
    if (!mensagem) return null;
    return (
        <div className={`lc-toast lc-toast--${tipo}`}>
            <span className="lc-toast-icon">
                {tipo === "sucesso" ? "✓" : tipo === "erro" ? "✕" : "ℹ"}
            </span>
            <span className="lc-toast-text">{mensagem}</span>
            <button className="lc-toast-close" onClick={onClose}>✕</button>
        </div>
    );
}

function PasswordChecker({ senha }) {
    const checks = [
        { label: "Mínimo 8 caracteres", ok: senha.length >= 8 },
        { label: "Letra maiúscula", ok: /[A-Z]/.test(senha) },
        { label: "Letra minúscula", ok: /[a-z]/.test(senha) },
        { label: "Número", ok: /[0-9]/.test(senha) },
        { label: "Caractere especial (!@#$...)", ok: /[^A-Za-z0-9]/.test(senha) },
    ];
    if (!senha) return null;
    const strength = checks.filter(c => c.ok).length;
    const strengthLabel = strength <= 1 ? "Muito fraca" : strength === 2 ? "Fraca" : strength === 3 ? "Média" : strength === 4 ? "Boa" : "Forte";
    const strengthColor = strength <= 1 ? "#ff4757" : strength === 2 ? "#ff6b35" : strength === 3 ? "#ffa502" : strength === 4 ? "#2ed573" : "#1abc9c";
    return (
        <div className="lc-password-checker">
            <div className="lc-strength-bar">
                <div className="lc-strength-fill" style={{ width: `${(strength / 5) * 100}%`, backgroundColor: strengthColor }} />
            </div>
            <span className="lc-strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
            <ul className="lc-checks-list">
                {checks.map((c, i) => (
                    <li key={i} className={c.ok ? "lc-check-ok" : "lc-check-fail"}>
                        <span>{c.ok ? "✓" : "✕"}</span> {c.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function Login_Cadastro() {
    const location = useLocation();
    const navigate = useNavigate();

    const [exibeCadastro, alteraExibeCadastro] = useState(location.pathname !== "/login");
    const [checkedAuth, setCheckedAuth] = useState(false);

    useEffect(() => {
        alteraExibeCadastro(location.pathname !== "/login");
    }, [location.pathname]);

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuario_logado");
        if (usuarioSalvo) {
            navigate("/", { replace: true });
        } else {
            setCheckedAuth(true);
        }
    }, [navigate]);

    const [nome, alteraNome] = useState("");
    const [nascimento, alteraData] = useState("");
    const [email, alteraEmail] = useState("");
    const [senha, alteraSenha] = useState("");
    const [verificaSenha, ConfereSenha] = useState("");
    const [arquivo, setArquivo] = useState(null);
    const [planoSelecionado, setPlanoSelecionado] = useState(0);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ mensagem: "", tipo: "info" });

    const planoOpcoes = [
        { val: 2, emoji: "👑", nome: "VIP — R$ 80/mês", desc: "Personalização do perfil" },
        { val: 1, emoji: "⭐", nome: "Pro — R$ 15/mês", desc: "Comentários em destaque" },
        { val: 0, emoji: "🆓", nome: "Gratuito", desc: "Acesso básico" },
    ];

    const showToast = useCallback((mensagem, tipo = "info") => setToast({ mensagem, tipo }), []);
    const closeToast = useCallback(() => setToast({ mensagem: "", tipo: "info" }), []);

    function alternarModo(paraCadastro) {
        alteraExibeCadastro(paraCadastro);
        alteraNome("");
        alteraEmail("");
        alteraSenha("");
        ConfereSenha("");
        setArquivo(null);
        setPlanoSelecionado(0);
        navigate(paraCadastro ? "/cadastro" : "/login");
    }

    async function inserirUser() {
        if (!nome || !email || !senha) { showToast("Preencha todos os campos obrigatórios", "erro"); return; }
        if (senha.length < 8) { showToast("A senha precisa ter no mínimo 8 caracteres", "erro"); return; }
        if (senha !== verificaSenha) { showToast("As senhas não coincidem", "erro"); return; }

        setLoading(true);
        try {
            const { data: existente } = await supabase.from("usuarios").select("nome").eq("nome", nome);
            if (existente && existente.length > 0) { showToast("Este nome de usuário já existe. Escolha outro.", "erro"); return; }

            let fotoUrl = "https://placehold.co/120x120/FFF/000?text=" + encodeURIComponent(nome.charAt(0).toUpperCase());

            if (arquivo) {
                const ext = arquivo.name.split(".").pop() || "png";
                const nomeArquivoLimpo = nome.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
                const caminhoStorage = `outros/${Date.now()}_${nomeArquivoLimpo}.${ext}`;
                const { error: uploadErr } = await supabase.storage.from("personagens").upload(caminhoStorage, arquivo, { cacheControl: "3600", upsert: true });
                if (uploadErr) { showToast("Erro ao enviar a foto: " + uploadErr.message, "erro"); return; }
                fotoUrl = `https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/${caminhoStorage}`;
            }

            const { error, data } = await supabase.from("usuarios").insert([{
                nome, email, senha, foto: fotoUrl, plano: planoSelecionado, data_nascimento: nascimento || "2000-01-01"
            }]).select();

            if (!error && data && data.length > 0) {
                localStorage.setItem("usuario_logado", JSON.stringify(Array.isArray(data) ? data[0] : data));
                showToast("Conta criada com sucesso! Bem-vindo(a)!", "sucesso");
                setTimeout(() => { window.location.href = "/"; }, 1200);
            } else {
                showToast("Erro ao criar conta. Tente novamente.", "erro");
                console.error(error);
            }
        } finally { setLoading(false); }
    }

    async function fazerLogin() {
        if (!nome && !email) { showToast("Informe seu nome de usuário ou e-mail", "erro"); return; }
        if (!senha) { showToast("Informe sua senha", "erro"); return; }

        setLoading(true);
        try {
            const coluna = email !== "" ? "email" : "nome";
            const valor = email !== "" ? email : nome;
            const { data } = await supabase.from("usuarios").select("*").eq(coluna, valor).eq("senha", senha);

            if (data && data.length > 0) {
                localStorage.setItem("usuario_logado", JSON.stringify(Array.isArray(data) ? data[0] : data));
                showToast("Bem-vindo(a) de volta!", "sucesso");
                setTimeout(() => { window.location.href = "/"; }, 1000);
            } else {
                showToast("Usuário ou senha incorretos. Tente novamente.", "erro");
            }
        } finally { setLoading(false); }
    }

    if (!checkedAuth) return null;

    return (
        <div className="lc-page">
            <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={closeToast} />
            <div className="lc-wrapper">
                <div className="lc-card">
                    {exibeCadastro ? (
                        <>
                            <div className="lc-card-header">
                                <h1 className="lc-card-title">Cadastrar Usuário</h1>
                            </div>
                            <div className="lc-form-group">
                                <div className="lc-row-2">
                                    <div className="lc-field">
                                        <input className="lc-input" type="text" placeholder="Nome de usuário" value={nome} onChange={e => alteraNome(e.target.value)} />
                                    </div>
                                    <div className="lc-field">
                                        <input className="lc-input" type="date" placeholder="Data de nascimento" value={nascimento} onChange={e => alteraData(e.target.value)} />
                                    </div>
                                </div>
                                <div className="lc-field">
                                    <input className="lc-input" type="email" placeholder="E-mail" value={email} onChange={e => alteraEmail(e.target.value)} />
                                </div>
                                <div className="lc-field">
                                    <input className="lc-input" type="password" placeholder="senha" value={senha} onChange={e => alteraSenha(e.target.value)} />
                                    <PasswordChecker senha={senha} />
                                </div>
                                <div className="lc-field">
                                    <input
                                        className={`lc-input ${verificaSenha && senha !== verificaSenha ? "lc-input--erro" : verificaSenha && senha === verificaSenha ? "lc-input--ok" : ""}`}
                                        type="password" placeholder="confirmar senha" value={verificaSenha} onChange={e => ConfereSenha(e.target.value)}
                                    />
                                    {verificaSenha && senha !== verificaSenha && <span className="lc-field-erro">As senhas não coincidem</span>}
                                    {verificaSenha && senha === verificaSenha && <span className="lc-field-ok">✓ Senhas coincidem</span>}
                                </div>
                                <div className="lc-field">
                                    <label className="lc-file-label" style={{ 
                                        display: 'inline-flex', padding: '12px', background: '#3b3f54', borderRadius: '6px', 
                                        border: '1.5px solid rgba(255, 255, 255, 0.18)', cursor: 'pointer', color: '#fff', fontSize: '13px'
                                    }}>
                                        <input type="file" accept="image/*" onChange={e => setArquivo(e.target.files[0])} style={{ display: "none" }} />
                                        <span className="lc-file-btn" style={{textAlign: 'center', width: '100%'}}>
                                            {arquivo ? arquivo.name.slice(0, 24) + "..." : "Adicionar foto de perfil (Opcional)"}
                                        </span>
                                    </label>
                                </div>
                                <div className="lc-planos">
                                    <label className="lc-planos-label">Escolha seu plano (Opcional)</label>
                                    <div className="lc-planos-lista">
                                        {planoOpcoes.map(op => (
                                            <label key={op.val} className={`lc-plano-item ${planoSelecionado === op.val ? "lc-plano-item--ativo" : ""}`}>
                                                <input type="radio" name="plano" value={op.val} checked={planoSelecionado === op.val} onChange={() => setPlanoSelecionado(op.val)} />
                                                <span className="lc-plano-emoji">{op.emoji}</span>
                                                <div className="lc-plano-info">
                                                    <span className="lc-plano-nome">{op.nome}</span>
                                                    <span className="lc-plano-desc">{op.desc}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="lc-actions">
                                <button className="lc-btn lc-btn--primary" onClick={inserirUser} disabled={loading}>
                                    {loading ? <span className="lc-spinner" /> : "CONTINUAR"}
                                </button>
                                <button className="lc-btn lc-btn--ghost" onClick={() => alternarModo(false)} type="button">
                                    Já tenho uma conta?
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="lc-card-header">
                                <h1 className="lc-card-title">Entrar na conta</h1>
                            </div>
                            <div className="lc-form-group">
                                <div className="lc-field">
                                    <input className="lc-input" type="text" placeholder="Nome de usuário ou E-mail"
                                        value={email !== "" ? email : nome}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val.includes("@")) { alteraEmail(val); alteraNome(""); }
                                            else { alteraNome(val); alteraEmail(""); }
                                        }}
                                    />
                                </div>
                                <div className="lc-field">
                                    <input className="lc-input" type="password" placeholder="senha" value={senha}
                                        onChange={e => alteraSenha(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && fazerLogin()}
                                    />
                                </div>
                            </div>
                            <div className="lc-actions">
                                <button className="lc-btn lc-btn--primary" onClick={fazerLogin} disabled={loading}>
                                    {loading ? <span className="lc-spinner" /> : "CONTINUAR"}
                                </button>
                                <button className="lc-btn lc-btn--ghost" onClick={() => alternarModo(true)} type="button">
                                    Criar novo usuário
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login_Cadastro;
