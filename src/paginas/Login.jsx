import "./Login_cadastro.css"

function Login() {
  return ( 
    <div>
    


    <div class="card">

        <form>
            <div>

                <h1>Entrar na conta</h1>

                <input type="text" placeholder="Nome de usuário ou E-mail" required/>
                <input type="password" placeholder="Confirmar senha" required/>

            </div>

            <span>

                <button class="btn">Continuar</button>
                <button class="btn">Criar no usuário</button>

            </span>
        </form>

    </div>


    </div>
   );
}

export default Login;