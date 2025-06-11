import "../../Proforma.css";
import "../../Loader.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { ToastContainer } from "react-toastify";
import { PuffLoader } from "react-spinners";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import Modal from "../../modal/Modal";
import apiClient from "../../services/apiClient";
import TitleAndSearchBoxSpecial from "../../titleAndSearchBox/TitleAndSearchBoxSpecial";
import { proformaStatus } from "../../constants/proformaConstants";
import { CustomButton, CustomButtonContainer } from "../../buttons/customButton/CustomButton";
import { useProformaContext } from "../../contexts/searchContext/ProformaContext";
import { useStatusColors } from "../../utils/useStatusColors";

const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";

const Proforma = () => {

    const statusColors = useStatusColors();

    const { selectedOption, setSelectedOption, searcTerm, setSearchTerm } = useProformaContext();
    const [proformas, setProformas] = useState();
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleSearchProformaChange = (term, filer) => {
        setSearchTerm(term);
        setSelectedOption(filer);
    };

    const handleSearchProformaWithDebounce = debounce(handleSearchProformaChange, 500);

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const handleSelectClick = (option) => {
        setSelectedOption(option);
        closeFilterModal();
    };

    function formatDate(isoDate) {
        const date = new Date(isoDate);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();

        return `${day}/${month}/${year}`;
    };

    const formatPlate = (plateInput) => {
        const regex = /^([A-Z]{3})(\d{3,4})$/;

        if (regex.test(plateInput)) {
            return plateInput.replace(
                regex,
                (match, p1, p2) => {
                    return p1 + "-" + p2;
                }
            );
        }
        return plateInput;
    };

    const handleAddNewProforma = () => {
        navigate('/proforma/newProforma');
    };

    const handleShowInformationProforma = (proformaId) => {
        navigate(`/proforma/detailProforma/${proformaId}`)
    };

    useEffect(() => {

        const fetchData = async () => {
            let endpoint = 'proformas/all';

            if (searcTerm) {
                endpoint = '/proformas/search';

                const searchFieldMapping = {
                    'Placa': 'vehicle_plate',
                    'Código Proforma': 'proforma_code',
                    'Nombre Titular': 'client_name',
                    'Creada por': 'created_by'
                };

                const searchField = searchFieldMapping(selectedOption);

                if (!searchField) {
                    console.error('Campo de búsqueda no válido', selectedOption);
                    return;
                }

                const payload = {
                    [searchField]: searcTerm,
                };

                try {
                    const response = await apiClient.post(endpoint, payload);

                    const transformedProformas = response.data.map(proforma => {
                        const newDateStart = formatDate(proforma.date);
                        const translatedStatus = proformaStatus(proforma.pro_forma_status);
                        const formattedPlate = formatPlate(proforma.vehicle_plate);
                        return {
                            ...proforma,
                            date: newDateStart,
                            pro_forma_status: translatedStatus,
                            vehicle_plate: formattedPlate,
                        };
                    });

                    setProformas(transformedProformas);
                    setLoading(false);

                } catch (error) {


                    if (error.code === 'ECONNABORTED') {
                        console.error('La solicitud ha superado el tiempo límite.');
                    } else {
                        console.error('Se superó el tiempo límite inténtelo nuevamente.', error.message);
                    }
                    console.log("error obtener ordenes de trabajo", error)
                }
            } else {
                try {
                    const response = await apiClient.post(endpoint);

                    const transformedProformas = response.data.map(proforma => {
                        const newDateStart = formatDate(proforma.date);
                        const translatedStatus = proformaStatus(proforma.pro_forma_status);
                        const formattedPlate = formatPlate(proforma.vehicle_plate);
                        return {
                            ...proforma,
                            date: newDateStart,
                            pro_forma_status: translatedStatus,
                            vehicle_plate: formattedPlate,
                        };
                    });

                    setProformas(transformedProformas);
                    setLoading(false);

                } catch (error) {


                    if (error.code === 'ECONNABORTED') {
                        console.error('La solicitud ha superado el tiempo límite.');
                    } else {
                        console.error('Se superó el tiempo límite inténtelo nuevamente.', error.message);
                    }
                    console.log("error obtener ordenes de trabajo", error)
                }
            }
        };
        fetchData();
    }, [searcTerm, selectedOption]);

    return (
        <>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <ToastContainer />

            <div className="two-column-layout">

                <div className="left-panel">

                    <TitleAndSearchBoxSpecial
                        selectedOption={selectedOption}
                        title="Proformas"
                        onSearchChange={handleSearchProformaWithDebounce}
                        onButtonClick={openFilterModal}
                        shouldSaveSearch={true}
                    />


                    <>
                        <div className="scrollable-list-container">
                            {/*Falta map*/}
                            <div className="result-proforma" onClick={() => handleShowInformationProforma()}>

                                <div className="first-result-proforma">
                                    <div className="div-label-proforma">
                                        <label>
                                            PRO-000001
                                        </label>
                                    </div>
                                    <div className="div-label-proforma-client">
                                        <label>
                                            PEACH TACO
                                        </label>
                                    </div>

                                </div>

                                <div className="second-result-proforma">
                                    <div className="input-plate-container-proforma">
                                        <input
                                            className="input-plate-vehicle-proforma"
                                            type="text"
                                            value="PJL-568"
                                            readOnly
                                        />
                                        <img src={flagIcon} alt="Flag" className="ecuador-icon" />
                                        <label>ECUADOR</label>
                                    </div>

                                </div>

                                <div className="thrid-result-proforma">
                                    <div className="label-status-proforma">
                                        <label>
                                            Pendiente
                                        </label>
                                    </div>
                                    <div className="label-date-proforma">
                                        <label>20/10/2010</label>
                                    </div>

                                </div>


                            </div>

                        </div>
                    </>


                </div>

                <div className="right-panel">
                    {/*
                    <CustomButtonContainer>
                        <CustomButton title="AGREGAR PROFORMA" onClick={handleAddNewProforma} />
                    </CustomButtonContainer>
*/}
                </div>

            </div>

            {isFilterModalOpen && (
                <Modal
                    isOpen={isFilterModalOpen}
                    onClose={closeFilterModal}
                    options={['Placa', 'Código Proforma', 'Nombre Titular', 'Creada por']}
                    defaultOption={selectedOption}
                    onOptionChange={handleOptionChange}
                    onSelect={handleSelectClick}
                />
            )}
        </>

    )
};

export default Proforma;