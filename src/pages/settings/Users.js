import "../../Users.css";
import "../../Modal.css"
import React, { useEffect, useState, useCallback, useRef, useContext } from "react";
import SearchBar from "../../searchBar/SearchBar";
import DataTable from "../../dataTable/DataTable";
import apiAdmin from "../../services/apiAdmin";
import { AuthContext } from "../../contexts/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import Select from 'react-select';
import { userTypeMaping } from "../../constants/userRoleConstants";
import { userStatusMaping } from "../../constants/userStatusConstants";
import { useDebounce } from "../../useDebounce";

const addUserIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";
const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";
const userIcon = process.env.PUBLIC_URL + "/images/user.png";
const editIcon = process.env.PUBLIC_URL + "/images/icons/editIcon.png";
const editIconWhite = process.env.PUBLIC_URL + "/images/icons/editIcon-white.png";
const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";

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
    const [modalAction, setModalAction] = useState(null);

    //Variables para creación y edición de usuarios
    const [imageBase64, setImageBase64] = useState(null);
    const fileInputRef = useRef(null);
    const [role, setRole] = useState(null);
    const [status, setStatus] = useState(actionType === 'add' ? 'active' : null);
    const [password, setPassword] = useState("");
    const [pin, setPin] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const debouncedPassword = useDebounce(password, 1000); // espera 500ms antes de validar
    const [pinError, setPinError] = useState("");
    const debouncedPin = useDebounce(pin, 500);
    const [displayImage, setDisplayImage] = useState(null);
    const { user } = useContext(AuthContext);
    const [tempImage, setTempImage] = useState(null);

    const statusColors = {
        "Activo": "#49A05C",
        "Suspendido": "#6E757D"
    };

    const handleFilter = useCallback((option, term) => {
        setSelectedOption(option);
        setSearchTerm(term);
    }, []);

    const columns = React.useMemo(
        () => [
            { Header: "Código único", accessor: "unumber" },
            { Header: "Nombre de usuario", accessor: "username" },
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
            {
                Header: "Rol",
                accessor: "translated_user_type"
            },
            {
                Header: "Estado",
                accessor: "translated_user_status",
                Cell: ({ value }) =>
                    <label style={{ color: statusColors[value], fontWeight: "bold" }}>
                        {value}
                    </label>
            },
            {
                Header: "Fecha de creación",
                accessor: "created_at"
            },
            {
                Header: "Fecha de actualización",
                accessor: "updated_at"
            },
            {
                Header: "Actualizado por",
                accessor: "updated_by"
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

    function formatDate(isoDate) {
        const date = new Date(isoDate);
        const day = String(date.getUTCDate()).padStart(2, '0');  // Usamos getUTCDate en lugar de getDate
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Usamos getUTCMonth en lugar de getMonth
        const year = date.getUTCFullYear();  // Usamos getUTCFullYear en lugar de getFullYear

        return `${day}/${month}/${year}`;
    };

    const determineImageToShow = () => {
        const base64Prefix = 'data:image/jpeg;base64,';

        // Para 'add'
        if (actionType === 'add') {
            return displayImage || userIcon;
        }

        // Para 'view'
        if (actionType === 'view') {
            let userImage = selectedUser ? selectedUser.profile_picture : user.user.profile_picture;
            if (userImage && !userImage.startsWith(base64Prefix)) {
                userImage = base64Prefix + userImage;
            }
            return userImage || userIcon;
        }

        // Para 'edit'
        if (actionType === 'edit') {
            // Si tienes una nueva imagen seleccionada para cargar, úsala
            if (displayImage) {
                return displayImage;
            } else {
                // Si no hay una nueva imagen, muestra la del usuario seleccionado
                let userImage = selectedUser ? selectedUser.profile_picture : user.user.profile_picture;
                if (userImage && !userImage.startsWith(base64Prefix)) {
                    userImage = base64Prefix + userImage;
                }
                return userImage || userIcon;
            }
        }

        return userIcon;
    };


    //Función que permite obtener todos los usuarios
    //cuando inicia la pantalla y las busca por
    //por número de serie, categoría o título
    const fetchData = async () => {

        //Endpoint por defecto
        let endpoint = '/all-users';
        const searchPerUniqueCode = "unumber";
        const searchPerUserName = "username";

        if (searchTerm) {
            console.log(selectedOption);
            switch (selectedOption.value) {

                case 'unumber':
                    endpoint = `/search-users?search_type=${searchPerUniqueCode}&criteria=${searchTerm}`;

                    break;
                case 'username':
                    endpoint = `/search-users?search_type=${searchPerUserName}&criteria=${searchTerm}`;
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
            const transformedUserData = response.data.map(user => {
                const newDateCreate = formatDate(user.created_at);
                const newDateUpdate = formatDate(user.updated_at);
                const translatedUserType = userTypeMaping[user.user_type] || user.user_type;
                const translatedStatusUser = userStatusMaping[user.user_status] || user.user_status;
                return {
                    ...user,
                    created_at: newDateCreate,
                    updated_at: newDateUpdate,
                    translated_user_type: translatedUserType,
                    translated_user_status: translatedStatusUser
                };
            });

            console.log("Respuesta del servidor:", transformedUserData);
            setallUsers(transformedUserData);
        } catch (error) {
            console.log("Error al obtener los datos de los usuarios", error);
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
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        setDisplayImage(null);
        setImageBase64(null);
        setSelectedUser(user);
        setActionType('view');
        console.log("usuario seleccionad", user)
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
        setDisplayImage(null)
        setUsername('');
        setPassword('');
        setPin('');
    };

    const handleEditUser = () => {
        console.log('entro')
        console.log("Selected User before editing:", selectedUser);
        setActionType('edit');
        console.log("action", actionType)

        if (selectedUser) {
            setUsername(selectedUser.username)
            setStatus(selectedUser.user_status);
            setRole(selectedUser.user_type);
        } else if (user) {
            setUsername(user.user.username)
            setStatus(user.user.user_status);
            setRole(user.user.user_type);
        }

        setIsEditing(true);
    };

    useEffect(() => {
        if (selectedUser) {
            setStatus(selectedUser.user_status);
            setRole(selectedUser.user_type);
        }
    }, [selectedUser]);

    const openModalForCreate = () => {
        setModalAction('create');
        setIsOpenModal(true);
    };

    const openModalForResetPassword = () => {
        setModalAction('resetPassword');
        setIsOpenModal(true);
    };

    const openModalForResetPin = () => {
        setModalAction('resetPin');
        setIsOpenModal(true);
    };

    const closeModal = () => {
        setIsOpenModal(false);
    };

    const handleCloseModal = async () => {

        switch (modalAction) {
            case 'resetPassword':
                if (!passwordError && !pinError) {
                    resetPassword();
                } else {
                    toast.error('Revise los errores en el formulario.', {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
                break;
            case 'resetPin':
                if (!passwordError && !pinError) {
                    resetPIN();
                } else {
                    toast.error('Revise los errores en el formulario.', {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
                break;
            case 'create':
                if (!passwordError && !pinError) {
                    createUser();
                } else {
                    toast.error('Revise los errores en el formulario.', {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
                break;
        }
        setIsOpenModal(false);
    };

    const validatePassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
        const isValidLength = password.length >= 6 && password.length <= 16;

        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isValidLength;
    };

    const validatePin = (pin) => {
        // De 4 a 6 dígitos.
        const regex = /^\d{4,6}$/;

        return regex.test(pin);
    };

    useEffect(() => {
        if (debouncedPassword.length > 0) {
            if (!validatePassword(debouncedPassword)) {
                setPasswordError("La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número, un carácter especial y tener entre 6 y 16 caracteres.");
            } else {
                setPasswordError("");
            }
        } else {
            // Si el campo password está vacío o no cumple con la validación, elimina el mensaje de error.
            setPasswordError("");
        }
    }, [debouncedPassword]);

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
    };

    useEffect(() => {
        if (debouncedPin.length > 0) {
            if (!validatePin(debouncedPin)) {
                setPinError("El PIN debe contener entre 4 y 6 dígitos.");
            } else {
                setPinError("");
            }
        } else {
            // Si el campo pin está vacío o no cumple con la validación, elimina el mensaje de error.
            setPinError("");
        }
    }, [debouncedPin]);

    const handlePinChange = (e) => {
        const newPin = e.target.value;
        setPin(newPin);
    };

    const handleSaveUser = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (actionType === 'edit') {
            editUser();
        } else {
            openModalForCreate();
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
            let base64String = reader.result;

            // Set the full image for display
            setDisplayImage(base64String);

            // Remove the prefix "data:image/png;base64,"
            base64String = base64String.split(',')[1];

            setImageBase64(base64String);
        }

        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const editUser = async () => {
        // Construye userData base
        const userData = {
            username: username,
            pin: pin,
            password: password,
            user_type: role,
            user_status: status
        };

        // Añade profile_picture a userData solo si imageBase64 tiene valor
        if (imageBase64) {
            userData.profile_picture = imageBase64;
        }

        console.log("data a enviar", userData);

        try {
            await apiAdmin.put(`/update-user/${selectedUser.id}`, userData);
            toast.success('Usuario actualizado con éxito', {
                position: toast.POSITION.TOP_RIGHT
            });
            setActionType('view');
            setSelectedUser(null);
            fetchData();
        } catch (error) {
            toast.error('Error al actualizar el usuario', {
                position: toast.POSITION.TOP_RIGHT
            });
            console.log("Error al actualizar usuario", error);
        }
    };

    const createUser = async () => {

        const userData = {
            username: username,
            pin: pin,
            password: password,
            user_type: role,
            profile_picture: imageBase64
        };

        try {
            await apiAdmin.post('/create-user', userData)
            toast.success('Usuario creado con éxito', {
                position: toast.POSITION.TOP_RIGHT
            });
            setActionType('view');
            setSelectedUser(null);
            setIsOpenModal(false);
            fetchData();
        } catch (error) {
            toast.error('Error al crear el usuario', {
                position: toast.POSITION.TOP_RIGHT
            });
            console.log("Error al crear usuario", error);

        }
    };

    const resetPassword = async () => {
        const userId = selectedUser.id || user.user.id;
        console.log("usuario select", userId)

        const userData = {
            new_password: password,
        };

        try {
            await apiAdmin.put(`/change-password/${userId}`, userData);
            toast.success('Contraseña actualizada', {
                position: toast.POSITION.TOP_RIGHT
            });
            setActionType('view');
            setSelectedUser(null);
            setIsOpenModal(false);

        } catch (error) {
            toast.error('Error al resetear la contraseña', {
                position: toast.POSITION.TOP_RIGHT
            });
            console.log("Error al resetear la contraseña", error);

        }
    };

    const resetPIN = async () => {
        console.log("entro al pin")

        const userId = selectedUser.id || user.user.id;
        console.log("usuario select", userId)

        const userData = {
            new_pin: pin,
        };

        try {
            await apiAdmin.put(`/change-pin/${userId}`, userData);
            toast.success('PIN actualizado', {
                position: toast.POSITION.TOP_RIGHT
            });
            setActionType('view');
            setSelectedUser(null);
            setIsOpenModal(false);

        } catch (error) {
            toast.error('Error al resetear el PIN', {
                position: toast.POSITION.TOP_RIGHT
            });
            console.log("Error al resetear el PIN", error);

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
                        <div>
                            <div className="container-button-edit-user">
                                <label className="label-title-view">
                                    {actionType === 'edit' ? 'Editar' : (actionType === 'add' ? 'Agregar cliente' : '')}
                                </label>

                                {actionType === 'view' && (
                                    <>
                                        <button onClick={handleEditUser} className="button-edit-user">
                                            <img src={editIcon} alt="Edit icon users" className="icon-edit-user" />
                                        </button>
                                    </>

                                )}
                            </div>

                            <div className="container-profile-picture-user">
                                <img src={determineImageToShow()} alt="Profile picture" className="profile-picture-user" />
                                {(actionType === 'add' || actionType === 'edit') && (
                                    <div className="div-icon-edit-profile" onClick={() => fileInputRef.current.click()}>
                                        <img src={editIconWhite} alt="Edit profile picture" className="icon-edit-profile" />
                                        <input type="file" style={{ display: 'none' }} onChange={handleImageChange} ref={fileInputRef} />
                                    </div>

                                )}
                                {actionType !== 'add' && (
                                    <label className="label-unique-code">
                                        {selectedUser ? selectedUser.unumber : user.user.unumber}
                                    </label>
                                )}
                                {actionType === 'view' ? (
                                    <>
                                        <label className="label-user-name">
                                            {selectedUser ? selectedUser.username : user.user.username}
                                        </label>
                                        <label className="label-rol-user">
                                            {selectedUser ? selectedUser.translated_user_type : user.user.user_type}
                                        </label>
                                    </>

                                ) : (
                                    <>
                                        <div className="label-name-user-container">
                                            <label className="label-name-user">Nombre de usuario</label>
                                            <input
                                                className="input-name-user"
                                                value={username}
                                                onChange={(e) => {
                                                    console.log("Input changed!", e.target.value);
                                                    setUsername(e.target.value);
                                                }}
                                                readOnly={actionType === 'view'}
                                            />
                                        </div>
                                        <div className="label-name-user-container">
                                            <label className="label-name-user">Rol</label>
                                            <Select
                                                isSearchable={false}
                                                styles={selectStyles}
                                                options={roleOptions}
                                                placeholder="Seleccione"
                                                value={roleOptions.find(option => option.value === role)}
                                                onChange={selectedOption => {
                                                    console.log("Role selected!", selectedOption.value);
                                                    setRole(selectedOption.value);
                                                }}
                                                isDisabled={actionType === 'view'}
                                            />

                                        </div>
                                        <div className="label-name-user-container">
                                            <label className="label-name-user">Estado</label>
                                            <Select
                                                isSearchable={false}
                                                styles={selectStyles}
                                                options={statusOptions}
                                                placeholder="Seleccione"
                                                value={statusOptions.find(option => option.value === status)}
                                                onChange={selectedOption => {
                                                    console.log("Status selected!", selectedOption.value);
                                                    setStatus(selectedOption.value);
                                                }}
                                                isDisabled={actionType === 'add'}
                                            />

                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="container-status-user">
                                {actionType === 'view' && (
                                    <>
                                        <label className="label-status-user">Estado:</label>
                                        <label className="label-status" style={{ color: statusColors[selectedUser ? selectedUser.translated_user_status : userStatusMaping[user.user.user_status]] }}>
                                            {selectedUser ? selectedUser.translated_user_status : userStatusMaping[user.user.user_status]}
                                        </label>

                                    </>
                                )}
                            </div>

                            <div className="container-button-user-action">
                                {actionType === 'view' ? (
                                    <>
                                        <button className="buttons-user" onClick={openModalForResetPassword}>
                                            <span className="span-button-user">Restablecer contraseña</span>
                                        </button>
                                        <button className="buttons-user" onClick={openModalForResetPin}>
                                            <span className="span-button-user">Restablecer PIN</span>
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ marginTop: '-34px' }}>
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
                        <div style={{display: 'flex'}}>
                            <h3>
                                {modalAction === 'create' && 'Credenciales de acceso'}
                                {modalAction === 'resetPassword' && 'Ingrese una contraseña temporal'}
                                {modalAction === 'resetPin' && 'Ingrese un PIN temporal'}
                            </h3>
                            <button style={{marginTop: '16px'}} className="button-close-modal" onClick={closeModal}  >
                                <img src={closeIcon} alt="Close Icon" className="modal-close-icon"></img>
                            </button>
                        </div>


                        {modalAction === 'create' && (
                            <label className="label-modal-message">
                                Ingrese las credenciales de acceso que serán entregadas a cada operador
                            </label>
                        )}
                        <div className="container-modal-fields">
                            {/* Input de contraseña para las acciones 'create' y 'resetPassword' */}
                            {(modalAction === 'create' || modalAction === 'resetPassword') && (
                                <div>
                                    <label>Ingrese la contraseña</label>
                                    <input
                                        type="text"
                                        value={password}
                                        onChange={handlePasswordChange}
                                    />
                                </div>
                            )}
                            {passwordError && <span style={{ color: 'red' }}>{passwordError}</span>}

                            {/* Input de PIN para las acciones 'create' y 'resetPin' */}
                            {(modalAction === 'create' || modalAction === 'resetPin') && (
                                <div>
                                    <label>Ingrese el pin</label>
                                    <input
                                        type="number"
                                        style={{ marginLeft: '63px' }}
                                        value={pin}
                                        onChange={handlePinChange}
                                    />
                                </div>
                            )}
                            {pinError && <span style={{ color: 'red' }}>{pinError}</span>}


                        </div>

                        <button onClick={handleCloseModal} className="modal-button">Confirmar</button>
                    </div>
                </div>
            )}






        </div>

    )

};

export default Users;