import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./Login_cadastro.css";

function Login_Cadastro() {

    const [usuario, alteraUsuario] = useState([])

    const [exibeUser, alteraExibeUser] = useState(false)
    const [exibeCadastro, alteraExibeCadastro] = useState(true)

    const [nome, alteraNome] = useState("")
    const [nascimento, alteraData] = useState("")

    const [email, alteraEmail] = useState("")
    const [senha, alteraSenha] = useState("")

    const [verificaSenha, ConfereSenha] = useState("")

    async function inserirUser() {
        if (!nome || !email || !senha) {
            alert("Preencha todos os campos obrigatórios");
            return;
        }

        const obj = {
            nome: nome,
            email: email,
            senha: !isNaN(Number(senha)) && senha !== "" ? Number(senha) : 123456,
            foto: "https://placehold.co/120x120/FFF/000?text=" + (nome ? encodeURIComponent(nome.charAt(0).toUpperCase()) : "U"),
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