import "../../Administration.css";
import "../../Loader.css";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Select from 'react-select';
import PuffLoader from "react-spinners/PuffLoader";
import DataTable from "../../dataTable/DataTable";
import apiClient from "../../services/apiClient";
import { userStatusMaping } from "../../constants/userStatusConstants";
import { vehicleCategory } from "../../constants/vehicleCategoryConstants";

const Administration = () => {

    const [selectedOption, setSelectedOption] = useState('');
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);

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
                Header: "Fecha de Suspención",
                accessor: "updated_at",
                Cell: ({ value }) => {
                    const date = new Date(value);

                    // Añadir un cero adelante si es un solo dígito
                    const formatNumber = (num) => num.toString().padStart(2, '0');

                    const day = formatNumber(date.getDate());
                    const month = formatNumber(date.getMonth() + 1);  // Los meses empiezan en 0
                    const year = date.getFullYear();
                    const hours = formatNumber(date.getHours());
                    const minutes = formatNumber(date.getMinutes());

                    return `${day}/${month}/${year} ${hours}:${minutes}`;
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
                Header: "Fecha de Suspención",
                accessor: "updated_at",
                Cell: ({ value }) => {
                    const date = new Date(value);

                    // Añadir un cero adelante si es un solo dígito
                    const formatNumber = (num) => num.toString().padStart(2, '0');

                    const day = formatNumber(date.getDate());
                    const month = formatNumber(date.getMonth() + 1);  // Los meses empiezan en 0
                    const year = date.getFullYear();
                    const hours = formatNumber(date.getHours());
                    const minutes = formatNumber(date.getMinutes());

                    return `${day}/${month}/${year} ${hours}:${minutes}`;
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
                Header: "Fecha de Suspención",
                accessor: "updated_at",
                Cell: ({ value }) => {
                    const date = new Date(value);

                    // Añadir un cero adelante si es un solo dígito
                    const formatNumber = (num) => num.toString().padStart(2, '0');

                    const day = formatNumber(date.getDate());
                    const month = formatNumber(date.getMonth() + 1);  // Los meses empiezan en 0
                    const year = date.getFullYear();
                    const hours = formatNumber(date.getHours());
                    const minutes = formatNumber(date.getMinutes());

                    return `${day}/${month}/${year} ${hours}:${minutes}`;
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
                Header: "Fecha de Suspención",
                accessor: "updated_at",
                Cell: ({ value }) => {
                    const date = new Date(value);

                    // Añadir un cero adelante si es un solo dígito
                    const formatNumber = (num) => num.toString().padStart(2, '0');

                    const day = formatNumber(date.getDate());
                    const month = formatNumber(date.getMonth() + 1);  // Los meses empiezan en 0
                    const year = date.getFullYear();
                    const hours = formatNumber(date.getHours());
                    const minutes = formatNumber(date.getMinutes());

                    return `${day}/${month}/${year} ${hours}:${minutes}`;
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
                Header: "Fecha de Suspención",
                accessor: "updated_at",
                Cell: ({ value }) => {
                    const date = new Date(value);

                    // Añadir un cero adelante si es un solo dígito
                    const formatNumber = (num) => num.toString().padStart(2, '0');

                    const day = formatNumber(date.getDate());
                    const month = formatNumber(date.getMonth() + 1);  // Los meses empiezan en 0
                    const year = date.getFullYear();
                    const hours = formatNumber(date.getHours());
                    const minutes = formatNumber(date.getMinutes());

                    return `${day}/${month}/${year} ${hours}:${minutes}`;
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
    };

    const transformData = (originalData) => {

        return originalData.map(item => {
            let transformedItem = { ...item };

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

            return transformedItem;
        });
    };

    const fetchData = async (resourceType) => {
        try {
            const response = await apiClient.get(`/${resourceType}/suspended`);
    
            // Verifica si response.data es null o no está definido
            if (!response.data) {
                setData([]);
                return;
            }
    
            const transformedData = transformData(response.data);
            setData(transformedData);
            setLoading(false);
        } catch (error) {
            toast.error('Ha ocurrido un error al obtener los datos..', {
                position: toast.POSITION.TOP_RIGHT
            });
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
        } else {
            const statusField = resourceConfig[recordType].statusField;
            endpoint = `/${recordType}/change-status/${recordId}?${statusField}=active`;
        }

        try {
            const response = await apiClient.put(endpoint);
            toast.success('Registro restaurado', {
                position: toast.POSITION.TOP_RIGHT
            });
            fetchData(recordType);
        } catch (error) {
            toast.error('Error activando el registro', {
                position: toast.POSITION.TOP_RIGHT
            });
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
                        isSearchable={false}
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

            {data.length > 0 && (
                <div style={{ marginTop: '-60px' }}>
                    {loading ? (
                        <div className="loader-container" style={{ marginLeft: '-93px' }}>
                            <PuffLoader color="#316EA8" loading={loading} size={60} />
                        </div>
                    ) : (
                        <>
                            <DataTable
                                data={data}
                                columns={columns}
                                highlightRows={false}
                            />
                        </>
                    )}

                </div>
            )
            }

        </div >

    )

};

export default Administration;