import { useEffect, useState } from "react";
import "./Login_cadastro.css"
import Perfil from "./Perfil"
function Login_Cadastro() {

    const [usuario, alteraUsuario] = useState([])

    const [exibeUser, alteraExibeUser] = useState(false)

    const [exibeCadastro, alteraExibeCadastro] = useState(true)


    const [nome, alteraNome] = useState("")
    const [data, alteraData] = useState("")
    const [email, alteraEmail] = useState("")
    const [senha, alteraSenha] = useState(0)

    const [verificaSenha, ConfereSenha] = useState(senha)

    async function inserirUser() {
        const obj = {
            nome: nome,
            data: data,
            email: email,
            senha: senha
        }

        const { error } = await supabase.from("usuarios").insert(obj)

        if (error == null) {


            alteraExibeCadastro(false)
            captarUser()
            alert("Funcionário cadastrado")

        } else {

            alert("Erro ao cadastrar funcionário. Entre em contato com o suporte técnico")
            console.log(error)
        }




    }

    async function captarUser() {

        const { error, data } = await supabase.from("usuarios").select(`*`)

        // console.log(data)
        alteraUsuario(data)
    }

    useEffect(() => {

        captarUser()
    }, [])

    return (
        <div>


            {
                exibeCadastro == true ?
                    <div className="card">


                        {
                            exibeUser == false ?



                                <>

                                    <div>

                                        <h1>Cadastrar    Usuário</h1>

                                        <span >

                                            <input type="text" onChange={e => alteraNome(e.target.value)} placeholder="Nome de usuário" />
                                            <input type="date" onChange={e => alteraData(e.target.value)} />
                                        </span>

                                        <input type="email" onChange={e => alteraEmail(e.target.value)} placeholder="E-mail" />
                                        <input type="password" onChange={e => alteraSenha(e.target.value)} placeholder="Senha" />
                                        <input type="password" onChange={e => ConfereSenha(e.target.value)} placeholder="Confirmar senha" />


                                    </div>



                                    <span>

                                        <a className="btn" href="/Perfil">CONTINUAR</a>
                                        {/* <button className="btn" onClick={() => alteraExibeUser(true)}>CONTINUAR</button> */}
                                        <button className="btn" onClick={() => alteraExibeCadastro(false)}>Já tenho uma conta?</button>

                                    </span>
                                </>

                                :
                                <Perfil />
                        }



                    </div>

                    :


                    <div class="card">


                        <div>

                            <h1>Entrar na conta</h1>

                            <input type="text" placeholder="Nome de usuário ou E-mail" required />
                            <input type="password" placeholder="Confirmar senha" required />

                        </div>

                        <span>

                            <button class="btn" onClick={buscarUser}>Continuar</button>
                            <button class="btn" onClick={() => alteraExibeCadastro(true)} >Criar no usuário</button>

                        </span>


                    </div>


            }






        </div>
    );
}

export default Login_Cadastro;