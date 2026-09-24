import "./Login_cadastro.css"

function Cadastro() {
  return ( 
    <div>
  


    <div class="card">

        <form>

            <div>

                <h1>Cadastrar    Usuário</h1>

                <span >

                    <input  type="text" placeholder="Nome de usuário ou E-mail" required/>
                    <input type="date" required/>
                </span>

                <input type="email" placeholder="E-mail" required/>
                <input type="password" placeholder="Senha" required/>
                <input type="password" placeholder="Confirmar senha" required/>

            </div>

            <span>

                <button class="btn">CONTINUAR</button>
                <button class="btn">Já tenho uma conta?</button>

            </span>

        </form>

    </div>




    </div>
   );
}

export default Cadastro;