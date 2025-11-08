import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Table from "../components/ui/Table";
import Pagination from "../components/Paginate";
import Dropdown, {
  DropdownItem,
  DropdownHeader,
  DropdownDivider,
} from "../components/ui/Dropdown";
import Loading, { LoadingOverlay, LoadingPage } from "../components/ui/Loading";
import { useGetMachines } from "../hooks/useMachine";
import { useGameSessions } from "../hooks/useGameSessions";
import { formatDateTime } from "../utils/timeUtils";
import { useSocket } from "../contexts/SocketContext";
import { queryClient } from "../apis/apiUtils";

function MachineGameSessions() {
  const navigate = useNavigate();
  const [machineFilter, setMachineFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { machineId } = useParams();
  const [isLive, setIsLive] = useState(false);

  // Socket.io for real-time updates
  const { socket, isConnected } = useSocket();

  // console.log(page, limit)
  const { data: machinesData, isPending: isMachinesPending, isError: isMachinesError, error: machinesError } = useGetMachines()
  const { data: gameSessionsData, isPending: isGameSessionsPending, isError: isGameSessionsError, error: gameSessionsError } = useGameSessions({ page, limit, status: 'Completed', machineId: machineId })
  const { data: liveGameSessionsData, isPending: isLiveGameSessionsPending, isError: isLiveGameSessionsError, error: liveGameSessionsError } = useGameSessions({ status: 'Active', machineId: machineId })

  // Initialize isLive from liveGameSessionsData (source of truth) and reset when machineId changes
  useEffect(() => {
    setIsLive(false); // Reset when machine changes
    if (liveGameSessionsData?.data) {
      setIsLive(liveGameSessionsData.data.length > 0);
    }
  }, [liveGameSessionsData, machineId]);

  // Set default machine when machines data loads
  useEffect(() => {
    if (machinesData?.data?.length > 0 && machineFilter === "All") {
      // Set the first machine as default
      setMachineFilter(machinesData.data[0]._id);
    }
  }, [machinesData, machineFilter]);

  // Listen to Socket.io events for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for new game session started
    const handleGameSessionStarted = (data) => {
      // Only update if it's for the current machine
      if (data.machineId === machineId) {
        // Optimistically update isLive for immediate UI feedback
        if (data.isLive !== undefined) {
          setIsLive(data.isLive);
        }
        // Invalidate and refetch live sessions (source of truth - will sync state)
        queryClient.invalidateQueries({ queryKey: ['gameSessions', { status: 'Active', machineId: machineId }] });
        queryClient.invalidateQueries({ queryKey: ['machines'], exact: false })
      }
    };

    // Listen for button presses updated
    const handleButtonPressesUpdated = (data) => {
      // Only update if it's for the current machine
      if (data.machineId === machineId) {
        // Optimistically update isLive for immediate UI feedback
        if (data.isLive !== undefined) {
          setIsLive(data.isLive);
        }
        // Invalidate and refetch live sessions (source of truth - will sync state)
        queryClient.invalidateQueries({ queryKey: ['gameSessions', { status: 'Active', machineId: machineId }] });
        queryClient.invalidateQueries({ queryKey: ['machines'], exact: false });
      }
    };

    const handleGameSessionCompleted = (data) => {
      if (data.machineId === machineId) {
        // Optimistically update isLive for immediate UI feedback
        if (data.isLive !== undefined) {
          setIsLive(data.isLive);
        }
        // Invalidate and refetch live sessions (source of truth - will sync state)
        queryClient.invalidateQueries({ queryKey: ['gameSessions', { page, limit, status: 'Completed', machineId: machineId }] });
        queryClient.invalidateQueries({ queryKey: ['gameSessions', { status: 'Active', machineId: machineId }] });
        queryClient.invalidateQueries({ queryKey: ['machines'], exact: false });
        }
    };

    socket.on('gameSessionStarted', handleGameSessionStarted);
    socket.on('buttonPressesUpdated', handleButtonPressesUpdated);
    socket.on('gameSessionCompleted', handleGameSessionCompleted);

    // Cleanup listeners on unmount
    return () => {
      socket.off('gameSessionStarted', handleGameSessionStarted);
      socket.off('buttonPressesUpdated', handleButtonPressesUpdated);
      socket.off('gameSessionCompleted', handleGameSessionCompleted);
    };
  }, [socket, isConnected, machineId]);

  // Show loading page if game sessions are loading
  if (isGameSessionsPending) {
    return <LoadingPage text="Loading game sessions..." />;
  }

  // Show error state if game sessions failed to load
  if (isGameSessionsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Failed to load game sessions</div>
          <p className="text-gray-600">{gameSessionsError?.message || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  // Don't block the entire component for machine loading
  // Just show loading in dropdown and handle errors gracefully

  // Handle row click to navigate to session details
  const handleRowClick = (session) => {
    navigate(`/sessions/${session.sessionId}`);
  };

  // Table columns
  const columns = [
    // { 
    //   key: "sessionId", 
    //   label: "Session ID",
    //   render: (row) => (
    //     <span className="font-mono text-sm">{row.sessionId}</span>
    //   )
    // },
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
      key: "winners",
      label: "Winners",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.winners?.length > 0 ? (
            row.winners.map((winner, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                  Button {winner.buttonNumber} - ₹{winner.payOutAmount}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${winner.winnerType === 'jackpot'
                  ? 'bg-purple-100 text-purple-700'
                  : winner.winnerType === 'manual'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700'
                  }`}>
                  {winner.winnerType === 'jackpot' ? '🎰 Jackpot' :
                    winner.winnerType === 'manual' ? '👤 Manual' :
                      '🤖 Auto'}
                </span>
              </div>
            ))
          ) : (
            <span className="text-gray-500 text-xs">No winners</span>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      label: "Total Amount",
      render: (row) => (
        <div>
          <div className="font-medium text-green-600">₹{row.finalAmount}</div>
          <div className="text-xs text-gray-500">Deducted: ₹{row.totalDeductedAmount}</div>
          <div className="text-xs text-gray-500">Bet: ₹{row.totalBetAmount}</div>
        </div>
      ),
    },
    {
      key: "extraAmounts",
      label: "Extra Amounts",
      render: (row) => (
        <div>
          <div className="text-xs text-blue-600">Unused: ₹{row.unusedAmount || 0}</div>
          <div className="text-xs text-purple-600">Added: ₹{row.totalAdded || 0}</div>
          <div className="text-xs text-orange-600">Total Deducted: ₹{row.adjustedDeductedAmount || 0}</div>
        </div>
      ),
    },
    {
      key: "stopTime",
      label: "Stop Time",
      render: (row) => (
        <div>
          <div className="font-medium">{row?.startTime}</div>
          <div className="text-xs text-gray-500">relevant time: {row.gameTimeFrames[0]?.time} ({row.gameTimeFrames[0]?.percentage}%)</div>
        </div>
      )
    },
    {
      key: "Created At",
      label: "Created At",
      render: (row) => (
        <div className="text-xs text-gray-500">{formatDateTime(row.createdAt)}</div>
      )
    },
  ];

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Machine Game Sessions</h3>

        {/* Filter Dropdown */}
        {/* <Dropdown
          trigger={
            <button
              className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 text-sm font-medium flex items-center gap-2"
              disabled={isMachinesPending}
            >
              {isMachinesPending ? <Loading size="sm" /> : null}
              {machineFilter === "All"
                ? "All"
                : machinesData?.data?.find(m => m._id === machineFilter)?.machineName || "Select Machine"
              }
            </button>
          }
          placement="bottom-end"
        >
          <DropdownHeader>Filter by Machine</DropdownHeader>
          <DropdownItem onClick={() => setMachineFilter("All")}>All</DropdownItem>
          {!isMachinesError && machinesData?.data?.length > 0 ? (
            machinesData.data.map((m) => (
              <DropdownItem key={m._id} onClick={() => setMachineFilter(m._id)}>
                {m.machineName}
              </DropdownItem>
            ))
          ) : isMachinesPending ? (
            <DropdownItem disabled className="flex items-center gap-2">
              <Loading size="sm" />
              Loading machines...
            </DropdownItem>
          ) : isMachinesError ? (
            <DropdownItem disabled className="text-red-500">
              Failed to load machines
            </DropdownItem>
          ) : (
            <DropdownItem disabled className="text-gray-500">
              No machines available
            </DropdownItem>
          )}
        </Dropdown> */}
      </CardHeader>

      <CardBody padding="p-0 sm:p-1">
        {/* <LoadingOverlay isLoading={isMachinesPending}>
          {isMachinesError ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-lg mb-2">Failed to load machines</div>
              <p className="text-gray-600">{machinesError?.message || 'Something went wrong'}</p>
            </div>
          ) : machinesData?.data?.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg mb-2">No machines found</div>
              <p className="text-gray-400">Get started by adding your first machine.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4 ">
                {machinesData?.data?.map((machine) => (
                  <Card padding="p-1 sm:p-2" key={machine._id} className="border border-gray-200">
                    <CardHeader
                      padding="p-0 sm:p-2"
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleMachine(machine._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-base sm:text-lg truncate">{machine.machineName}</h4>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">ID: {machine._id}</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </>
          )}
        </LoadingOverlay> */}
        {/* Live Session Section - Only show when a specific machine is selected */}
        {machineFilter !== "All" && (
          <div className="mb-4 sm:mb-6">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader className="bg-blue-100 p-3 sm:p-4">
                <div className="flex flex-row items-center justify-between gap-2 sm:gap-0">
                  <h4 className="text-base sm:text-lg font-semibold text-blue-800 truncate">
                    Live Session - {machinesData?.data?.find(m => m._id === machineId)?.machineName}
                  </h4>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isLiveGameSessionsPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        <span className="text-xs sm:text-sm text-blue-600 font-medium">Loading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className={`text-xs sm:text-sm font-medium ${isLive ? 'text-green-600' : 'text-red-600'}`}>
                          {isLive ? 'LIVE' : 'OFFLINE'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardBody padding="p-3 sm:p-4">
                {isLiveGameSessionsPending ? (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm sm:text-base text-gray-600">Loading live session...</p>
                    </div>
                  </div>
                ) : liveGameSessionsError ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-red-500 text-base sm:text-lg mb-2">Failed to load live session</div>
                    <p className="text-sm sm:text-base text-gray-600">{liveGameSessionsError?.message || 'Something went wrong'}</p>
                  </div>
                ) : liveGameSessionsData?.data?.length > 0 ? (
                  <>

                    {liveGameSessionsData.data.map((liveSession, sessionIndex) => (
                      <div key={sessionIndex} className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                          {liveSession.buttonPresses?.map((button, index) => (
                            <div key={index} className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 shadow-sm">
                              <div className="text-center">
                                <div className="text-sm sm:text-base md:text-lg font-bold text-gray-800">Button {button.buttonNumber}</div>
                                <div className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{button.pressCount || 0}</div>
                                <div className="text-xs text-gray-500">presses</div>
                                <div className="text-xs text-green-600 font-medium mt-0.5">₹{button.totalAmount || button.pressCount * 10}</div>
                              </div>
                            </div>
                          ))}
                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                          <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200">
                            <div className="text-xs sm:text-sm text-gray-500 mb-1">Session ID</div>
                            <div className="text-xs sm:text-sm font-bold text-gray-800 font-mono break-all">{liveSession.sessionId}</div>
                          </div>
                          <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200">
                            <div className="text-xs sm:text-sm text-gray-500 mb-1">Status</div>
                            <div className="text-base sm:text-lg font-bold text-green-600">{liveSession.status}</div>
                          </div>
                          <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200">
                            <div className="text-xs sm:text-sm text-gray-500 mb-1">Total Presses</div>
                            <div className="text-base sm:text-lg font-bold text-blue-600">
                              {liveSession.buttonPresses?.reduce((total, button) => total + (button.pressCount || 0), 0) || 0}
                            </div>
                          </div>

                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-gray-500 text-base sm:text-lg mb-2">No active session</div>
                    <p className="text-sm sm:text-base text-gray-400">This machine doesn't have any active sessions</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* Historical Sessions Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Historical Sessions</h4>
            {isGameSessionsPending && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                <span className="text-sm text-gray-600">Loading sessions...</span>
              </div>
            )}
          </div>

          <LoadingOverlay isLoading={isGameSessionsPending}>
            {gameSessionsData?.data?.length > 0 ? (
              <>
                <Table
                  responsive
                  columns={columns}
                  data={gameSessionsData.data}
                  onRowClick={handleRowClick}
                  clickable
                />
                <Pagination
                  currentPage={gameSessionsData?.currentPage || page}
                  totalPages={gameSessionsData?.totalPages || 1}
                  onPageChange={(p) => setPage(p)}
                  limit={limit}
                  onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1) }}
                  totalItems={gameSessionsData?.count || gameSessionsData.count}
                />
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">
                  {machineFilter === "All" ? 'No game sessions found' : `No sessions found for selected machine`}
                </div>
                <p className="text-gray-400">
                  {machineFilter === "All"
                    ? 'Game sessions will appear here when they are created'
                    : 'Try selecting a different machine or "All" to see all sessions'
                  }
                </p>
              </div>
            )}
          </LoadingOverlay>
        </div>
      </CardBody>
    </Card>
  );
}

export default MachineGameSessions;
