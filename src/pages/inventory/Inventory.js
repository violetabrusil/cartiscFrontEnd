import "../../Inventory.css"
import React from "react";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Products from "./Products";


const Inventory = () => {

    return (
        <div>

            <Header showIcon={true} showPhoto={true} showUser="Name User" showRol="Rol" />
            <Menu />

            <div className="container-inventory">
                <Tabs>

                    <TabList>
                        <Tab>Producto</Tab>
                        <Tab>Stock</Tab>
                        <Tab>Ubicación</Tab>
                    </TabList>

                    <TabPanel>
                        <Products />
                    </TabPanel>

                    <TabPanel>
                        <h2>Componente Stock</h2>
                    </TabPanel>

                    <TabPanel>
                        <h2>Componente Ubicación</h2>
                    </TabPanel>

                </Tabs>

            </div>



        </div>

    )

};

export default Inventory;