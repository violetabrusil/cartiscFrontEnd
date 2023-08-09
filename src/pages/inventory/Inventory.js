import "../../Inventory.css"
import React from "react";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Products from "./Products";
import Stock from "./Stock";
import Location from "./Location";

const Inventory = () => {

    return (
        <div>

             <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} />
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
                        <Stock />
                    </TabPanel>

                    <TabPanel>
                        <Location />
                    </TabPanel>

                </Tabs>

            </div>



        </div>

    )

};

export default Inventory;