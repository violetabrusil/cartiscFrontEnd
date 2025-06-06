import React, { useEffect, useState } from "react";

function Footer() {
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const contentContainer = document.getElementById("content-container");
      setContentHeight(contentContainer.getBoundingClientRect().height);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const styleFooter = {
    width: "100%",
    backgroundColor: "var(--primary-color)",
    color: "var(--white)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    bottom: 0,
    height: "60px",
    marginTop: contentHeight > window.innerHeight ? "0" : window.innerHeight - contentHeight + "px",
  };

  const legendStyle = {
    position: 'absolute',
    textAlign: 'center',
    fontSize: '13px',
    bottom: '10px',
    right: '10px',
    color: 'var(--white)',
    zIndex: 1000 
  };

  return (
    <>
      <div style={{ position: 'relative' }} id="content-container">
        {/* Aquí va el contenido de tu página */}
      </div>
      <div style={legendStyle}>
        Creaciones Tecnológicas Sierra. Version 1.3.71
      </div>

      <footer style={styleFooter}></footer>
    </>
  );
}

export default Footer;
