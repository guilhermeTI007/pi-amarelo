import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./Login_cadastro.css"
import { data } from "react-router-dom";

function Login_Cadastro() {

    const [usuario, alteraUsuario] = useState([])

    const [exibeUser, alteraExibeUser] = useState(false)
    const [exibeCadastro, alteraExibeCadastro] = useState(true)


    const [nome, alteraNome] = useState("")

    const [email, alteraEmail] = useState("")
    const [senha, alteraSenha] = useState("")

    const [verificaSenha, ConfereSenha] = useState("")


    async function inserirUser() {
        const obj = {
            nome: nome,
            email: email,
            senha: senha
        }





        // 2. Se a função captarUser retornar que existe, o return impede de chegar no insert abaixo


        if (exibeCadastro == true) {

            if (await captarUser()) {
                return
            }
            if (senha != verificaSenha) {

                alert("Senha não coincide")
                return
            }

            const { error, data } = await supabase.from("usuarios").insert(obj).select()



            if (error == null) {

                captarUser(data)
                alteraExibeCadastro(false)






                return

            }


            alert("Erro ao cadastrar funcionário. Entre em contato com o suporte técnico")
            console.log(error)




        }







    }

    async function captarUser(cadastro) {


        // se exibeCadastro for true é cadastro de usuario
        if (exibeCadastro == true) {
            const { data } = await supabase.from("usuarios").select("nome").eq("nome", nome)
            // senha digitada tem que ser igual senha de conferencia digitada


            // cadastro é o parametro para identificar se recebe parâmetro data no inserirUser, se captarUser(data) recebe parâmetro, ele altera usuario 
            if (cadastro) {

                alteraUsuario(cadastro)
                alert("Usuario cadastrado e logado")
                return
            }

            // se captarUser não recebe parâmetro eele confere o nome dentro de data e se for igual ele devolve menssagem de alerta e devolve para função captarUser(true)

            if (data && data.length > 0) {
                alert("Este nome de usuário já existe no banco de dados!")

                return true
            }

            // se nome dentro de data for diferente retorna false para função captarUser(false)

            return false

        }

        if (exibeCadastro == false) {

            // senha digitada tem que ser igual senha de conferencia digitada

            if(email != ""){

                 const { data } = await supabase.from("usuarios").select("email,senha").eq("email", email).eq("senha", senha)


                       if (data && data.length > 0) {



                if (data) {

                    alteraUsuario(data)
                    alteraExibeUser(true)
                    alteraExibeCadastro(true)
                    alert("Usuario logado")
                    return
                }


                return true
            }


            alert("Este usuário não existe !")

            // se nome dentro de data for diferente retorna false para função captarUser(false)

            return false
            }
         

                 const { data } = await supabase.from("usuarios").select("nome,senha").eq("nome", nome).eq("senha", senha)

          

            // cadastro é o parametro para identificar se recebe parâmetro data no inserirUser, se captarUser(data) recebe parâmetro, ele altera usuario 


            // se captarUser não recebe parâmetro eele confere o nome dentro de data e se for igual ele devolve menssagem de alerta e devolve para função captarUser(true)

            if (data && data.length > 0) {



                if (data) {

                    alteraUsuario(data)
                    alteraExibeUser(true)
                    alteraExibeCadastro(true)
                    alert("Usuario logado")
                    return
                }


                return true
            }


            alert("Este usuário não existe !")

            // se nome dentro de data for diferente retorna false para função captarUser(false)

            return false

        }




    }



    return (
        <div>


            {
                exibeCadastro == true ?
                    <div className="card">



                        {
                            exibeUser == true ?
                                usuario.map(i =>

                                    <tr>

                                        <td> {i.nome}</td> 
                                        <td> {i.email}</td>
                                        <td> {i.senha}</td>
                                      

                                    </tr>

                                ) : <></>
                        }




                        <div>

                            <h1>Cadastrar    Usuário</h1>

                            <span >

                                <input type="text" onChange={e => alteraNome(e.target.value)} placeholder="Nome de usuário" />
                                <input type="date" />
                            </span>

                            <input type="email" onChange={e => alteraEmail(e.target.value)} placeholder="E-mail" />
                            <input type="password" onChange={e => alteraSenha(e.target.value)} placeholder="Senha" />
                            <input type="password" onChange={e => ConfereSenha(e.target.value)} placeholder="Confirmar senha" />


                        </div>



                        <span>

                            <a className="btn" onClick={inserirUser}>CONTINUAR</a>
                            {/* <button className="btn" onClick={() => alteraExibeUser(true)}>CONTINUAR</button> */}
                            <button className="btn" onClick={() => alteraExibeCadastro(false)}>Já tenho uma conta?</button>

                        </span>




                    </div>

                    :


                    <div className="card">




                        {

                            usuario.map(i =>

                                <tr>

                                    <td> {i.nome}</td>
                                    <td> {i.senha}</td>

                                </tr>

                            )
                        }
                        <div>

                            <h1>Entrar na conta </h1>

                            <input  onChange={ e=> e.target.value.includes("@")? alteraEmail(e.target.value):  alteraNome(e.target.value) } placeholder="Nome de usuário ou E-mail" required />
                            <input type="password" onChange={e => alteraSenha(e.target.value)} placeholder="Confirmar senha" required />

                        </div>

                        <span>

                            <a className="btn" onClick={() => captarUser(data)} >Continuar</a>
                            <button className="btn" onClick={() => alteraExibeCadastro(true)} >Criar no usuário</button>

                        </span>


                    </div>


            }






        </div>
    );
}

export default Login_Cadastro;