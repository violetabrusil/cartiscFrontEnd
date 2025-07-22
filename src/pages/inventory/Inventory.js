import React, { useState, useEffect } from "react";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Products from "./Products";
import Stock from "./Stock";
import Location from "./Location";

const Inventory = () => {

    const [activeTab, setActiveTab] = React.useState(0);
    const [viewMode, setViewMode] = useState('general');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showTabs, setShowTabs] = useState(true);

    useEffect(() => {
        if (activeTab === 0) {
            setSelectedProduct(null);
        }
        setViewMode('general');
    }, [activeTab])

    return (
        <div>

            <Header showIconCartics={true} showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu onInventoryClick={() => {
                setActiveTab(0);
                setViewMode('general');
            }} />

            <div className="container-inventory">
                <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>

                    {showTabs && (
                        <TabList>
                            <Tab>Productos</Tab>
                            <Tab>Stock</Tab>
                            <Tab>Localización</Tab>
                        </TabList>

                    )}

                    <TabPanel>
                        <Products
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            selectedProduct={selectedProduct}
                            setSelectedProduct={setSelectedProduct}
                            setShowTabs={setShowTabs} />
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