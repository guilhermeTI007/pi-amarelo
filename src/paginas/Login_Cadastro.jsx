import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useLocation } from "react-router-dom";
import "./Login_cadastro.css";

function Login_Cadastro() {
    const location = useLocation();

    const [usuario, alteraUsuario] = useState([])

    const [exibeUser, alteraExibeUser] = useState(false)
    const [exibeCadastro, alteraExibeCadastro] = useState(location.pathname !== '/login')

    useEffect(() => {
        alteraExibeCadastro(location.pathname !== '/login');
    }, [location.pathname]);

    const [nome, alteraNome] = useState("")
    const [nascimento, alteraData] = useState("")

    const [email, alteraEmail] = useState("")
    const [senha, alteraSenha] = useState("")

    const [verificaSenha, ConfereSenha] = useState("")
    const [arquivo, setArquivo] = useState(null)

    async function inserirUser() {
        if (!nome || !email || !senha) {
            alert("Preencha todos os campos obrigatórios");
            return;
        }

        let caminhoFinalDaImagemNoStorage = "https://placehold.co/120x120/FFF/000?text=" + (nome ? encodeURIComponent(nome.charAt(0).toUpperCase()) : "U");

        if (arquivo) {
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
                alert("Erro ao fazer upload da foto: " + uploadErr.message);
                return;
            }

            caminhoFinalDaImagemNoStorage = `https://rqjleobhyxxqfgwzruxa.supabase.co/storage/v1/object/public/personagens/${caminhoStorage}`;
        }

        const obj = {
            nome: nome,
            email: email,
            senha: !isNaN(Number(senha)) && senha !== "" ? Number(senha) : 123456,
            foto: caminhoFinalDaImagemNoStorage,
            plano: 0,
            data_nascimento: nascimento || "2000-01-01"
        }

        // 2. Se a função captarUser retornar que existe, o return impede de chegar no insert abaixo
        if (exibeCadastro == true && exibeUser == false) {

            if (await captarUser()) {
                return
            }
            if (senha != verificaSenha) {
                alert("Senha não coincide")
                return
            }

            const { error, data } = await supabase.from("usuarios").insert([obj]).select()

            if (error == null && data && data.length > 0) {
                const userSalvo = Array.isArray(data) ? data[0] : data;
                localStorage.setItem("usuario_logado", JSON.stringify(userSalvo));

                captarUser(data)
                alteraExibeUser(true)
                alteraExibeCadastro(false)
                window.location.href = "/"

                return
            }

            alert("Erro ao cadastrar funcionário. Entre em contato com o suporte técnico")
            console.log(error)
        }
    }

    async function captarUser(cadastro) {
        if (exibeCadastro == true && exibeUser == false) {
            const { data } = await supabase.from("usuarios").select("nome").eq("nome", nome)

            if (cadastro) {
                const userSalvo = Array.isArray(cadastro) ? cadastro[0] : cadastro;
                localStorage.setItem("usuario_logado", JSON.stringify(userSalvo));
                alert("Usuario cadastrado e logado")
                alteraUsuario(Array.isArray(cadastro) ? cadastro : [cadastro])
              
                alteraExibeUser(true);

                return
            }

            if (data && data.length > 0) {
                alert("Este nome de usuário já existe no banco de dados!")
                return true
            }

            return false
        }

        if (exibeCadastro == false && exibeUser == false) {
            const coluna = nome !== "" ? "nome" : "email";
            const valor = nome !== "" ? nome : email;

            const { data } = await supabase
                .from("usuarios")
                .select("*")
                .eq(coluna, valor)
                .eq("senha", senha);

            if (data && data.length > 0) {
                if (cadastro) {
                    const userSalvo = Array.isArray(data) ? data[0] : data;
                    localStorage.setItem("usuario_logado", JSON.stringify(userSalvo));
                    alteraUsuario(data)
                    alert("Usuario logado")
                    window.location.href = "/"

                    alteraExibeUser(true)
                    alteraExibeCadastro(true)

                    return
                }

                return true
            }

            alert("Este usuário não existe !")
            return false
        }
    }

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuario_logado");
        if (usuarioSalvo) {
            window.location.href = "/"
        }
    }, []);

    return (
        <div>
            {
                exibeCadastro == true ?
                    <div className="card">
                        {
                            exibeUser == true ?
                                usuario.map((i, idx) =>
                                    <div key={i.id || idx}>
                                        <tr>
                                            <td> {i.nome}</td>
                                            <td> {i.email}</td>
                                            <td> {i.senha}</td>
                                        </tr>
                                    </div>
                                ) : <></>
                        }

                        <div>
                            <h1>Cadastrar    Usuário</h1>

                            <span>
                                <input type="text" onChange={e => alteraNome(e.target.value)} placeholder="Nome de usuário" />
                                <input type="date" value={nascimento} onChange={e => alteraData(e.target.value)} />
                            </span>

                            <input type="email" onChange={e => alteraEmail(e.target.value)} placeholder="E-mail" />
                            <input type="password" onChange={e => alteraSenha(e.target.value)} placeholder="Senha" />
                            <input type="password" onChange={e => ConfereSenha(e.target.value)} placeholder="Confirmar senha" />
                            
                            <label style={{ display: 'block', color: '#fff', fontSize: '14px', marginTop: '10px' }}>Foto de perfil (opcional):</label>
                            <input type="file" accept="image/*" onChange={e => setArquivo(e.target.files[0])} style={{ padding: '8px', cursor: 'pointer', backgroundColor: '#fff', color: '#000' }} />
                        </div>

                        <span>
                            <a className="btn" onClick={inserirUser}>CONTINUAR</a>
                            <button className="btn" onClick={() => alteraExibeCadastro(false)}>Já tenho uma conta?</button>
                        </span>
                    </div>

                    :

                    <div className="card">
                        {
                            usuario.map((i, idx) =>
                                <tr key={i.id || idx}>
                                    <td> {i.nome}</td>
                                    <td> {i.email}</td>
                                    <td> {i.senha}</td>
                                </tr>
                            )
                        }
                        <div>
                            <h1>Entrar na conta </h1>

                            <input 
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val.includes("@")) {
                                        alteraEmail(val);
                                        alteraNome("");
                                    } else {
                                        alteraNome(val);
                                        alteraEmail("");
                                    }
                                }} 
                                placeholder="Nome de usuário ou E-mail" 
                                required 
                            />
                            <input type="password" onChange={e => alteraSenha(e.target.value)} placeholder="Confirmar senha" required />
                        </div>

                        <span>
                            <a className="btn" onClick={() => captarUser(true)} >Continuar</a>
                            <button className="btn" onClick={() => alteraExibeCadastro(true)} >Criar no usuário</button>
                        </span>
                    </div>
            }
        </div>
    );
}

export default Login_Cadastro;