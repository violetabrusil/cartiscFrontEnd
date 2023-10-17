import "../Modal.css";

import React, { useState, useCallback, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import SearchBar from "../searchBar/SearchBar";
import apiAdmin from "../services/apiAdmin";
import DataTable from "../dataTable/DataTable";
import apiClient from "../services/apiClient";

const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const userIcon = process.env.PUBLIC_URL + "/images/user.png";


export function AssignModal({ isOpen, onClose, onConfirm, workOrderId }) {

    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [allUsers, setallUsers] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [username, setUsername] = useState("");

    const userSelectStyles = {
        control: (base, state) => ({
            ...base,
            width: '300px',
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
            className: 'custom-select-option-user',
        }),
        menuPortal: base => ({ ...base, width: '15.8%', zIndex: 9999 }),

    };

    const columns = React.useMemo(
        () => [
            {
                Header: "Foto de perfil",
                accessor: "profile_picture",
                Cell: ({ value }) => {
                    const imageUrl = value ? `data:image/jpeg;base64,${value}` : userIcon;
                    return (
                        <img
                            className="profile-picture-image"
                            src={imageUrl}
                            alt="Profile Picture"
                            style={{
                                width: '30px',
                                height: '30px',
                            }}
                        />
                    );
                }
            },
            { Header: "Código único", accessor: "unumber" },
            { Header: "Nombre de usuario", accessor: "username" }
        ],
        []
    );

    const userOptions = [
        { value: 'unumber', label: 'Código único' },
        { value: 'username', label: 'Nombre de usuario' }
    ];

    const handleUserRowClick = (row, index) => {
        setSelectedUserId(row.original.unumber);
        setUsername(row.original.username);
        setSelectedRow(index);
        console.log("Selected User ID:", row.original.unumber, "Selected Username:", row.original.username, "Selected Row:", index);
    };


    const handleFilter = useCallback((option, term) => {
        setSelectedOption(option);
        setSearchTerm(term);
    }, []);

    const fetchData = async () => {

        //Endpoint por defecto
        let endpoint = '/active-users';
        const searchPerUniqueCode = "unumber";
        const searchPerUserName = "username";

        if (searchTerm) {
            console.log(selectedOption);
            switch (selectedOption.value) {

                case 'unumber':
                    endpoint = `/search-users?search_type=${searchPerUniqueCode}&criteria=${searchTerm}&active="true"`;

                    break;
                case 'username':
                    endpoint = `/search-users?search_type=${searchPerUserName}&criteria=${searchTerm}&active="true"`;
                    break;
                default:
                    break;
            }
            console.log("Using endpoint:", endpoint);
        }
        try {
            console.log("Endpoint to fetch:", endpoint);
            const response = await apiAdmin.get(endpoint);
            console.log("datos user", response.data)
            setallUsers(response.data);
        } catch (error) {
            console.log("Error al obtener los datos de los usuarios", error);
        }
    };

    const handleSubmit = async () => {
        const response = await assignOperatorToWorkOrder(username, workOrderId);
        if (response) {
            const lastHistory = response.work_order_history.slice(-1)[0];
            setTimeout(() => {
                onConfirm({
                    newStatus: 'assigned',
                    dateChanged: new Date().toISOString(),
                    created_by: lastHistory.created_by,
                    notes: lastHistory.notes
                });
            }, 3000);  // Espera 3 segundos antes de cerrar el modal (anteriormente era 5, pero en tu código dice 3000ms que son 3 segundos)
        }
    };


    const assignOperatorToWorkOrder = async (username, workOrderId) => {
        const url = `/work-orders/assign/${workOrderId}?username_operator=${username}`;
        try {
            const response = await apiClient.put(url);
            if (response.status === 200) {
                toast.success('Asignación exitosa.', {
                    position: toast.POSITION.TOP_RIGHT,
                    containerId: "modal-toast-container"
                });
                return response.data; // Si la asignación fue exitosa, retorna los datos
            } else {
                toast.error('Hubo un error al asignar el usuario a la orden de trabajo.', {
                    position: toast.POSITION.TOP_RIGHT,
                    containerId: "modal-toast-container"
                });
                return null;
            }
        } catch (error) {
            toast.error("Hubo un error al asignar el usuario a la orden de trabajo.", {
                position: toast.POSITION.TOP_RIGHT,
                containerId: "modal-toast-container"
            });
            console.error("Error:", error);
            return null;
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedOption, searchTerm]);

    useEffect(() => {
        console.log("Username:", username, "Selected Row:", selectedRow);
    }, [username, selectedRow]);

    return (
        <div className='filter-modal-overlay'>
            {isOpen && (

                <div style={{ maxWidth: '600px' }} className="modal-payment">
                    <ToastContainer containerId="modal-toast-container" />

                    <div className="title-modal-hitory">
                        <h4>Asignar Orden de Trabajo</h4>
                        <div style={{ flex: "1", marginTop: '18px' }}>
                            <button className="button-close" onClick={onClose}  >
                                <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                            </button>
                        </div>
                    </div>
                    <div style={{ marginLeft: '-28px' }}>
                        <SearchBar
                            onFilter={handleFilter}
                            placeholderText="Buscar Usuarios"
                            customSelectStyles={userSelectStyles}
                            classNameSuffix="user"
                            options={userOptions}
                        />
                    </div>

                    <div>
                        <DataTable
                            data={allUsers}
                            columns={columns}
                            highlightRows={true}
                            onRowClick={handleUserRowClick}
                            selectedRowIndex={selectedRow}
                        />
                    </div>

                    <div style={{textAlign: 'center'}}>
                        <button
                            onClick={handleSubmit}
                            disabled={!username}
                            className={`accept-button-modal ${!username ? 'disabled' : ''}`}
                        >
                            Asignar
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}
