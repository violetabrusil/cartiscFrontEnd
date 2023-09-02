import "../../Administration.css";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Select from 'react-select';
import DataTable from "../../dataTable/DataTable";
import apiClient from "../../services/apiClient";
import { userStatusMaping } from "../../constants/userStatusConstants";
import { vehicleCategory } from "../../constants/vehicleCategoryConstants";

const Administration = () => {

    const [selectedOption, setSelectedOption] = useState('');
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);

    const administrationSelectStyles = {
        control: (base, state) => ({
            ...base,
            width: '265px',
            height: '40px',
            minHeight: '40px',
            border: '1px solid rgb(0 0 0 / 34%)',
            borderRadius: '4px',
            padding: '1px',
            boxSizing: 'border-box'
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: '#999',
        }),
        option: (provided, state) => ({
            ...provided,
            className: 'custom-select-option-administration',
        }),
        menuPortal: base => ({ ...base, width: '15%', zIndex: 9999 }),

    };

    const administrationOptions = [
        { value: 'clients', label: 'Clientes' },
        { value: 'vehicles', label: 'Vehículos' },
        { value: 'operations', label: 'Operaciones' },
        { value: 'suppliers', label: 'Proveedores' },
        { value: 'products', label: 'Inventario' },
    ];

    const columnMappings = {
        clients: [
            { Header: "Cédula", accessor: "cedula" },
            { Header: "Nombre del cliente", accessor: "name" },
            { Header: "Email", accessor: "email" },
            {
                Header: "Estado",
                accessor: "client_status",
                Cell: ({ value }) => {
                    return (
                        <span style={{ color: value === "Suspendido" ? "red" : "black", fontWeight: '700' }}>
                            {value}
                        </span>
                    )
                }
            },
            {
                Header: "",
                Cell: ({ row }) => {
                    const client = row.original;
                    return (
                        <button className="button-active-admin" onClick={() => activateRecord('clients', client.id)} >
                            <span className="text-button-active">Activar</span>
                        </button>
                    );
                },
                id: 'button-active-admin'
            },
        ],
        vehicles: [
            { Header: 'Placa', accessor: 'plate' },
            { Header: 'Categoría', accessor: 'category' },
            { Header: 'Marca', accessor: 'brand' },
            { Header: 'Modelo', accessor: 'model' },
            {
                Header: 'Estado',
                accessor: 'vehicle_status',
                Cell: ({ value }) => {
                    return (
                        <span style={{ color: value === "Suspendido" ? "red" : "black", fontWeight: '700' }}>
                            {value}
                        </span>
                    )
                }
            },
            {
                Header: "",
                Cell: ({ row }) => {
                    const vehicle = row.original;
                    return (
                        <button className="button-active-admin" onClick={() => activateRecord('vehicles', vehicle.id)}  >
                            <span className="text-button-active">Activar</span>
                        </button>
                    );
                },
                id: 'button-active-admin'
            },
        ],
        operations: [
            { Header: 'Código', accessor: 'operation_code' },
            { Header: 'Título', accessor: 'title' },
            {
                Header: 'Costo',
                accessor: 'cost',
                Cell: ({ value }) => {
                    return (
                        <span>
                            $ {parseFloat(value).toFixed(2)}
                        </span>
                    )
                }
            },
            {
                Header: 'Estado',
                accessor: 'operation_status',
                Cell: ({ value }) => {
                    return (
                        <span style={{ color: value === "Suspendido" ? "red" : "black", fontWeight: '700' }}>
                            {value}
                        </span>
                    )
                }
            },
            {
                Header: "",
                Cell: ({ row }) => {
                    const operation = row.original;
                    return (
                        <button className="button-active-admin" onClick={() => activateRecord('operations', operation.id)}  >
                            <span className="text-button-active">Activar</span>
                        </button>
                    );
                },
                id: 'button-active-admin'
            },
        ],
        suppliers: [
            { Header: 'Código', accessor: 'supplier_code' },
            { Header: 'Nombre del proveedor', accessor: 'name' },
            {
                Header: 'Estado',
                accessor: 'supplier_status',
                Cell: ({ value }) => {
                    return (
                        <span style={{ color: value === "Suspendido" ? "red" : "black", fontWeight: '700' }}>
                            {value}
                        </span>
                    )
                }
            },
            {
                Header: "",
                Cell: ({ row }) => {
                    const supplier = row.original;
                    return (
                        <button className="button-active-admin" onClick={() => activateRecord('suppliers', supplier.id)}  >
                            <span className="text-button-active">Activar</span>
                        </button>
                    );
                },
                id: 'button-active-admin'
            },
        ],
        products: [
            { Header: 'Código', accessor: 'sku' },
            { Header: 'Título', accessor: 'title' },
            {
                Header: 'Precio',
                accessor: 'price',
                Cell: ({ value }) => {
                    return (
                        <span>
                            $ {parseFloat(value).toFixed(2)}
                        </span>
                    )
                }
            },
            {
                Header: "",
                Cell: ({ row }) => {
                    const product = row.original;
                    return (
                        <button className="button-active-admin" onClick={() => activateRecord('products', product.id)}  >
                            <span className="text-button-active">Activar</span>
                        </button>
                    );
                },
                id: 'button-active-admin'
            },
        ],
    };

    const handleSelect = (optionSelected) => {
        setSelectedOption(optionSelected);
        console.log("opcion seleccionada", optionSelected.value)
    };

    const transformData = (originalData) => {
        console.log("Original Data:", originalData);

        return originalData.map(item => {
            let transformedItem = { ...item };

            console.log("Item antes de transformar:", item);

            if (selectedOption.value === 'clients') {
                const transformedStatus = userStatusMaping[item.client_status] || item.client_status;
                transformedItem.client_status = transformedStatus;
            } else if (selectedOption.value === 'vehicles') {
                transformedItem.vehicle_status = userStatusMaping[item.vehicle_status] || item.vehicle_status;
                transformedItem.category = vehicleCategory[item.category] || item.category;
            } else if (selectedOption.value === 'operations') {
                transformedItem.operation_status = userStatusMaping[item.operation_status] || item.operation_status;
            } else if (selectedOption.value == 'suppliers') {
                transformedItem.supplier_status = userStatusMaping[item.supplier_status] || item.supplier_status;
            }

            console.log("Item transformado:", transformedItem);

            return transformedItem;
        });
    };

    const fetchData = async (resourceType) => {
        console.log("Fetching data for", resourceType);
        try {
            const response = await apiClient.get(`/${resourceType}/suspended`);
            const transformedData = transformData(response.data);
            setData(transformedData);
        } catch (error) {
            console.log("Ha ocurrido un error al obtener los datos", error);
        }
    };

    const resourceConfig = {
        clients: { statusField: 'client_status', specialEndpoint: '/clients/unsuspend/' },
        vehicles: { statusField: 'status' },
        operations: { statusField: 'status' },
        suppliers: { statusField: 'supplier_status' },
        products: { statusField: 'product_status' }
    };

    const activateRecord = async (recordType, recordId) => {
        if (!resourceConfig[recordType]) {
            toast.error('Tipo de recurso no soportado:', {
                position: toast.POSITION.TOP_RIGHT
            });
            console.error('Tipo de recurso no soportado:', recordType);
            return;
        }
    
        let endpoint = "";
        if (resourceConfig[recordType].specialEndpoint) {
            endpoint = `${resourceConfig[recordType].specialEndpoint}${recordId}`;
            console.log("rutac", endpoint)
        } else {
            const statusField = resourceConfig[recordType].statusField;
            endpoint = `/${recordType}/change-status/${recordId}?${statusField}=active`;
        }
    
        try {
            const response = await apiClient.put(endpoint);
            toast.success('Registro activado', {
                position: toast.POSITION.TOP_RIGHT
            });
            fetchData(recordType);
            console.log(response.data);
        } catch (error) {
            toast.error('Error activando el registro', {
                position: toast.POSITION.TOP_RIGHT
            });
            console.log('Error activando el registro', error);
        }
    }
    

    useEffect(() => {
        if (selectedOption && selectedOption.value) {
            fetchData(selectedOption.value);
            const selectedColumns = columnMappings[selectedOption.value];
            setColumns(selectedColumns);
        }
    }, [selectedOption]);

    return (
        <div style={{ marginTop: '-18px' }}>
            <ToastContainer />
            <div className="administration-container-title">
                <label>Registros suspendidos</label>
            </div>

            <div className="div-select-administration">
                <div>
                    <Select
                        value={selectedOption}
                        onChange={handleSelect}
                        styles={administrationSelectStyles}
                        options={administrationOptions}
                        placeholder="Seleccione"
                    />

                </div>

                <div className="div-text-administration">
                    <label className="label-text-administration">
                        Los registros suspendidos son registros que
                        no aparecen en las busquedas en el sistema. Un registro debe suspenderse
                        solo cuando el registro ya no tiene ningún uso actual en el sistema.
                    </label>
                </div>

            </div>

            <div style={{ marginTop: '-60px' }}>
                <DataTable
                    data={data}
                    columns={columns}
                    highlightRows={false}
                />
            </div>

        </div>

    )

};

export default Administration;