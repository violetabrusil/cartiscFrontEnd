import 'normalize.css';
import './App.css';
import './Clients.css';
import './Form.css';
import './Header.css';
import './Home.css';
import './Menu.css';
import './Modal.css';
import './NewClient.css';

import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import LoginExpress from './pages/LoginExpress';
import Home from './pages/Home';
import Clients from './pages/clients/Clients';
import NewClient from './pages/clients/NewClient';
import Cars from './pages/cars/Car';
import Services from './pages/services/Service';
import Operation from './pages/operations/Operation';
import Inventory from './pages/inventory/Inventory';
import WorkOrders from './pages/workOrders/WorkOrders';
import NewWorkOrder from './pages/workOrders/NewWorkOrder';
import PaymentReceipts from './pages/paymenyReceipts/PaymentReceipts';
import Suppliers from './pages/supplier/Supplier';
import Settings from './pages/settings/Settings';
import React, { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';

function App() {
  const { isLoading } = useContext(AuthContext);

    if (isLoading) {
        return <div>Loading...</div>;  // Puedes reemplazar esto con un spinner o un componente de pantalla de carga.
    }

  return (
  
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/loginExpress" element={<LoginExpress />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/home" element={<Home />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/newClient" element={<NewClient />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/operations" element={<Operation />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/workOrders" element={<WorkOrders />} />
            <Route path="/workOrders/newWorkOrder" element={<NewWorkOrder />} />
            <Route path="/paymentReceipt" element={<PaymentReceipts />} />
          </Routes>
        </div>

      </Router>



  );
}

export default App;
