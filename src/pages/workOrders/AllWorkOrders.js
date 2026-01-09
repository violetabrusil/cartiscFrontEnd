import React, { useCallback, useEffect, useState } from "react";
import { formatDate, formatPlate } from "../../utils/formatters";
import { CustomColorContainer } from "../../customColorContainer/CustomColorContainer";
import { useStatusColors } from "../../utils/useStatusColors";
import Icon from "../../components/Icons";
import apiClient from "../../services/apiClient";
import { workOrderStatus } from "../../constants/workOrderConstants";
import SearchBarFilter from "../../searchBar/SearchBarFilter";
import { useWorkOrderContext } from "../../contexts/searchContext/WorkOrderContext";
import CustomModal from "../../modal/customModal/CustomModal";
import { workOrderSearchOptions } from "../../constants/filterOptions";
import { PuffLoader } from "react-spinners";
import useCSSVar from "../../hooks/UseCSSVar";
import DataTable from "../../dataTable/DataTable";
import { usePageSizeForTabletLandscape } from "../../pagination/UsePageSize";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import { NewWorkOrder } from "./NewWorkOrder";

const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";

const AllWorkOrders = ({ viewMode, setViewMode, selectedWorkOrder, setSelectedWorkOrder, setShowTabs }) => {

    const tertiaryColor = useCSSVar('--tertiary-color');

    const navigate = useNavigate();

    const [allWorkOrders, setAllWorkOrders] = useState([]);
    const { selectedOption = 'Nombre Titular', setSelectedOption, searchTerm, setSearchTerm } = useWorkOrderContext();
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [refreshCount, setRefreshCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const responsivePageSize = usePageSizeForTabletLandscape(7, 5);

    const handleSearchWorOrderChange = (term, filter) => {
        setSearchTerm(term);
        setSelectedOption(filter);
    };

    const handleSearchWorkOrdersWithDebounce = debounce(handleSearchWorOrderChange, 500);

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

    const handleFilter = useCallback((option, term) => {
        setSelectedOption(option);
        setSearchTerm(term);
    }, []);

    const statusColors = useStatusColors();

    const columns = React.useMemo(
        () => [
            { Header: "Código", accessor: "work_order_code" },
            { Header: "Nombre de Titular", accessor: "client_name" },
            {
                Header: "Placa",
                accessor: "vehicle_plate",
                Cell: ({ row }) => {

                    const plateVehicle = formatPlate(row.original.vehicle_plate);

                    return (
                        <div className="plate-container" >
                            <div className="plate-display-work-order">
                                <div className="plate-ecuador-row">
                                    <img src={flagIcon} alt="flag" className="ecuador-flag" />
                                    <span className="ecuador-label-container">ECUADOR</span>
                                </div>
                                <div className="plate-value-container">{plateVehicle}</div>
                            </div>
                        </div >
                    )


                }
            },
            {
                Header: 'Estado',
                accessor: 'work_order_status',
                Cell: ({ value }) =>
                    <CustomColorContainer
                        color={statusColors}
                        value={value}
                    />
            },
            { Header: "KM", accessor: "km" },
            { Header: "Asignada", accessor: "assigned" },
            { Header: "Entregada", accessor: "delivered_by" },
            { Header: "Fecha Inicio", accessor: "date_start" },
            { Header: "Fecha Fin", accessor: "date_finish" },
            { Header: "Facturada", accessor: "is_billed" },
            { Header: "Actualizada", accessor: "updated_by" },
            {
                Header: "",
                Cell: ({ row }) => {
                    const workOrder = row.original;
                    return (
                        <button className="button-edit-work-order" onClick={(event) => handleEditWorkOrder(event, workOrder)}>
                            <Icon name="eye" className="edit-work-order-icon" />
                        </button>
                    );
                },
                id: 'edit-work-order-button'
            },
        ]
    );

    const hanldeShowAddWorkOrder = (event) => {
        event.stopPropagation();
        setViewMode('add');
    };

    const handleEditWorkOrder = (event, workOrder) => {
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        setViewMode('edit');
        setSelectedWorkOrder(workOrder);
    };

    const handleNewWorkOrder = () => {
        fetchData();
        setViewMode('general');
        setRefreshCount(refreshCount + 1);
    };

    const handleUpdateWorkOrder = () => {
        fetchData();
        setViewMode('general');
    };

    //Función que permite obtener todas las órdenes de 
    //trabajo, al iniciar la pantalla, para buscarlo por nombre 
    //de titular, placa, código de orden de trabajo, asignada a,
    //entregada por y creada por.

    const fetchData = async () => {

        setLoading(true);

        let endpoint = '/work-orders/all';

        if (searchTerm) {
            endpoint = '/work-orders/search';
            const searchFieldMapping = {
                'Placa': 'vehicle_plate',
                'Código Orden de Trabajo': 'work_order_code',
                'Nombre Titular': 'client_name',
                'Asignada a': 'assigned',
                'Entregada por': 'delivered_by',
                'Creada por': 'created_by',
            };

            const searchField = searchFieldMapping[selectedOption];

            if (!searchField) {
                return;
            }

            const payload = {
                [searchField]: searchTerm,
            };

            try {
                const response = await apiClient.post(endpoint, payload);

                const transformedWorkOrders = response.data.map(workOrder => {
                    const newDateStart = formatDate(workOrder.date_start);
                    const newDateEnd = formatDate(workOrder.date_finish);
                    const translatedStatus = workOrderStatus[workOrder.work_order_status] || workOrder.work_order_status;
                    const formattedPlate = formatPlate(workOrder.vehicle_plate);
                    return {
                        ...workOrder,
                        date_start: newDateStart,
                        date_finish: newDateEnd,
                        work_order_status: translatedStatus,
                        vehicle_plate: formattedPlate,
                        is_billed: workOrder.is_billed,
                    };
                });

                setAllWorkOrders(transformedWorkOrders);
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
                const response = await apiClient.get(endpoint);

                const transformedWorkOrders = response.data.map(workOrder => {
                    const newDateStart = formatDate(workOrder.date_start);
                    const newDateEnd = formatDate(workOrder.date_finish);
                    const translatedStatus = workOrderStatus[workOrder.work_order_status] || workOrder.work_order_status;
                    const formattedPlate = formatPlate(workOrder.vehicle_plate);
                    return {
                        ...workOrder,
                        date_start: newDateStart,
                        date_finish: newDateEnd,
                        work_order_status: translatedStatus,
                        vehicle_plate: formattedPlate,
                        is_billed: workOrder.is_billed,
                    };
                });

                setAllWorkOrders(transformedWorkOrders);
                setLoading(false);
                console.log("all work orders", transformedWorkOrders)

            } catch (error) { }
        }
    };

    const handleAddNewWorkOrder = () => {
        navigate("/workOrders/newWorkOrder");
    };

    useEffect(() => {
        fetchData();
    }, [selectedOption, searchTerm, refreshCount]);

    useEffect(() => {
        if (setShowTabs) {
            setShowTabs(viewMode === 'general');
        }
    }, [viewMode]);

    return (
        <div className="container-general-information">
            {viewMode === 'general' && (
                <>
                    <div className="container-information-title">

                        <div className="left-title-box">
                            <SearchBarFilter
                                selectedOption={selectedOption}
                                onSearchChange={handleSearchWorkOrdersWithDebounce}
                                onButtonClick={openFilterModal}
                                shouldSaveSearch={true}

                            />

                        </div>
                        <div className="right-tittle-box">
                            <button className="new-work-order-btn" onClick={hanldeShowAddWorkOrder}>
                                <Icon name="add" className="new-work-order-icon" />
                                Agregar Nueva Órden de Trabajo
                            </button>

                        </div>

                    </div>
                    <div className="second-container-information">
                        {loading ? (
                            <div className="spinner-container-general">
                                <PuffLoader color={tertiaryColor} loading={loading} size={60} />
                            </div>
                        ) : (
                            <div className="container-table-general">
                                <DataTable
                                    data={allWorkOrders}
                                    columns={columns}
                                    highlightRows={false}
                                    initialPageSize={responsivePageSize}
                                />
                            </div>
                        )}

                    </div>



                </>
            )}

            {viewMode === 'add' && (
                <NewWorkOrder
                    onBack={() => setViewMode('general')}
                    onSubmit={handleNewWorkOrder}
                />
            )}

            {/*Modal del filtro de búsqueda*/}

            {isFilterModalOpen && (
                <CustomModal
                    isOpen={isFilterModalOpen}
                    onCancel={closeFilterModal}
                    type="filter-options"
                    subTitle="Seleccione el filtro de búsqueda"
                    onSelect={handleSelectClick}
                    defaultOption={selectedOption}
                    options={workOrderSearchOptions}
                    showCloseButton={false}
                />

            )}

        </div>

    )

};

export default AllWorkOrders;