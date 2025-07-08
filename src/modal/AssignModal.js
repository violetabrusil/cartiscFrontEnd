import "../Modal.css";
import React, { useState, useCallback, useEffect } from 'react';
import SearchBar from "../searchBar/SearchBar";
import apiAdmin from "../services/apiAdmin";
import DataTable from "../dataTable/DataTable";
import apiClient from "../services/apiClient";
import useCSSVar from "../hooks/UseCSSVar";
import { showToastOnce } from "../utils/toastUtils";

const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const userIcon = process.env.PUBLIC_URL + "/images/user.png";

export function AssignModal({ isOpen, onClose, onConfirm, workOrderId, getWorkOrderDetail }) {

    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [allUsers, setallUsers] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [username, setUsername] = useState("");
    const grayMediumDark = useCSSVar('--gray-medium-dark');
    const blackAlpha34 = useCSSVar('--black-alpha-34');

    const userSelectStyles = {
        control: (base, state) => ({
            ...base,
            width: '300px',
            height: '40px',
            minHeight: '40px',
            border: `1px solid ${blackAlpha34}`,
            borderRadius: '4px',
            padding: '1px',
            boxSizing: 'border-box'
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: grayMediumDark,
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
    };


    const handleFilter = useCallback((option, term) => {
        setSelectedOption(option);
        setSearchTerm(term);
    }, []);

    const fetchData = async () => {

        let endpoint = '/active-users';
        const searchPerUniqueCode = "unumber";
        const searchPerUserName = "username";

        if (searchTerm) {
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
        }
        try {
            const response = await apiAdmin.get(endpoint);
            setallUsers(response.data);
        } catch (error) {
            showToastOnce("error", "Error al obtener los datos de los usuarios.");
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
            }, 3000);
        }
    };

    const assignOperatorToWorkOrder = async (username, workOrderId) => {
        const url = `/work-orders/assign/${workOrderId}?username_operator=${username}`;
        try {
            const response = await apiClient.put(url);
            if (response.status === 200) {

                showToastOnce("success", "Asignación exitosa.");
                await getWorkOrderDetail(workOrderId);
                return response.data;

            } else {
                showToastOnce("error", "Hubo un error al asignar el usuario a la orden de trabajo.");
                return null;
            }
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedOption, searchTerm]);

    useEffect(() => {
    }, [username, selectedRow]);

    return (
        <div className='filter-modal-overlay'>
            {isOpen && (

                <div style={{ maxWidth: '600px' }} className="modal-payment">

                    <div className="title-modal-history">
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

                    <div style={{ textAlign: 'center' }}>
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
