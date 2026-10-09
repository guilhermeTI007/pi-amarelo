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

    const [loginInput, setLoginInput] = useState("");
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
        setLoginInput("");
        alteraNome("");
        alteraEmail("");
        alteraSenha("");
        ConfereSenha("");
        setArquivo(null);
        setPlanoSelecionado(0);
        navigate(paraCadastro ? "/cadastro" : "/login");
    }

    async function inserirUser() {
        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim();
        const senhaLimpa = senha.trim();

        if (!nomeLimpo || !emailLimpo || !senhaLimpa) { showToast("Preencha todos os campos obrigatórios", "erro"); return; }
        if (senhaLimpa.length < 8) { showToast("A senha precisa ter no mínimo 8 caracteres", "erro"); return; }
        if (senhaLimpa !== verificaSenha.trim()) { showToast("As senhas não coincidem", "erro"); return; }

        setLoading(true);
        try {
            const { data: existente } = await supabase.from("usuarios").select("nome, email").or(`nome.ilike.${nomeLimpo},email.ilike.${emailLimpo}`);
            if (existente && existente.length > 0) { showToast("Este nome de usuário ou e-mail já existe.", "erro"); return; }

            let fotoUrl = "https://placehold.co/120x120/FFF/000?text=" + encodeURIComponent(nomeLimpo.charAt(0).toUpperCase());

            if (arquivo) {
                const ext = arquivo.name.split(".").pop() || "png";
                const nomeArquivoLimpo = nomeLimpo.toLowerCase().replace(/[^a-z0-9]/g, "_");
                const caminhoStorage = `outros/${Date.now()}_${nomeArquivoLimpo}.${ext}`;
                const { error: uploadErr } = await supabase.storage.from("personagens").upload(caminhoStorage, arquivo, { cacheControl: "3600", upsert: true });
                if (uploadErr) { showToast("Erro ao enviar a foto: " + uploadErr.message, "erro"); return; }
                fotoUrl = `https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/${caminhoStorage}`;
            }

            const { data, error } = await supabase.rpc('cadastrar_usuario', {
                p_nome: nomeLimpo,
                p_email: emailLimpo,
                p_senha: senhaLimpa,
                p_foto: fotoUrl,
                p_plano: planoSelecionado,
                p_data_nascimento: nascimento || "2000-01-01",
            });

            if (!error) {
                let usuarioFinal = Array.isArray(data) ? data[0] : data;
                if (!usuarioFinal || !usuarioFinal.id) {
                    const { data: userBuscado } = await supabase.from("usuarios").select("*").ilike("email", emailLimpo).maybeSingle();
                    if (userBuscado) usuarioFinal = userBuscado;
                }
                localStorage.setItem("usuario_logado", JSON.stringify(usuarioFinal || { nome: nomeLimpo, email: emailLimpo, foto: fotoUrl, plano: planoSelecionado }));
                showToast("Conta criada com sucesso! Bem-vindo(a)!", "sucesso");
                setTimeout(() => { window.location.href = "/"; }, 1200);
            } else {
                showToast("Erro ao criar conta: " + (error.message || "Tente novamente."), "erro");
                console.error(error);
            }
        } finally { setLoading(false); }
    }

    async function fazerLogin() {
        const loginLimpo = loginInput.trim();
        const senhaLimpa = senha.trim();

        if (!loginLimpo) { showToast("Informe seu nome de usuário ou e-mail", "erro"); return; }
        if (!senhaLimpa) { showToast("Informe sua senha", "erro"); return; }

        setLoading(true);
        try {
            const { data, error } = await supabase.rpc("login_usuario", {
                p_login: loginLimpo,
                p_senha: senhaLimpa,
            });

            if (error) {
                showToast("Erro no servidor: " + (error.message || "Falha ao consultar banco"), "erro");
                console.error("Erro no Supabase login:", error);
                return;
            }

            if (data && data.length > 0) {
                const usuario = data[0];
                localStorage.setItem("usuario_logado", JSON.stringify(usuario));
                showToast(`Bem-vindo(a) de volta, ${usuario.nome}!`, "sucesso");
                // Redireciona admin para o painel /admin, usuário normal para home /
                const destino = usuario.is_admin ? "/admin" : "/";
                setTimeout(() => { window.location.href = destino; }, 1000);
            } else {
                showToast("Usuário/E-mail ou senha incorretos. Tente novamente.", "erro");
            }
        } catch (err) {
            showToast("Erro inesperado: " + err.message, "erro");
            console.error(err);
        } finally { setLoading(false); }
    }

    useEffect(() => {
        // Limpa todos os campos ao carregar a página para evitar autopreenchimento guardado no navegador
        setLoginInput("");
        alteraNome("");
        alteraData("");
        alteraEmail("");
        alteraSenha("");
        ConfereSenha("");
        setArquivo(null);
        setPlanoSelecionado(0);
    }, []);

    if (!checkedAuth) return null;

    return (
        <div className="lc-page">
            <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={closeToast} />
            <div className="lc-wrapper">
                <div className="lc-card">
                    {exibeCadastro ? (
                        <form autoComplete="off" onSubmit={e => { e.preventDefault(); inserirUser(); }}>
                            <div className="lc-card-header">
                                <h1 className="lc-card-title">Cadastrar Usuário</h1>
                            </div>
                            <div className="lc-form-group">
                                <div className="lc-row-2">
                                    <div className="lc-field">
                                        <input className="lc-input" type="text" placeholder="Nome de usuário" autoComplete="off" value={nome} onChange={e => alteraNome(e.target.value)} />
                                    </div>
                                    <div className="lc-field">
                                        <input className="lc-input" type="date" placeholder="Data de nascimento" autoComplete="off" value={nascimento} onChange={e => alteraData(e.target.value)} />
                                    </div>
                                </div>
                                <div className="lc-field">
                                    <input className="lc-input" type="email" placeholder="E-mail" autoComplete="off" value={email} onChange={e => alteraEmail(e.target.value)} />
                                </div>
                                <div className="lc-field">
                                    <input className="lc-input" type="password" placeholder="senha" autoComplete="new-password" value={senha} onChange={e => alteraSenha(e.target.value)} />
                                    <PasswordChecker senha={senha} />
                                </div>
                                <div className="lc-field">
                                    <input
                                        className={`lc-input ${verificaSenha && senha !== verificaSenha ? "lc-input--erro" : verificaSenha && senha === verificaSenha ? "lc-input--ok" : ""}`}
                                        type="password" placeholder="confirmar senha" autoComplete="new-password" value={verificaSenha} onChange={e => ConfereSenha(e.target.value)}
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
                                <button className="lc-btn lc-btn--primary" type="submit" disabled={loading}>
                                    {loading ? <span className="lc-spinner" /> : "CONTINUAR"}
                                </button>
                                <button className="lc-btn lc-btn--ghost" onClick={() => alternarModo(false)} type="button">
                                    Já tenho uma conta?
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form autoComplete="off" onSubmit={e => { e.preventDefault(); fazerLogin(); }}>
                            <div className="lc-card-header">
                                <h1 className="lc-card-title">Entrar na conta</h1>
                            </div>
                            <div className="lc-form-group">
                                <div className="lc-field">
                                    <input className="lc-input" type="text" placeholder="Nome de usuário ou E-mail" autoComplete="off"
                                        value={loginInput}
                                        onChange={e => setLoginInput(e.target.value)}
                                    />
                                </div>
                                <div className="lc-field">
                                    <input className="lc-input" type="password" placeholder="senha" autoComplete="current-password" value={senha}
                                        onChange={e => alteraSenha(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="lc-actions">
                                <button className="lc-btn lc-btn--primary" type="submit" disabled={loading}>
                                    {loading ? <span className="lc-spinner" /> : "CONTINUAR"}
                                </button>
                                <button className="lc-btn lc-btn--ghost" onClick={() => alternarModo(true)} type="button">
                                    Criar novo usuário
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login_Cadastro;