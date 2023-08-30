import "../../Inventory.css"
import React, { useState } from "react";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Products from "./Products";
import Stock from "./Stock";
import Location from "./Location";

const Inventory = () => {

    const [activeTab, setActiveTab] = React.useState(0);
    const [viewMode, setViewMode] = useState('general');

    return (
        <div>

            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu onInventoryClick={() => {
                setActiveTab(0);
                setViewMode('general');
                console.log("Se cambió el viewMode a 'general'")
            }} />

            <div className="container-inventory">
                <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>

                    <TabList>
                        <Tab>Producto</Tab>
                        <Tab>Stock</Tab>
                        <Tab>Ubicación</Tab>
                    </TabList>

                    <TabPanel>
                        <Products viewMode={viewMode} setViewMode={setViewMode} />
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