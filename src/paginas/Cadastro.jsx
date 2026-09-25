import "./Login_cadastro.css"

function Cadastro() {
  return ( 
    <div>
  


    <div class="card">

        <form>

            <div>

                <h1>Cadastrar    Usuário</h1>

                <span >

                    <input  type="text" onChange={e => alteraName(e.target.value)} placeholder="Nome de usuário" required/>
                    <input type="date" onChange={e => alteraName(e.target.value)} required/>
                </span>

                <input type="email"  onChange={e => alteraName(e.target.value)} placeholder="E-mail" required/>
                <input type="password" onChange={e => alteraName(e.target.value)} placeholder="Senha" required/>
                <input type="password" onChange={e => alteraName(e.target.value)} placeholder="Confirmar senha" required/>

            </div>

            <span>

                <button className="btn" onClick={inserirUser}>CONTINUAR</button>
                <button className="btn" onClick={()=> alteraExibeCadastro(false)}>Já tenho uma conta?</button>

            </span>

        </form>

    </div>


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

export default Cadastro;