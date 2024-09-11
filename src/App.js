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
import PuffLoader from "react-spinners/PuffLoader";
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
import InformationWorkOrder from './pages/workOrders/InformationWorkOrder';
import ChangePassword from './pages/welcome/changePassword';
import ChangePIN from './pages/welcome/changePIN';
import ClientProvider from './provider/ClientProvider';
import { WorkOrderProvider } from './contexts/searchContext/WorkOrderContext';
import { PaymentReceiptProvider } from './contexts/searchContext/PaymentReceiptContext';
import Proforma from './pages/proforma/Proforma';
import { ProformaProvider } from './contexts/searchContext/ProformaContext';
import NewProforma from './pages/proforma/NewProforma';

function App() {

  const { isLoading } = useContext(AuthContext);

  const workOrdersInitialOption = 'Placa';
  const proformaInitialOption = 'Placa';

  if (isLoading) {
    return <div className="spinner-container-app">
      <PuffLoader color="#316EA8" loading={isLoading} size={60} />
    </div>;
  }

  return (

    <Router>
      <ClientProvider>
        <WorkOrderProvider initialSelectedOptionWorkOrder={workOrdersInitialOption} >
          <PaymentReceiptProvider>
            <ProformaProvider initialSelectedOptionProforma={workOrdersInitialOption}>
              <div>
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/changePassword" element={<ChangePassword />} />
                  <Route path="/changePIN" element={<ChangePIN />} />
                  <Route path="/loginExpress" element={<LoginExpress />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/clients/newClient" element={<NewClient />} />
                  <Route path="/cars" element={<Cars />} />
                  <Route path="/cars/carHistory/:vehicleId" element={<Cars />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/operations" element={<Operation />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/workOrders" element={<WorkOrders />} />
                  <Route path="/workOrders/newWorkOrder" element={<NewWorkOrder />} />
                  <Route path="/workOrders/detailWorkOrder/:workOrderId" element={<InformationWorkOrder />} />
                  <Route path="/paymentReceipt" element={<PaymentReceipts />} />
                  <Route path="/proformas" element={<Proforma />} />
                  <Route path='/proforma/newProforma' element={<NewProforma />}/>
                </Routes>
              </div>
            </ProformaProvider>
          </PaymentReceiptProvider>
        </WorkOrderProvider>
      </ClientProvider>

    </Router>



  );
}

export default App;
