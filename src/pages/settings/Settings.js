import "../../Settings.css"
import React, { useState } from "react";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";import Users from "./Users";
import Administration from "./Administration";
;

const Settings = () => {

    const [activeTab, setActiveTab] = React.useState(0);
    const [viewMode, setViewMode] = useState('general');

    return (
        <div>

            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu onSettingsClick={() => {
                setActiveTab(0);
                setViewMode('general');
            }} />

            <div className="container-settings">
                <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>

                    <TabList>
                        <Tab>Usuarios</Tab>
                        <Tab>Administración</Tab>
                    </TabList>

                    <TabPanel>
                        <Users />
                        
                    </TabPanel>

                    <TabPanel>
                        <Administration />
                    </TabPanel>

                </Tabs>

            </div>


        </div>

    )

};

export default Settings;