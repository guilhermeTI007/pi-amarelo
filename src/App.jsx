import Batalha from "./Batalha2";
import Cadastro from "./paginas/Cadastro";
import Login from "./paginas/Login";
import Perfil from "./paginas/Perfil"
import Universos from "./paginas/Universos";
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
        <Route path="/" element={<Pagina/>}/>
        <Route path="/" element={<Perfil/>}/>
        <Route path="/" element={<Batalha/>}/>
        <Route path="/" element={<login_Cadastro/>}/>
        <Route path="/" element={<Universos/>}/>
       
        </Routes>
      </BrowserRouter>


    </div>
   );
}

export default App;