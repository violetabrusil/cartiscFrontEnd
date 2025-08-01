import "../../Users.css";
import "../../Modal.css"
import "../../Loader.css";
import React, { useEffect, useState, useCallback, useRef, useContext } from "react";
import SearchBar from "../../searchBar/SearchBar";
import DataTable from "../../dataTable/DataTable";
import PuffLoader from "react-spinners/PuffLoader";
import apiAdmin from "../../services/apiAdmin";
import { AuthContext } from "../../contexts/AuthContext";
import Select from 'react-select';
import { userTypeMaping } from "../../constants/userRoleConstants";
import { userStatusMaping } from "../../constants/userStatusConstants";
import { useDebounce } from "../../useDebounce";
import { CustomPlaceholderWithLabel } from "../../customPlaceholder/CustomPlaceholderWithLabel";
import { CustomSingleValueWithLabel } from "../../customSingleValue/CustomSingleValueWithLabel";
import { usePageSizeForTabletLandscape } from "../../pagination/UsePageSize";
import useCSSVar from "../../hooks/UseCSSVar";
import { useStatusColors } from "../../utils/useStatusColors";
import { showToastOnce } from "../../utils/toastUtils";
import { formatDate } from "../../utils/formatters";

const addUserIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";
const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";
const userIcon = process.env.PUBLIC_URL + "/images/user.png";
const editIcon = process.env.PUBLIC_URL + "/images/icons/editIcon.png";
const editIconWhite = process.env.PUBLIC_URL + "/images/icons/editIcon-white.png";
const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const nameIcon = process.env.PUBLIC_URL + "/images/icons/name.png";
const passwordIcon = process.env.PUBLIC_URL + "/images/icons/password.png";
const pinIcon = process.env.PUBLIC_URL + "/images/icons/pin.png";
const operatorIcon = process.env.PUBLIC_URL + "/images/icons/operator.png";
const adminIcon = process.env.PUBLIC_URL + "/images/icons/admin.png";

