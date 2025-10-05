import React, { useState } from "react";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Table from "../components/ui/Table";
import Pagination from "../components/Paginate";
import Dropdown, {
  DropdownItem,
  DropdownHeader,
  DropdownDivider,
} from "../components/ui/Dropdown";
import Loading, { LoadingOverlay, LoadingPage } from "../components/ui/Loading";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "../components/ui/Modal";
import Button from "../components/ui/Button";
import { useGetMachines } from "../hooks/useMachine";
import { useGameSessions } from "../hooks/useGameSessions";

function GameSessions() {
  const [machineFilter, setMachineFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // console.log(page, limit)
  const {data: machinesData, isPending: isMachinesPending, isError: isMachinesError, error: machinesError} = useGetMachines()
  const {data: gameSessionsData, isPending: isGameSessionsPending, isError: isGameSessionsError, error: gameSessionsError} = useGameSessions({page, limit, ...(machineFilter !== "All" && { machineId: machineFilter }) })

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

  // Handle row click to open modal
  const handleRowClick = (session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
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
              <span
                key={i}
                className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
              >
                Button {winner.buttonNumber} - ₹{winner.payOutAmount}
              </span>
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
        <div className="text-xs text-gray-500">{row.createdAt}</div>
      )
    },
  ];

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Game Sessions</h3>

        {/* Filter Dropdown */}
        <Dropdown
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
          
          {/* Show machines if loaded successfully */}
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
          
          {/* <DropdownDivider />
            <DropdownItem onClick={() => setMachineFilter("Today")}>
              Today
            </DropdownItem> */}
        </Dropdown>
      </CardHeader>

      <CardBody>
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
              onLimitChange={(newLimit) => {setLimit(newLimit); setPage(1)}}
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
      </CardBody>

      {/* Session Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        size="xl"
        closeOnOverlayClick={true}
        showCloseButton={true}
      >
        <ModalHeader onClose={handleModalClose}>
          <h3 className="text-lg font-semibold text-gray-900">Game Session Details</h3>
        </ModalHeader>

        <ModalBody className="max-h-96 overflow-y-auto">
          {selectedSession && (
            <div className="space-y-6">
              {/* Session Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Session ID</label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">{selectedSession.sessionId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-sm font-medium text-green-600">{selectedSession.status}</p>
                </div>
              </div>

              {/* Machine Info */}
              <div>
                <label className="text-sm font-medium text-gray-500">Machine</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">{selectedSession.machineId?.machineName}</p>
                  <p className="text-xs text-gray-500">#{selectedSession.machineId?.machineNumber}</p>
                </div>
              </div>

              {/* Time Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Stop Time</label>
                  <p className="text-sm font-medium">{selectedSession.startTime}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Relevant Time Frame</label>
                  <p className="text-sm">
                    {selectedSession.gameTimeFrames[0]?.time} ({selectedSession.gameTimeFrames[0]?.percentage}%)
                  </p>
                </div>
              </div>

              {/* Amount Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Total Bet Amount</label>
                  <p className="text-lg font-bold text-green-600">₹{selectedSession.totalBetAmount}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Total Deducted</label>
                  <p className="text-lg font-bold text-red-600">₹{selectedSession.totalDeductedAmount}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Final Amount</label>
                  <p className="text-lg font-bold text-blue-600">₹{selectedSession.finalAmount}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Deduction Percentage</label>
                  <p className="text-lg font-bold text-yellow-600">{selectedSession.gameTimeFrames[0]?.deductedPercentage}%</p>
                </div>
              </div>

              {/* Extra Amounts */}
              <div>
                <label className="text-sm font-medium text-gray-500 mb-3 block">Extra Amounts</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium">Unused Amount</p>
                    <p className="text-lg font-bold text-blue-700">₹{selectedSession.unusedAmount || 0}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium">Total Added</p>
                    <p className="text-lg font-bold text-purple-700">₹{selectedSession.totalAdded || 0}</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-xs text-orange-600 font-medium">Adjusted Deducted</p>
                    <p className="text-lg font-bold text-orange-700">₹{selectedSession.adjustedDeductedAmount || 0}</p>
                  </div>
                </div>
              </div>

              {/* Winners */}
              <div>
                <label className="text-sm font-medium text-gray-500 mb-3 block">Winners</label>
                {selectedSession.winners?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSession.winners.map((winner, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <p className="text-sm font-medium">Button {winner.buttonNumber}</p>
                          <p className="text-xs text-gray-500">Amount: ₹{winner.amount}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">₹{winner.payOutAmount}</p>
                          <p className="text-xs text-green-500 font-medium">Winner</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">No winners in this session</p>
                  </div>
                )}
              </div>

              {/* Button Results */}
              <div>
                <label className="text-sm font-medium text-gray-500 mb-3 block">All Button Results</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedSession.buttonPresses?.map((button, index) => {
                    // Check if this button is a winner
                    const isWinner = selectedSession.winners?.some(winner => winner.buttonNumber === button.buttonNumber);
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex justify-between items-center p-3 rounded-lg border ${
                          isWinner 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Button {button.buttonNumber}</span>
                          {isWinner && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              WINNER
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{button.pressCount} presses</p>
                          <p className="text-sm font-bold">₹{button.totalAmount}</p>
                          {isWinner && (
                            <p className="text-xs text-green-600 font-medium">
                              Won: ₹{selectedSession.winners?.find(w => w.buttonNumber === button.buttonNumber)?.payOutAmount}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Processing Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Processing Time</label>
                  <p className="text-sm font-mono">{new Date(selectedSession.createdAt).toLocaleString()}</p>
                </div>
                {/* <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Stored At</label>
                  <p className="text-sm font-mono">{new Date(selectedSession.createdAt).toLocaleString()}</p>
                </div> */}
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={handleModalClose}
            className="px-4 py-2"
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
}

export default GameSessions;
