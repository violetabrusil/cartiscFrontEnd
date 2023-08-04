import React, { useEffect, useState } from "react";
import '../Header.css'

const photo = process.env.PUBLIC_URL + "/images/user.png";
const logo = process.env.PUBLIC_URL + "/images/ingenieria-mecatronica.png";

function Header({ showIcon, showPhoto, showUser, showRol }) {

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        // Limpia la suscripción al evento resize cuando el componente se desmonte
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const styleHeader = {
        padding: '10px',
        background: '#0C1F31',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '0px',
        height: '60px',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        "@media screen and (maxWidth: 600px)": {
            flexDirection: 'column',
            alignItems: 'flex-end',
},

    };

const styleHeaderLarge = {
    ...styleHeader,
    flexDirection: 'row',
    justifyContent: 'space-around'
};

const isWindowLarge = windowWidth > 768;

return (
    <header style={isWindowLarge ? styleHeaderLarge : styleHeader}>
        <div className="header-left">
            {showIcon && <img src={logo} alt="Mecatronica" className="icon-image" />}
        </div>

        <div className="header-right">
            {showPhoto && <img src={photo} alt="Imagen" className="profile-image" />}
            <div className="profile-text">
                <label className="profile-name">{showUser}</label>
                <label className="profile-role">{showRol}</label>
            </div>
        </div>
    </header>
)
}

export default Header;