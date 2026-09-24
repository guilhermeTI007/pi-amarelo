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
        <Route path="/" element={<Perfil/>}/>
       
        </Routes>
      </BrowserRouter>


    </div>
   );
}

export default App;