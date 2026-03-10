export const selectStyles = {
    control: (base, state) => ({
        ...base,
        width: '220px',
        height: '40px',
        minHeight: '40px',
        border: state.isFocused
            ? '1.5px solid rgba(0,0,0,0.35)'
            : '1.5px solid rgba(0,0,0,0.12)',
        borderRadius: '8px',
        padding: '0 4px',
        boxSizing: 'border-box',
        marginRight: '0px',
        marginLeft: '0px',
        boxShadow: state.isFocused
            ? '0 1px 6px rgba(0,0,0,0.10)'
            : '0 1px 3px rgba(0,0,0,0.06)',
        background: '#ffffff',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
            borderColor: 'rgba(0,0,0,0.28)',
        },
    }),

    placeholder: (base) => ({
        ...base,
        color: '#b0acaa',
        fontSize: '13px',
        fontWeight: 500,
    }),

    singleValue: (base) => ({
        ...base,
        color: '#1a1a18',
        fontSize: '13.5px',
        fontWeight: 500,
    }),

    dropdownIndicator: (base, state) => ({
        ...base,
        color: state.isFocused ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.3)',
        padding: '0 6px',
        transition: 'color 0.2s ease, transform 0.2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    }),

    indicatorSeparator: () => ({
        display: 'none',
    }),

    menu: (base) => ({
        ...base,
        width: '220px',
        borderRadius: '8px',
        border: '1.5px solid rgba(0,0,0,0.09)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
        overflow: 'hidden',
        marginTop: '4px',
    }),

    menuList: (base) => ({
        ...base,
        padding: '4px',
    }),

    option: (base, state) => ({
        ...base,
        fontSize: '13.5px',
        borderRadius: '6px',
        padding: '8px 12px',
        cursor: 'pointer',
        color: state.isSelected ? '#1a1a18' : '#444',
        backgroundColor: state.isSelected
            ? '#f0ede8'
            : state.isFocused
                ? '#faf9f7'
                : 'transparent',
        fontWeight: state.isSelected ? 600 : 400,
        transition: 'background-color 0.15s ease',
        '&:active': {
            backgroundColor: '#ece9e3',
        },
    }),
}