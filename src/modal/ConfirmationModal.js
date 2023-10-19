import "../Modal.css";
import React, { useState } from 'react';

const quesionIcon = process.env.PUBLIC_URL + "/images/icons/question-icon.png"

export const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, showNotes }) => {

    console.log('Valor de showNotes:', showNotes);

    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    return (
        <div className="filter-modal-overlay">
            <div className="filter-modal">
                <div style={{ textAlign: 'center' }}>
                    <img src={quesionIcon} alt="Question icon" className="icon-question" />
                </div>
                <h3 style={{ textAlign: 'center', marginTop: '3px' }}>{title}</h3>
                <p className="modal-message">{message}</p>

                {showNotes && (
                    <div>
                        <label style={{fontWeight: '700', marginLeft: '17px'}}>Notas</label>
                        <div style={{marginTop: '10px', textAlign: 'center'}}>
                            <textarea
                                className="notes-textarea "
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)} />
                        </div>

                    </div>
                )}

                <div className="button-options">
                    <div className="half">
                        <button className="optionNo-button" onClick={onCancel}>
                            No
                        </button>
                    </div>
                    <div className="half">
                        <button className="optionYes-button" onClick={() => onConfirm(notes)}>
                            Si
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

