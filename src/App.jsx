import Telainicial from "./paginas/Telainicial";
import Batalha  from "./paginas/Batalha";
import Universos from "./paginas/Universos";
import Perfil from "./paginas/Perfil";
import Planos from "./components/Planos";
import Login_Cadastro from "./paginas/Login_Cadastro";
import {BrowserRouter,  Route, Routes} from "react-router-dom"




function App() {
  return ( 
    <div>
      
        {/* <Perfil/> */}
        {/* <Login/> */}
        {/* <Cadastro/> */}
        {/* <Universos/> */}
      
 <BrowserRouter>
        <Routes>
        <Route path="/" element={<Telainicial/>}/>
        <Route path="/Perfil" element={<Perfil/>}/>
        <Route path="/Planos" element={<Planos/>}/>
        <Route path="/Batalha" element={<Batalha/>}/>
        <Route path="/Login_Cadastro" element={<Login_Cadastro/>}/>
        <Route path="/Universos" element={<Universos/>}/>
      
       
        </Routes>
      </BrowserRouter>


    </div>
   );
}

export default App;