const Users = () => {

    const tertiaryColor = useCSSVar('--tertiary-color');
    const grayMediumDark = useCSSVar('--gray-medium-dark');
    const blackAlpha34 = useCSSVar('--black-alpha-34');

    const [allUsers, setallUsers] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [username, setUsername] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [actionType, setActionType] = useState('view');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [loading, setLoading] = useState(true);

    //Variables para creación y edición de usuarios
    const [imageBase64, setImageBase64] = useState(null);
    const fileInputRef = useRef(null);
    const [role, setRole] = useState(null);
    const [status, setStatus] = useState('active');
    const [password, setPassword] = useState("");
    const [pin, setPin] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const debouncedPassword = useDebounce(password, 1000);
    const [pinError, setPinError] = useState("");
    const debouncedPin = useDebounce(pin, 500);
    const [displayImage, setDisplayImage] = useState(null);
    const { user, setUser } = useContext(AuthContext);
    const responsivePageSizeUsers = usePageSizeForTabletLandscape(12, 6);

    const statusColors = useStatusColors();

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
                Cell: ({ value }) => {
                    const color = statusColors[value];
                    console.log("Valor del estado:", value);
                    console.log("Color encontrado:", statusColors[value]);
                    return (
                        <label style={{ color, fontWeight: "bold" }}>
                            {value}
                        </label>
                    );
                }
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
        [statusColors]
    );

    const determineImageToShow = () => {

        const base64Prefix = 'data:image/jpeg;base64,';

        if (actionType === 'add') {
            return displayImage || userIcon;
        }

        if (actionType === 'view') {
            let userImage = selectedUser ? selectedUser.profile_picture : user.profile_picture;
            if (userImage && !userImage.startsWith(base64Prefix)) {
                userImage = base64Prefix + userImage;
            }
            return userImage || userIcon;
        }

        if (actionType === 'edit') {

            if (displayImage) {
                return displayImage;
            } else {

                let userImage = selectedUser ? selectedUser.profile_picture : user.profile_picture;
                if (userImage && !userImage.startsWith(base64Prefix)) {
                    userImage = base64Prefix + userImage;
                }
                return userImage || userIcon;
            }
        }

        return userIcon;
    };

    const resetForm = () => {
        setPassword('');
        setPin('')
    };


    //Función que permite obtener todos los usuarios
    //cuando inicia la pantalla y las busca por
    //por número de serie, categoría o título
    const fetchData = async () => {

        let endpoint = '/all-users';
        const searchPerUniqueCode = "unumber";
        const searchPerUserName = "username";

        if (searchTerm) {
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
        }
        try {
            const response = await apiAdmin.get(endpoint);
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
            setallUsers(transformedUserData);
            setLoading(false);
        } catch (error) {
            showToastOnce("error", "Error al obtenerla información de los usuarios,");
        }
    };

    const isTabletLandscape = window.matchMedia("(min-width: 800px) and (max-width: 1340px) and (orientation: landscape)").matches;

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
            fontWeight: '600',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        }),
        option: (provided, state) => ({
            ...provided,
            className: 'custom-select-option-user',
        }),
        menuPortal: base => ({ ...base, width: '15.8%', zIndex: 9999 }),

    };
    const selectStyles = {
        control: (provided, state) => {
            const baseStyles = {
                ...provided,
                height: '40px',
                minHeight: '40px',
                border: `1px solid ${blackAlpha34}`,
                textAlign: 'left',
            };

            if (isTabletLandscape) {
                return {
                    ...baseStyles,
                    width: '220px',
                };
            }

            return {
                ...baseStyles,
                width: '287px',
                '@media (max-width: 1440px) and (max-height: 900px)': {
                    width: '250px',
                },
            };
        },
        placeholder: (provided, state) => ({
            ...provided,
            color: blackAlpha34,
            fontWeight: '600',
        }),
        option: (provided, state) => ({
            ...provided,
            className: 'custom-option-select',
            textAlign: 'left',
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
    };

    const userOptions = [
        { value: 'unumber', label: 'Código único' },
        { value: 'username', label: 'Nombre de usuario' }
    ];

    const roleOptions = [
        { value: 'admin', label: 'Administrador', icon: adminIcon },
        { value: 'operator', label: 'Operador', icon: operatorIcon }
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
        setActionType('edit');

        if (selectedUser) {
            setUsername(selectedUser.username)
            setStatus(selectedUser.user_status);
            setRole(selectedUser.user_type);
        } else if (user) {
            setUsername(user.username)
            setStatus(user.user_status);
            setRole(user.user_type);
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
                    showToastOnce("error", "Revise los errore en el formulario.");
                }
                break;
            case 'resetPin':
                if (!passwordError && !pinError) {
                    resetPIN();
                } else {
                    showToastOnce("error", "Revise los errore en el formulario.");
                }
                break;
            case 'create':
                if (!passwordError && !pinError) {
                    createUser();
                } else {
                    showToastOnce("error", "Revise los errore en el formulario.");
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

            setDisplayImage(base64String);

            base64String = base64String.split(',')[1];

            setImageBase64(base64String);
        }

        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const editUser = async () => {

        const targetUser = selectedUser || user;

        const userData = {
            username: username,
            pin: pin,
            password: password,
            user_type: role,
            user_status: status
        };

        if (imageBase64) {
            userData.profile_picture = imageBase64;
        } else if (targetUser && targetUser.profile_picture) {
            userData.profile_picture = targetUser.profile_picture;
        }

        try {
            const response = await apiAdmin.put(`/update-user/${targetUser.id}`, userData);
            const newUser = response.data;

            if (selectedUser) {
                setSelectedUser(newUser);
            } else {
                setUser(newUser);
                localStorage.setItem('user', JSON.stringify(newUser));
            }
            showToastOnce("success", "Usuario actualizado con éxito");
            setActionType('view');
            fetchData();
        } catch (error) {
            showToastOnce("error", "Error al actualizar al usuario");
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
            const response = await apiAdmin.post('/create-user', userData);
            const newUser = response.data;
            setSelectedUser(newUser);
            showToastOnce("success", "Usuario creado con éxito");
            setActionType('view');
            setIsOpenModal(false);
            fetchData();
        } catch (error) {
            showToastOnce("error", "Error al crear al usuario");
        }
    };

    const resetPassword = async () => {

        const userId = (selectedUser && selectedUser.id) || (user && user.id);

        const userData = {
            new_password: password,
            reset: true,
        };

        try {
            await apiAdmin.put(`/change-password/${userId}`, userData);
            showToastOnce("success", "Contraseña actualizada");
            setActionType('view');
            setIsOpenModal(false);
            resetForm();
            fetchData();

        } catch (error) {
             showToastOnce("error", "Error al resetear la contraseña");
        }
    };

    const resetPIN = async () => {

        const userId = (selectedUser && selectedUser.id) || (user && user.id);

        const userData = {
            new_pin: pin,
            reset: true,
        };

        try {
            await apiAdmin.put(`/change-pin/${userId}`, userData);
            showToastOnce("success", "PIN actualizado");
            setActionType('view');
            setIsOpenModal(false);
            resetForm();
            fetchData();

        } catch (error) {
             showToastOnce("error", "Error al resetear el PIN");
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedOption, searchTerm]);

    return (
        <div style={{ marginTop: '-18px' }}>

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

                    {loading ? (
                        <div className="loader-container" style={{ marginLeft: '-93px' }}>
                            <PuffLoader color={tertiaryColor} loading={loading} size={60} />
                        </div>
                    ) : (
                        <>
                            <DataTable
                                data={allUsers}
                                columns={columns}
                                highlightRows={false}
                                initialPageSize={responsivePageSizeUsers}
                            />
                        </>
                    )}

                </div>

                <div className="general-user-left">
                    <div className="container-user-information">
                        <div>
                            <div className="container-button-edit-user">
                                <label className="label-title-view">
                                    {actionType === 'edit' ? 'Editar' : (actionType === 'add' ? 'Agregar usuario' : '')}
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
                                        {selectedUser ? selectedUser.unumber : user.unumber}
                                    </label>
                                )}
                                {actionType === 'view' ? (
                                    <>
                                        <label className="label-user-name">
                                            {selectedUser ? selectedUser.username : user.username}
                                        </label>
                                        <label className="label-rol-user">
                                            {selectedUser ? userTypeMaping[selectedUser.user_type] : userTypeMaping[user.user_type]}
                                        </label>
                                    </>

                                ) : (
                                    <div className="scrol-user">
                                        <div className="label-name-user-container">
                                            <label className="label-name-user">Nombre de usuario</label>
                                            <div className="input-form-new-user">
                                                <input
                                                    className="input-name-user"
                                                    value={username}
                                                    onChange={(e) => {
                                                        setUsername(e.target.value);
                                                    }}
                                                    readOnly={actionType === 'view'}
                                                />

                                                <img
                                                    src={nameIcon}
                                                    alt="Name user Icon"
                                                    className="input-new-user-icon"
                                                />
                                            </div>

                                        </div>
                                        <div className="label-name-user-container">
                                            <label className="label-name-user">Rol</label>
                                            <Select
                                                isSearchable={false}
                                                styles={selectStyles}
                                                options={roleOptions}
                                                value={roleOptions.find(option => option.value === role)}
                                                placeholder={<CustomPlaceholderWithLabel />}
                                                components={{
                                                    SingleValue: CustomSingleValueWithLabel
                                                }}
                                                onChange={selectedOption => {
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
                                                    setStatus(selectedOption.value);
                                                }}
                                                isDisabled={actionType === 'add'}
                                            />

                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="container-status-user">
                                {actionType === 'view' && (
                                    <>
                                        <label className="label-status-user">Estado:</label>
                                        <label className="label-status" style={{ color: statusColors[selectedUser ? userStatusMaping[selectedUser.user_status] : userStatusMaping[user.user_status]] }}>
                                            {selectedUser ? userStatusMaping[selectedUser.user_status] : userStatusMaping[user.user_status]}
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
                        <div style={{ display: 'flex' }}>
                            <h3>
                                {modalAction === 'create' && 'Credenciales de acceso'}
                                {modalAction === 'resetPassword' && 'Ingrese una contraseña temporal'}
                                {modalAction === 'resetPin' && 'Ingrese un PIN temporal'}
                            </h3>
                            <button style={{ marginTop: '16px' }} className="button-close-modal" onClick={closeModal}  >
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
                                    <div className="input-form-new-user-modal">
                                        <img
                                            src={passwordIcon}
                                            alt="Password Icon"
                                            className="input-new-user-icon"
                                        />
                                        <input
                                            type="text"
                                            value={password}
                                            onChange={handlePasswordChange}
                                        />
                                    </div>

                                </div>
                            )}
                            {passwordError && <span style={{ color: 'red' }}>{passwordError}</span>}

                            {/* Input de PIN para las acciones 'create' y 'resetPin' */}
                            {(modalAction === 'create' || modalAction === 'resetPin') && (
                                <div>
                                    <label>Ingrese el pin</label>
                                    <div className="input-form-new-user-modal">
                                        <img
                                            style={{ left: '73px' }}
                                            src={pinIcon}
                                            alt="Pin Icon"
                                            className="input-new-user-icon"
                                        />
                                        <input
                                            type="number"
                                            style={{ marginLeft: '63px', width: '154px', paddingLeft: '43px' }}
                                            value={pin}
                                            onChange={handlePinChange}
                                        />


                                    </div>

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