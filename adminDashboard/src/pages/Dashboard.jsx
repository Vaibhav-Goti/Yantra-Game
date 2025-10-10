import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout'; // adjust path if needed
import Card, { CardHeader, CardBody } from '../components/ui/Card'; // adjust path
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
  } from 'recharts';
import { useDashboardStats } from '../hooks/useDashboard';
import { useGameSessions } from '../hooks/useGameSessions';
import Loading, { LoadingPage } from '../components/ui/Loading';
import { useGetMachines } from '../hooks/useMachine';

function Dashboard() {
  const navigate = useNavigate();
  const { stats, sessionsData, machineStatus, isLoading, isError } = useDashboardStats();
  const { data: gameSessionsData, isPending: isGameSessionsPending, isError: isGameSessionsError } = useGameSessions({ page: 1, limit: 10 });
  const { data: machinesData, isPending: isMachinesPending, isError: isMachinesError } = useGetMachines();
  // Show loading state
  if (isLoading) {
    return <LoadingPage text="Loading dashboard..." />;
  }

  // Show error state
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Failed to load dashboard</div>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#34d399', '#f87171'];

  // Dummy data for Deposit Amount per Machine
  const depositAmountData = [
    { name: 'Machine 1', depositAmount: 25000,},
    { name: 'Machine 2', depositAmount: 32000,},
    { name: 'Machine 3', depositAmount: 28000,},
    { name: 'Machine 4', depositAmount: 35000,},
    { name: 'Machine 5', depositAmount: 42000,},
    { name: 'Machine 6', depositAmount: 30000,},
    { name: 'Machine 7', depositAmount: 38000,},
    { name: 'Machine 8', depositAmount: 26000,}
  ];

  return (
    <>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} hover>
            <CardHeader className="flex items-center justify-between bg-white border-0 px-0 py-0">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
            </CardHeader>
            <CardBody className="px-0 py-2">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-sm font-medium ${stat.color}`}>{stat.change}</p>
            </CardBody>
          </Card>
        ))}
      </div>

       {/* Charts Section */}
       {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 mt-6">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-gray-700">Sessions per Day</h3>
          </CardHeader>
          <CardBody className="p-0 h-64 flex items-center justify-between">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessionsData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-gray-700">Machine Status</h3>
          </CardHeader>
          <CardBody className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={machineStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {machineStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div> */}

      {/* Deposit Amount per Machine Chart */}
      {/* <div className="grid grid-cols-1 gap-6 mb-6">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-gray-700">Deposit Amount per Machine</h3>
          </CardHeader>
          <CardBody className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machinesData?.data?.length > 0 ? machinesData?.data.map(val => {
                return {
                  name: val?.machineName,
                  depositAmount: val?.depositAmount,
                }
              }) : depositAmountData} margin={{ top: 20, right: 0, left: -20, bottom: -20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    `₹${value.toLocaleString()}`, 
                    name === 'depositAmount' ? 'Deposit Amount' : 'Bet Amount'
                  ]}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar 
                  dataKey="depositAmount" 
                  fill="#3b82f6" 
                  name="Deposit Amount"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div> */}

      {/* Game Sessions Table */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Recent Game Sessions</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/sessions')}
              className="text-xs"
            >
              Show All
            </Button>
          </CardHeader>
          <CardBody>
            {isGameSessionsPending ? (
              <div className="flex items-center justify-center py-8">
                <Loading size="lg" />
              </div>
            ) : isGameSessionsError ? (
              <div className="text-center py-8">
                <div className="text-red-500 text-lg mb-2">Failed to load game sessions</div>
                <p className="text-gray-600">Please try again later</p>
              </div>
            ) : gameSessionsData?.data?.length > 0 ? (
              <Table
                responsive
                columns={[
                  {
                    key: "machine",
                    label: "Machine",
                    render: (row) => (
                      <div>
                        <div className="font-medium">{row?.machineId?.machineName}</div>
                        <div className="text-xs text-gray-500">#{row?.machineId?.machineNumber}</div>
                      </div>
                    )
                  },
                  {
                    key: "amount",
                    label: "Amount",
                    render: (row) => (
                      <div>
                        <div className="font-medium text-green-600">₹{row.finalAmount}</div>
                        <div className="text-xs text-gray-500">Bet: ₹{row.totalBetAmount}</div>
                      </div>
                    )
                  },
                  {
                    key: "winners",
                    label: "Winners",
                    render: (row) => (
                      <div className="flex flex-wrap gap-1">
                        {row.winners?.length > 0 ? (
                          row.winners.slice(0, 2).map((winner, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                            >
                              B{winner.buttonNumber}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-xs">No winners</span>
                        )}
                        {row.winners?.length > 2 && (
                          <span className="text-xs text-gray-500">+{row.winners.length - 2} more</span>
                        )}
                      </div>
                    )
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (row) => (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row.status === 'Completed' 
                          ? 'bg-green-100 text-green-700' 
                          : row.status === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {row.status}
                      </span>
                    )
                  },
                  {
                    key: "createdAt",
                    label: "Created",
                    render: (row) => (
                      <div className="text-xs text-gray-500">
                        {row.createdAt}
                      </div>
                    )
                  }
                ]}
                data={gameSessionsData?.data || []}
              />
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">No game sessions found</div>
                <p className="text-gray-400">Game sessions will appear here when they are created</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}

export default Dashboard;
