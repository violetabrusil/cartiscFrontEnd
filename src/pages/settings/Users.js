import "../../Users.css";
import "../../Modal.css"
import React, { useEffect, useState, useCallback } from "react";
import SearchBar from "../../searchBar/SearchBar";
import DataTable from "../../dataTable/DataTable";
import apiClient from "../../services/apiClient";
import { ToastContainer } from "react-toastify";
import Select from 'react-select';
const addUserIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";
const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";
const userIcon = process.env.PUBLIC_URL + "/images/user.png";
const editIcon = process.env.PUBLIC_URL + "/images/icons/editIcon.png";
const editIconWhite = process.env.PUBLIC_URL + "/images/icons/editIcon-white.png";
const Users = () => {

    const [allUsers, setallUsers] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showMoreInformationUser, setShowMoreInformationUser] = useState(false);
    const [username, setUsername] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [actionType, setActionType] = useState('view');
    const [isOpenModal, setIsOpenModal] = useState(false);

    const handleFilter = useCallback((option, term) => {
        setSelectedOption(option);
        setSearchTerm(term);
    }, []);

    const columns = React.useMemo(
        () => [
            { Header: "Código único", accessor: "sku" },
            { Header: "Nombre de usuario", accessor: "title" },
            { Header: "Categoría", accessor: "category" },
            {
                Header: "Foto de perfil",
                accessor: "product_picture",
                Cell: ({ value }) => {
                    const imageUrl = value ? `data:image/jpeg;base64,${value}` : userIcon;

                    return (
                        <img
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
            {
                Header: "Rol",
                accessor: "row"
            },
            {
                Header: "Estado",
                accessor: "column"
            },
            {
                Header: "Fecha de creación",
                accessor: "fec creado"
            },
            {
                Header: "Fecha de actualización",
                accessor: "fecha act"
            },
            {
                Header: "Actualizado por",
                accessor: "act por"
            },
            {
                Header: "",
                Cell: ({ row }) => {
                    const user = row.original;
                    return (
                        <button className="button-more-information-user" onClick={(event) => handleShowMoreInfomation(event, user)} >
                            <img src={eyeIcon} alt="Edit User Icon" className="eye-user-icon" />
                        </button>
                    );
                },
                id: 'button-more-information-user'
            },
        ],
        []
    );

    //Función que permite obtener todos los usuarios
    //cuando inicia la pantalla y las busca por
    //por número de serie, categoría o título
    const fetchData = async () => {

        //Endpoint por defecto
        let endpoint = '/products/all';
        const searchPerSku = "sku";
        const searchPerSupplier = "supplier_name";
        const searchPerTitle = "title";
        const searchPerCategory = "category";
        const searchPerBrand = "brand";

        if (searchTerm) {
            console.log(selectedOption);
            switch (selectedOption.value) {

                case 'sku':
                    endpoint = `/products/search?search_type=${searchPerSku}&criteria=${searchTerm}`;

                    break;
                case 'supplier_name':
                    endpoint = `/products/search?search_type=${searchPerSupplier}&criteria=${searchTerm}`;
                    break;
                case 'title':
                    endpoint = `/products/search?search_type=${searchPerTitle}&criteria=${searchTerm}`;
                    break;
                case 'category':
                    endpoint = `/products/search?search_type=${searchPerCategory}&criteria=${searchTerm}`;
                    break;
                case 'brand':
                    endpoint = `/products/search?search_type=${searchPerBrand}&criteria=${searchTerm}`;
                    break;
                default:
                    break;
            }
            console.log("Using endpoint:", endpoint);
        }
        try {
            console.log("Endpoint to fetch:", endpoint);
            const response = await apiClient.get(endpoint);
            console.log("Respuesta del servidor:", response.data);
            setallUsers(response.data);
        } catch (error) {
            console.log("Error al obtener los datos de los servicios");
        }
    };

    const userSelectStyles = {
        control: (base, state) => ({
            ...base,
            width: '200px',
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
        menuPortal: base => ({ ...base, width: '15%', zIndex: 9999 }),

    };

    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
            width: '295px',
            height: '40px',
            minHeight: '40px',
            border: '1px solid rgb(0 0 0 / 34%)',
            textAlign: 'left'
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: 'rgb(0 0 0 / 34%)',
            fontWeight: '600',
        }),
        option: (provided, state) => ({
            ...provided,
            className: 'custom-option-select',
            textAlign: 'left'
        }),
    };

    const handleShowMoreInfomation = (event, user) => {
        setActionType('view');
        setShowMoreInformationUser(true);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        setSelectedUser(user);
    };

    const userOptions = [
        { value: 'unumber', label: 'Código único' },
        { value: 'username', label: 'Nombre de usuario' }
    ];

    const roleOptions = [
        { value: 'admin', label: 'Administrador' },
        { value: 'operator', label: 'Operador' }
    ];

    const statusOptions = [
        { value: 'active', label: 'Activo' },
        { value: 'suspended', label: 'Suspendido' }
    ];

    const handleShowAddNewUser = () => {
        setActionType('add');
        setSelectedUser(null);
    };

    const handleEditUser = () => {
        setActionType('edit');
        setIsEditing(true);
    };

    const handleUpdateUser = () => {
        console.log("metodo para actualziar user")
    };

    const handleOpenModal = () => {
        setIsOpenModal(true);
    };

    const handleSaveUser = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (actionType === 'edit') {
            handleUpdateUser();
        } else {
            handleOpenModal();
        }
    };

    

    useEffect(() => {
        fetchData();
    }, [selectedOption, searchTerm]);

    return (
        <div style={{ marginTop: '-18px' }}>
            <ToastContainer />
            <div className="general-user">
                <div className="general-user-right">
                    <div className="users-container-title">
                        <label>{String(allUsers.length).padStart(4, '0')}</label>
                        <span>Usuarios</span>
                        <button className="add-user-button" onClick={handleShowAddNewUser}>
                            <img src={addUserIcon} alt="Add Product Icon" className="add-user-icon n" />
                        </button>
                    </div>

                    <SearchBar
                        onFilter={handleFilter}
                        placeholderText="Buscar Usuarios"
                        customSelectStyles={userSelectStyles}
                        classNameSuffix="user"
                        options={userOptions}
                    />

                    <DataTable
                        data={allUsers}
                        columns={columns}
                        highlightRows={false}
                    />

                </div>

                <div className="general-user-left">
                    <div className="container-user-information">
                        {showMoreInformationUser && (
                            <></>
                        )}

                        <div>
                            <div className="container-button-edit-user">
                                <label className="label-title-view">
                                    {actionType === 'edit' ? 'Editar' : (actionType === 'add' ? 'Agregar cliente' : '')}
                                </label>


                                {actionType === 'view' && (
                                    <button onClick={handleEditUser} className="button-edit-user">
                                        <img src={editIcon} alt="Edit icon users" className="icon-edit-user" />
                                    </button>
                                )}
                            </div>

                            <div className="container-profile-picture-user">
                                <img src={userIcon} alt="Profile picture" className="profile-pictur-user" />
                                {(actionType === 'add' || actionType === 'edit') && (
                                    <div className="div-icon-edit-profile">
                                        <img src={editIconWhite} alt="Edit profile picture" className="icon-edit-profile" />
                                    </div>
                                )}
                                {actionType !== 'add' && (
                                    <label className="label-unique-code">5678</label>
                                )}
                                {actionType === 'view' ? (
                                    <label className="label-user-name">orlandoortiz</label>
                                ) : (
                                    <>
                                        <div className="label-name-user-container">
                                            <label className="label-name-user">Nombre de usuario</label>
                                            <input className="input-name-user" value={username} onChange={(e) => setUsername(e.target.value)} />
                                        </div>
                                        <div className="label-name-user-container">
                                            <label className="label-name-user">Rol</label>
                                            <Select styles={selectStyles} options={roleOptions} placeholder="Seleccione" />
                                        </div>
                                        <div className="label-name-user-container">
                                            <label className="label-name-user">Estado</label>
                                            <Select styles={selectStyles} options={statusOptions} placeholder="Seleccione" />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="container-status-user">
                                {actionType === 'view' && (
                                    <>
                                        <label className="label-status-user">Estado:</label>
                                        <label className="label-status">Activo</label>
                                    </>
                                )}
                            </div>

                            <div className="container-button-user-action">
                                {actionType === 'view' ? (
                                    <>
                                        <button className="buttons-user">
                                            <span className="span-button-user">Restablecer contraseña</span>
                                        </button>
                                        <button className="buttons-user">
                                            <span className="span-button-user">Restablecer PIN</span>
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ marginTop: '-19px' }}>
                                        <button className="buttons-user" onClick={handleSaveUser}>
                                            <span className="span-button-user">Guardar</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {isOpenModal && (
                <div className="filter-modal-overlay">
                    <div className="filter-modal">
                        <h3>Credenciales de acceso</h3>
                        <div>
                            <div>
                                <label>Ingrese la contraseña</label>
                                <input></input>
                            </div>
                            <div>
                                <label>Ingrese el pin</label>
                                <input></input>
                            </div>
                        </div>

                        <button className="modal-button">Confirmar</button>
                    </div>
                </div>
            )}






        </div>

    )

};

export default Users;