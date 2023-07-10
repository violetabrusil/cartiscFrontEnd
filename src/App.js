import 'normalize.css';
import './App.css';
import './Clients.css';
import './Form.css';
import './Header.css';
import './Home.css';
import './Menu.css';
import './Modal.css';
import './NewClient.css';


import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import LoginExpress from './pages/LoginExpress';
import Home from './pages/Home';
import Clients from './pages/clients/Clients';
import NewClient from './pages/clients/NewClient';
import Cars from './pages/cars/Car';

function App() {
  return (
    <Router>
      <div>
        <Routes>

          <Route path="/login" element={<Login />} />
          <Route path="/loginExpress" element={<LoginExpress />} />
          <Route path="/home" element={<Home />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/newClient" element={<NewClient />} />
          <Route path="/cars" element={<Cars />} />
        </Routes>
      </div>

    </Router>

  );
}

export default App;
