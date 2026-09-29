import { BrowserRouter, Route, Routes } from 'react-router-dom';

import NavBar from './components/NavBar';
import TelaInicial from './paginas/TelaInicial';
import Personagens from './paginas/Personagens';
import NovaBatalha from './paginas/NovaBatalha';
import Batalhas from './paginas/Batalhas';
import Perfil from './paginas/Perfil';
import Login_Cadastro from './paginas/Login_Cadastro';

function Layout({ children }) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Página inicial */}
          <Route path="/" element={<TelaInicial />} />
          <Route path="/TelaInicial" element={<TelaInicial />} />

          {/* Personagens */}
          <Route path="/personagens" element={<Personagens />} />

          {/* Cadastrar nova luta */}
          <Route path="/nova-batalha" element={<NovaBatalha />} />

          {/* Batalhas com votação e comentários */}
          <Route path="/batalhas" element={<Batalhas />} />
          <Route path="/batalha" element={<Batalhas />} />

          {/* Login e Cadastro */}
          <Route path="/login" element={<Login_Cadastro />} />
          <Route path="/cadastro" element={<Login_Cadastro />} />

          {/* Perfil com histórico */}
          <Route path="/perfil" element={<Perfil />} />

          {/* Rota padrão para páginas não encontradas */}
          <Route path="*" element={<TelaInicial />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;