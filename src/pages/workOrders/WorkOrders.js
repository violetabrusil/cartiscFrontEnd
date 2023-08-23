import "../../WorkOrders.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import { CustomButtonContainer, CustomButton } from "../../customButton/CustomButton";

const searchIcon = process.env.PUBLIC_URL + "/images/icons/searchIcon.png";

const WorkOrders = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearchClientChange = (newSearchTerm) => {
        setSearchTerm(newSearchTerm);
        // Aquí puedes hacer cualquier otra lógica que necesites cuando cambie el término de búsqueda
    };

    const handleAddNewWorkOrder = () => {
        // Redirige a la página deseada
        navigate("/workOrders/newWorkOrder");
    };


    return (

        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <div className="work-order-container">
                <div className="left-section">

                    <div className="work-orders-container-title">
                        <h2>Órdenes de Trabajo</h2>
                    </div>

                    <div className="search-box-work-orders">
                        <img src={searchIcon} alt="Search Icon" className="search-work-orders-icon" />
                        <input
                            type="text"
                            className="input-search-work-orders"
                            onChange={handleSearchClientChange}
                        />
                    </div>
                </div>
                <div className="right-section">
                    <CustomButtonContainer>
                        <CustomButton title="AGREGAR ÓRDEN DE TRABAJO" onClick={handleAddNewWorkOrder} />
                    </CustomButtonContainer>
                </div>
            </div>





        </div>

    );

};

export default WorkOrders;