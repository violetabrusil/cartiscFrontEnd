import React, { useEffect, useRef, useState } from "react";
import "./CustomModal.css";
import { PuffLoader } from "react-spinners";
import CustomButton from "../../buttons/customButton/CustomButton";
import Icon from "../../components/Icons";
import DataTable from "../../dataTable/DataTable";
import ScrollListWithIndicators from "../../components/ScrollListWithIndicators";

import useCSSVar from "../../hooks/UseCSSVar";

export default function CustomModal({
    isOpen,
    onClose,
    type,
    title = '',
    subTitle = '',
    description = '',
    onConfirm,
    onCancel,
    onSearchChange,
    activeTab,
    handleTabChange,
    searchClientTerm,
    searchOperationTerm,
    clients,
    handleClientSelect,
    options,
    onSelect,
    defaultOption,
    showCloseButton = true,
    borderColor = '',
    icon = null,
    operation,
    columnsForOperations,
    onAddOperation,
    addIcon,
    responsivePageSizeOperations,
}) {

    const tertiaryColor = useCSSVar('--tertiary-color');
    const modalRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState(defaultOption || null);

    useEffect(() => {
        if (defaultOption) {
            setSelectedOption(defaultOption);
        }
    }, [defaultOption]);

    const defaultBorderColor = {
        'search-client': 'blue',
        'search-operation': 'blue',
        'confirm-suspend': 'yellow',
        'confirm-workorder': 'green',
        'confirm-vehicle': 'green',
        'filter-options': 'blue',
        'confirm-delete': 'red',
    }[type];

    const defaultIcon = {
        'search-client': <Icon name="search" className="icon-background" />,
        'search-operation': <Icon name="search" className="icon-background" />,
        'confirm-suspend': <Icon name="alert" className="floating-icon" />,
        'confirm-workorder': <Icon name="newOrder" className="icon-confirm" />,
        'confirm-vehicle': <Icon name="addVehicle" className="icon-confirm" />,
        'filter-options': <Icon name="search" className="icon-background" />,
        'confirm-delete': <Icon name="delete" className="delete-icon" />
    }[type];

    const color = borderColor || defaultBorderColor || '';
    const finalIcon = icon || defaultIcon;

    useEffect(() => {
        if (!isOpen) {
            setLoading(true);
            return;
        }
        const timeoutId = setTimeout(() => {
            setLoading(false);
        }, 200);

        return () => clearTimeout(timeoutId);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setSelectedOption(defaultOption || null);
        }
    }, [isOpen, defaultOption]);


    if (!isOpen) return null;

    if (!isOpen) return null;

    const renderContent = () => {

        switch (type) {
            case 'search-client':
                return (
                    <>
                        <div className="tabs">
                            <button
                                className={`button-tab ${activeTab === 'nombre' ? 'active' : ''}`}
                                onClick={() => handleTabChange('nombre')}
                            >
                                Nombre
                                <div className="line"></div>
                            </button>
                            <button
                                className={`button-tab ${activeTab === 'cédula' ? 'active' : ''}`}
                                onClick={() => handleTabChange('cédula')}
                            >
                                Cédula
                                <div className="line"></div>
                            </button>
                        </div>

                        <div className="search-client-box">
                            <Icon name="search" className="search-client-icon" />
                            <input
                                className="input-search-client"
                                value={searchClientTerm}
                                onChange={onSearchChange}
                                placeholder={`Buscar por ${activeTab}`}
                            />
                        </div>

                        <div className="container-client-table">
                            {clients?.length > 0 && (
                                <ScrollListWithIndicators style={{ maxHeight: "400px" }}>
                                    <table className="client-table">
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Cédula</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clients.map(client => (
                                                <tr
                                                    key={client.client.id}
                                                    onClick={(event) => handleClientSelect(client.client.id, event)}
                                                >
                                                    <td>{client.client.name}</td>
                                                    <td>{client.client.cedula}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </ScrollListWithIndicators>
                            )}
                        </div>
                    </>
                );

            case 'confirm-suspend':
                return (
                    <>
                        <div className="button-options">
                            <CustomButton
                                variant="alert-second"
                                onClick={onCancel}
                                title="Cancelar"
                            />
                            <CustomButton
                                variant="alert"
                                onClick={onConfirm}
                                title="Suspender"
                            />
                        </div>
                    </>
                );

            case 'confirm-delete':
                return (
                    <>
                        <div className="button-options">
                            <CustomButton
                                variant="alert-second"
                                onClick={onCancel}
                                title="Cancelar"
                            />
                            <CustomButton
                                variant="delete"
                                onClick={onConfirm}
                                title="Eliminar"
                            />
                        </div>
                    </>
                );

            case 'confirm-workorder':
                return (
                    <>
                        <div className="button-options">
                            <CustomButton
                                variant="confirm-second"
                                onClick={onCancel}
                                title="Cancelar"
                            />
                            <CustomButton
                                variant="confirm"
                                onClick={onConfirm}
                                title="Registrar"
                            />
                        </div>
                    </>
                );

            case 'confirm-vehicle':
                return (
                    <>
                        <div className="button-options">
                            <CustomButton
                                variant="confirm-second"
                                onClick={onCancel}
                                title="Cancelar"
                            />
                            <CustomButton
                                variant="confirm"
                                onClick={onConfirm}
                                title="Registrar"
                            />
                        </div>
                    </>
                );

            case 'filter-options':
                return (
                    <>
                        <div className="filter-options-grid" >
                            {options.map(option => {
                                const isSelected = selectedOption === option.value;
                                return (
                                    <div
                                        key={option.value}
                                        className={`filter-option-card ${isSelected ? 'selected' : ''}`}
                                        onClick={() => setSelectedOption(option.value)}
                                    >
                                        <div className="option-icon">
                                            <Icon
                                                name={option.iconName}
                                                className={`option-icon ${isSelected ? 'icon-selected' : 'icon-unselected'}`}
                                            />
                                        </div>
                                        <div className={`option-label ${isSelected ? 'label-selected' : 'label-unselected'}`}>{option.label}</div>
                                        {isSelected && (
                                            <input
                                                type="radio"
                                                checked
                                                readOnly
                                                className="option-radio"
                                            />
                                        )}
                                    </div>
                                );
                            })}



                        </div>

                        <div className="button-options" style={{ justifyContent: 'right' }}>
                            <CustomButton
                                variant="select"
                                onClick={() => {
                                    onSelect(selectedOption);
                                    onCancel();
                                }}
                                title="Seleccionar"
                            />
                        </div>

                    </>

                )

            case 'search-operation':
                return (
                    <>
                        <div className="tabs">
                            <button
                                className={`button-tab ${activeTab === 'título' ? 'active' : ''}`}
                                onClick={() => handleTabChange('título')}
                            >
                                Título
                                <div className="line"></div>
                            </button>
                            <button
                                className={`button-tab ${activeTab === 'código' ? 'active' : ''}`}
                                onClick={() => handleTabChange('código')}
                            >
                                Código
                                <div className="line"></div>
                            </button>
                        </div>

                        <div className="search-client-box">
                            <Icon name="search" className="search-client-icon" />
                            <input
                                className="input-search-client"
                                value={searchOperationTerm}
                                onChange={onSearchChange}
                                placeholder={`Buscar por ${activeTab}`}
                            />
                        </div>

                        {operation.length > 0 && (
                            <>
                                <div className="title-list-container">
                                    <span className="title-list-name">Lista de operaciones</span>
                                </div>

                                <DataTable
                                    data={operation}
                                    columns={columnsForOperations}
                                    addIconSrc={addIcon}
                                    onAddOperation={onAddOperation}
                                    initialPageSize={responsivePageSizeOperations}
                                />

                            </>
                        )}

                    </>
                );
            default:
                return <p>Tipo de modal no soportado</p>;
        }
    };

    return (
        <>
            {loading && (
                <div className="modal-loader-container">
                    <PuffLoader color={tertiaryColor} loading={true} size={60} />
                </div>
            )}

            <div
                className="custom-modal-overlay"
                style={{
                    opacity: loading ? 0 : 1,
                    pointerEvents: loading ? 'none' : 'auto',
                }}
            >

                <div ref={modalRef} className={`custom-modal border-${color} ${type === 'search-client' ? 'wide' : ''}`}>
                    {/* Ícono flotante: está fijo en pantalla con posición calculada */}
                    {color && finalIcon && !loading && (
                        <div className={`modal-floating-icon bg-${color}`}>
                            {finalIcon}
                        </div>

                    )}
                    <div className="modal-header">
                        {title && <h3 className="modal-title">{title}</h3>}
                        {showCloseButton && (
                            <div className="modal-close-button" onClick={onClose}>
                                <Icon name="close" className="modal-close-icon" />
                            </div>
                        )}
                    </div>

                    {(subTitle || description) && (
                        <div className="modal-text-content">
                            {subTitle && <div className="modal-subTitle">{subTitle}</div>}
                            {description && <div className="modal-description">{description}</div>}
                        </div>
                    )}

                    {renderContent()}


                </div>
            </div>


        </>



    );
}
