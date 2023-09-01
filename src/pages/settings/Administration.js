import "../../Administration.css";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Select from 'react-select';

const Administration = () => {

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
        { value: 'inventory', label: 'Inventario' },
    ];

    return (
        <div style={{ marginTop: '-18px' }}>
            <ToastContainer />
            <div className="administration-container-title">
                <label>Registros suspendidos</label>
            </div>

            <div className="div-select-administration">
                <div>
                    
                <Select
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

        </div>

    )

};

export default Administration;