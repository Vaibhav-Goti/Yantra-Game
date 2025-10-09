import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  FaGamepad, 
  FaTrophy, 
  FaUser, 
  FaHistory, 
  FaWallet, 
  FaCog,
  FaChartBar,
  FaUsers
} from 'react-icons/fa';

// Import components
import ManualWinnerSelector from '../components/game/ManualWinnerSelector';
import JackpotManagement from '../components/game/JackpotManagement';
import MachineTransactionHistory from '../components/game/MachineTransactionHistory';
import MachineBalanceManagement from '../components/game/MachineBalanceManagement';

const GameManagement = () => {
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'balance');

  // useEffect(() => {
  //   const handleHashChange = () => {
  //     const hashTab = window.location.hash.replace('#', '');
  //     if (hashTab) setActiveTab(hashTab);
  //   };
  
  //   // Run once in case page already has a hash
  //   handleHashChange();
  
  //   // Listen for browser back/forward buttons
  //   window.addEventListener('hashchange', handleHashChange);
  
  //   // Cleanup
  //   return () => {
  //     window.removeEventListener('hashchange', handleHashChange);
  //   };
  // }, []);  

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // window.location.hash = tabId; // Update hash in URL
    localStorage.setItem('activeTab', tabId);
  };

  const tabs = [
    {
      id: 'balance',
      label: 'Balance Management',
      icon: FaWallet,
      component: MachineBalanceManagement,
      description: 'Manage machine deposits and withdrawals'
    },
    {
      id: 'manual-winners',
      label: 'Manual Winners',
      icon: FaUser,
      component: ManualWinnerSelector,
      description: 'Configure manual winner button selection'
    },
    {
      id: 'jackpot',
      label: 'Jackpot Management',
      icon: FaTrophy,
      component: JackpotManagement,
      description: 'Set up jackpot winner configurations'
    },
    {
      id: 'history',
      label: 'Transaction History',
      icon: FaHistory,
      component: MachineTransactionHistory,
      description: 'View machine transaction and game session history'
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaGamepad className="mr-3 text-blue-600" />
                Game Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage manual winners, jackpot configurations, and machine transactions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Machines</div>
                <div className="text-2xl font-bold text-blue-600">-</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Active Sessions</div>
                <div className="text-2xl font-bold text-green-600">-</div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Tab Navigation */}
        <Card>
          <CardBody className="p-0">
            <div className="border-b border-gray-200">
              <nav className="flex flex-wrap space-x-2 sm:space-x-8 px-4 sm:px-6 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`flex items-center py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                        isActive
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </CardBody>
        </Card>

        {/* Tab Description */}
        <Card>
          <CardBody>
            <div className="flex items-center">
              {(() => {
                const activeTabData = tabs.find(tab => tab.id === activeTab);
                const Icon = activeTabData?.icon;
                return (
                  <>
                    {Icon && <Icon className="mr-3 text-blue-600" />}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {activeTabData?.label}
                      </h3>
                      <p className="text-gray-600">
                        {activeTabData?.description}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardBody>
        </Card>

        {/* Active Component */}
        {ActiveComponent && <ActiveComponent />}
      </div>
    </>
  );
};

export default GameManagement;
