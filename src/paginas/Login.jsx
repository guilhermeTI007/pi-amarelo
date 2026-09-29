import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "./Login_cadastro.css";

function Login() {
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    
    // Simplification for prototype: check if user exists with the given name
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('nome', nome)
      .limit(1);

    if (error) {
      setErro("Erro ao buscar usuário: " + error.message);
      return;
    }

    if (data && data.length > 0) {
      // Simulate login by storing in localStorage
      localStorage.setItem('usuario_logado', JSON.stringify(data[0]));
      navigate("/");
    } else {
      setErro("Usuário não encontrado.");
    }
  };

  return (
    <div>
      <div className="card">
        <form onSubmit={handleLogin}>
          <div>
            <h1>Entrar na conta</h1>
            <input 
              type="text" 
              placeholder="Nome de usuário" 
              required 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Senha (qualquer para este protótipo)" 
              required 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          {erro && <p style={{ color: 'red' }}>{erro}</p>}
          <span>
            <button className="btn" type="submit">Continuar</button>
            <button className="btn" type="button" onClick={() => navigate('/cadastro')}>Criar um usuário</button>
          </span>
        </form>
      </div>
    </div>
  );
}

export default Login;