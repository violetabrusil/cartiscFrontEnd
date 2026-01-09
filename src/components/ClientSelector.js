import "../components/ClientSelector.css"
import React, { useState, useEffect } from "react";
import SearchBarFilter from "../searchBar/SearchBarFilter";
import apiClient from "../services/apiClient";
import { debounce } from "lodash";
import { showToastOnce } from "../utils/toastUtils";
import TitleAndSearchBox from "../titleAndSearchBox/TitleAndSearchBox";
import Modal from "../modal/Modal";
import { AddNewClientModal } from "../modal/AddClientModal";
import Icon from "./Icons";
import ScrollListWithIndicators from "./ScrollListWithIndicators";
import ResultItem from "../resultItem/ResultItem";

const arrowLeftIcon = process.env.PUBLIC_URL + "/images/icons/arrowLeftIcon.png";

export default function ClientSelector({
    selectedClient,
    setSelectedClient,
    setVehicles,
    onClientSelect,
    setShouldUpdateClients,

}) {

    const [clients, setClients] = useState([]);
    const [selectedOption, setSelectedOption] = useState('Nombre');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

    const handleDeselectClient = () => {
        setSelectedClient();
        setSearchTerm('');
        setVehicles([]);
    };

    const handleSearchClientChange = (term, filter) => {
        setSearchTerm(term);
        setSelectedOption(filter);
    };

    const handleSearchClientWithDebounce = debounce(handleSearchClientChange, 500);

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const openAddClientModal = () => {
        setIsAddClientModalOpen(true);
    };

    const closeAddClientModal = () => {
        setIsAddClientModalOpen(false);
        setShouldUpdateClients(true);
    };

    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const handleSelectClick = (option) => {
        setSelectedOption(option);
        closeFilterModal();
    };

    const getClient = async () => {

        let endpoint = '/clients/all';

        if (searchTerm) {
            switch (selectedOption) {
                case 'Cédula':
                    endpoint = `/clients/search-by-cedula/${searchTerm}`;
                    break;
                case 'Nombre':
                    endpoint = `/clients/search-by-name/${searchTerm}`;
                    break;
                default:
                    break;
            }
        }
        try {
            const response = await apiClient.get(endpoint);
            setClients(response.data);

        } catch (error) {
            showToastOnce("error", "Error al obtener los datos de los clientes");
        }
    };

    useEffect(() => {
        getClient();
    }, [searchTerm, selectedOption])

    return (
        <>
            {selectedClient ? (
                <div className="client-details-container">
                    <div className="client-header">
                        <button onClick={handleDeselectClient} className="client-back-button">
                            <Icon name="leftArrow" className="client-back-icon"/>
                        </button>
                        <h2 className="client-title">Cliente</h2>
                    </div>
                    <div className="client-card-body">
                        <div className="client-card-field">
                            <div className="client-field-label">
                                <Icon name="text" className="client-card-icon" />
                                <span>Nombre</span>
                            </div>
                            <span className="client-card-value">{selectedClient.name}</span>
                        </div>

                        <div className="client-card-field">
                            <div className="client-field-label">
                                <Icon name="id" className="client-card-icon" />
                                <span>Cédula</span>
                            </div>
                            <span className="client-card-value">{selectedClient.cedula}</span>
                        </div>

                        <div className="client-card-field">
                            <div className="client-field-label">
                                <Icon name="address" className="client-card-icon" />
                                <span>Dirección</span>
                            </div>
                            <span className="client-card-value">{selectedClient.address}</span>
                        </div>

                        <div className="client-card-field">
                            <div className="client-field-label">
                                <Icon name="phone" className="client-card-icon" />
                                <span>Teléfono</span>
                            </div>
                            <span className="client-card-value">{selectedClient.phone}</span>
                        </div>

                        <div className="client-card-field">
                            <div className="client-field-label">
                                <Icon name="email" className="client-card-icon" />
                                <span>Correo Electrónico</span>
                            </div>
                            <span className="client-card-value">{selectedClient.email}</span>
                        </div>
                    </div>
                </div>

            ) : (
                <>
                    <div className="header-container-search">

                        <button className="new-work-order-btn" onClick={openAddClientModal}>
                            <Icon name="add" className="new-work-order-icon" />
                            Agregar Cliente
                        </button>

                        <SearchBarFilter
                            className="full-width"
                            selectedOption={selectedOption}
                            onSearchChange={handleSearchClientWithDebounce}
                            onButtonClick={openFilterModal}
                        />

                    </div>
                    <div className="container-search">

                        <ScrollListWithIndicators
                            items={clients}
                            renderItem={(client) => (
                                <ResultItem
                                    key={client.id}
                                    type="client"
                                    data={client}
                                    onClickMain={e => onClientSelect(client.client, e)}
                                    showEye={false}
                                />
                            )}

                        />

                    </div>

                </>
            )}

            {/*Modal del filtro de búsqueda*/}

            {isFilterModalOpen && (
                <Modal
                    isOpen={isFilterModalOpen}
                    onClose={closeFilterModal}
                    options={['Cédula', 'Nombre']}
                    defaultOption="Nombre"
                    onOptionChange={handleOptionChange}
                    onSelect={handleSelectClick}
                />
            )}

            {/*Modal para agregar nuevo cliente*/}

            {isAddClientModalOpen && (
                <AddNewClientModal
                    isOpen={isAddClientModalOpen}
                    onClose={closeAddClientModal}
                    OnUpdate={() => setShouldUpdateClients(true)}
                />
            )}
        </>


    );

};