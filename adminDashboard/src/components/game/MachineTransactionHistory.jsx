import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Table from '../ui/Table';
import Pagination from '../Paginate';
import { FaHistory, FaFilter, FaDownload, FaEye, FaTrophy, FaUser, FaCog } from 'react-icons/fa';
import { useGetMachines } from '../../hooks/useMachine';
import { useGetMachineTransactionHistory } from '../../hooks/useMachineTransaction';
import { generateTransactionHistoryPDF } from '../../utils/pdfUtils';
import { tostMessage } from '../toastMessage';
import { formatDateTime } from '../../utils/timeUtils';
import { getMachineTransactionHistoryApi } from '../../apis/machineTransactionApis';

const MachineTransactionHistory = () => {
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [viewMode, setViewMode] = useState('transactions'); // 'transactions' | 'sessions'

  // Hooks
  const { data: machinesData } = useGetMachines();
  const { data: transactionsData, isPending: transactionsLoading } = useGetMachineTransactionHistory({
    page: currentPage,
    limit: limit,
    ...(selectedMachine && { machineId: selectedMachine })
  });
  // const { data: gameSessionsData, isPending: sessionsLoading } = useGetGameSessions({
  //   page: currentPage,
  //   limit: limit,
  //   ...(selectedMachine && { machineId: selectedMachine })
  // });

  const transactions = transactionsData?.data || [];
  // const gameSessions = gameSessionsData?.data || [];
  const loading = transactionsLoading || false;

  useEffect(() => {
    if (machinesData?.data) {
      setMachines(machinesData.data);
    }
  }, [machinesData]);

  useEffect(() => {
    if (viewMode === 'transactions') {
      setTotalPages(transactionsData?.totalPages || 1);
    } else {
      // setTotalPages(gameSessionsData?.totalPages || 1);
    }
  }, [transactionsData, viewMode]);


  const getMachineName = (machineId) => {
    const machine = machines.find(m => m._id === machineId);
    return machine ? machine.machineName : 'Unknown Machine';
  };

  const handleExportPDF = async () => {
    try {

      const data = await getMachineTransactionHistoryApi({
        page: 1,
        limit: transactionsData?.totalTransactions,
        ...(selectedMachine && { machineId: selectedMachine })
      })
      if (data?.data?.length === 0) {
        tostMessage('Warning', 'No transactions to export', 'warning');
        return;
      }

      // console.log(data?.data);

      const pdf = generateTransactionHistoryPDF(data?.data, machines, selectedMachine);

      // // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `transaction-history-${timestamp}.pdf`;

      // // Save the PDF
      pdf.save(filename);

      tostMessage('Success', 'PDF exported successfully', 'success');
    } catch (error) {
      console.error('Export error:', error);
      tostMessage('Error', 'Failed to export PDF', 'error');
    }
  };

  const getWinnerTypeIcon = (winnerType) => {
    switch (winnerType) {
      case 'jackpot':
        return <FaTrophy className="text-yellow-500" title="Jackpot Winner" />;
      case 'manual':
        return <FaUser className="text-blue-500" title="Manual Winner" />;
      case 'regular':
      default:
        return <FaCog className="text-gray-500" title="Regular Winner" />;
    }
  };

  const getWinnerTypeBadge = (winnerType) => {
    const styles = {
      jackpot: 'bg-yellow-100 text-yellow-800',
      manual: 'bg-blue-100 text-blue-800',
      regular: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[winnerType] || styles.regular}`}>
        {getWinnerTypeIcon(winnerType)}
        <span className="ml-1 capitalize">{winnerType}</span>
      </span>
    );
  };

  const renderTransactionTable = () => {
    const columns = [
      { key: 'createdAt', label: 'Date & Time', sortable: true },
      { key: 'machineName', label: 'Machine' },
      { key: 'addedAmountToMachine', label: 'Added Amount' },
      { key: 'withdrawnAmountFromMachine', label: 'Withdrawn Amount' },
      { key: 'totalBetAmount', label: 'Total Bet Amount' },
      { key: 'payoutAmount', label: 'Payout Amount' },
      // { key: 'finalAmount', label: 'Final Amount' },
      { key: 'deductedAmount', label: 'Deducted Amount',
        render: (row) => (
          <div>
            <div className="font-medium text-green-600">{row.applyPercentageDeducted}</div>
            {/* <div className="text-xs text-gray-500">Deducted: ₹{row.applyPercentageValue}</div> */}
            <div className="text-xs text-gray-500">Deducted: {row.deductedAmount}</div>
          </div>
        ),
       },
      // { key: 'unusedAmount', label: 'Unused Amount' },
      // { key: 'totalAdded', label: 'Total Added' },
      { key: 'profit', label: 'Profit' },
      { key: 'remainingBalance', label: 'Remaining Balance' },
      // { key: 'note', label: 'Note' }
    ];

    // console.log(transactions);
    const data = transactions.map(transaction => ({
      ...transaction,
      machineName: transaction?.machineId?.machineName,
      addedAmountToMachine: `₹${transaction.addedAmountToMachine || 0}`,
      withdrawnAmountFromMachine: `₹${transaction.withdrawnAmountFromMachine || 0}`,
      payoutAmount: `₹${transaction.payoutAmount || 0}`,
      totalBetAmount: `₹${transaction.totalBetAmount || 0}`,
      finalAmount: `₹${transaction.finalAmount || 0}`,
      deductedAmount: `₹${transaction.deductedAmount || 0}`,
      applyPercentageDeducted: `${transaction.applyPercentageDeducted || 0}%`,
      applyPercentageValue: `₹${transaction.applyPercentageValue || 0}`,
      unusedAmount: `₹${transaction.unusedAmount || 0}`,
      totalAdded: `₹${transaction.totalAdded || 0}`,
      profit: `₹${Math.max(transaction.totalBetAmount - transaction.payoutAmount, 0) || 0}`,
      remainingBalance: `₹${transaction.remainingBalance || 0}`,
      note: transaction.note,
      createdAt: formatDateTime(transaction.createdAt)
    }));

    return <Table columns={columns} data={data} />;
  };

  // const renderGameSessionTable = () => {
  //   const columns = [
  //     { key: 'createdAt', label: 'Date & Time', sortable: true },
  //     { key: 'machineName', label: 'Machine' },
  //     { key: 'sessionId', label: 'Session ID' },
  //     { key: 'totalBet', label: 'Total Bet' },
  //     { key: 'winners', label: 'Winners' },
  //     { key: 'winnerTypes', label: 'Winner Types' }
  //   ];

  //   const data = gameSessions.map(session => ({
  //     ...session,
  //     machineName: getMachineName(session.machineId),
  //     totalBet: `₹${session.totalBetAmount || 0}`,
  //     winners: session.winners?.length || 0,
  //     winnerTypes: session.winners?.map(w => w.winnerType).join(', ') || 'None',
  //     createdAt: new Date(session.createdAt).toLocaleString()
  //   }));

  //   return <Table columns={columns} data={data} />;
  // };

  // const renderWinnerDetails = (session) => {
  //   if (!session.winners || session.winners.length === 0) {
  //     return <span className="text-gray-500">No winners</span>;
  //   }

  //   return (
  //     <div className="space-y-1">
  //       {session.winners.map((winner, index) => (
  //         <div key={index} className="flex items-center space-x-2 text-sm">
  //           <span>Button {winner.buttonNumber}:</span>
  //           <span className="font-medium">₹{winner.payOutAmount}</span>
  //           {getWinnerTypeBadge(winner.winnerType)}
  //         </div>
  //       ))}
  //     </div>
  //   );
  // };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaHistory className="mr-2" />
              Machine Transaction History
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant={viewMode === 'transactions' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('transactions')}
                className="w-full sm:w-auto"
              >
                Transactions
              </Button>
              {/* <Button
                variant={viewMode === 'sessions' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('sessions')}
              >
                Game Sessions
              </Button> */}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Machine
              </label>
              <select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Machines</option>
                {machines.map((machine) => (
                  <option key={machine._id} value={machine._id}>
                    {machine.machineName} ({machine.machineNumber})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                icon={<FaDownload />}
                onClick={handleExportPDF}
                className="w-full sm:w-auto"
                disabled={transactions.length === 0}
              >
                Export PDF
              </Button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <>
              {viewMode === 'transactions' ? (
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FaHistory className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No transaction history found.</p>
                    </div>
                  ) : (
                    renderTransactionTable()
                  )}
                </div>
              ) : null}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default MachineTransactionHistory;
