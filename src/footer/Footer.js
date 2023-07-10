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
    backgroundColor: "#0C1F31",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    bottom: 0,
    height: "60px",
    marginTop: contentHeight > window.innerHeight ? "0" : window.innerHeight - contentHeight + "px",
  };

  return (
    <>
      <div id="content-container">
        {/* Aquí va el contenido de tu página */}
      </div>
      <footer style={styleFooter}></footer>
    </>
  );
}

export default Footer;
