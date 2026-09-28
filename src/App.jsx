import Telainicial from "./paginas/Telainicial";
import Batalha  from "./paginas/Batalha";
import Universos from "./paginas/Universos";
import Perfil from "./paginas/Perfil";
import Planos from "./components/Planos";
import Login_Cadastro from "./paginas/Login_Cadastro";
import {BrowserRouter,  Route, Routes} from "react-router-dom"


import { BrowserRouter, Route, Routes } from 'react-router-dom';

import NavBar from './components/NavBar';
import TelaInicial from './paginas/TelaInicial';
import Personagens from './paginas/Personagens';
import NovaBatalha from './paginas/NovaBatalha';
import Batalhas from './paginas/Batalhas';
import Perfil from './paginas/Perfil';
import Login from './paginas/Login';
import Cadastro from './paginas/Cadastro';
import Universos from './paginas/Universos';

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
        <Route path="/" element={<Telainicial/>}/>
        <Route path="/Perfil" element={<Perfil/>}/>
        <Route path="/Planos" element={<Planos/>}/>
        <Route path="/Batalha" element={<Batalha/>}/>
        <Route path="/Login_Cadastro" element={<Login_Cadastro/>}/>
        <Route path="/Universos" element={<Universos/>}/>
      
       
        </Routes>
      </BrowserRouter>
          {/* Página inicial */}
          <Route path="/" element={<TelaInicial />} />

          {/* Guilherme: Personagens */}
          <Route path="/personagens" element={<Personagens />} />

          {/* Guilherme: Cadastrar nova luta */}
          <Route path="/nova-batalha" element={<NovaBatalha />} />

          {/* Alex: Batalhas com comentários do banco */}
          <Route path="/batalhas" element={<Batalhas />} />

          {/* Gustavo: Login e Cadastro */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Gustavo + Alex: Perfil */}
          <Route path="/perfil" element={<Perfil />} />

          {/* Universos */}
          <Route path="/universos" element={<Universos />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;