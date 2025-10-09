import React, { useEffect, useState } from 'react'
import { useGetMachineTransactionHistory } from '../hooks/useMachineTransaction';
import { useParams } from 'react-router-dom';
import { Card, CardBody, CardHeader, LoadingOverlay, Table } from '../components/ui';
import Pagination from '../components/Paginate';
import { formatDateTime } from '../utils/timeUtils';

function MachineTransactionHistoryPage() {
    const { machineId } = useParams();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [machineHistory, setMachineHistory] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    const { data: machineTransactionHistory, isPending: isMachineTransactionHistoryPending, isError: isMachineTransactionHistoryError, error: machineTransactionHistoryError } = useGetMachineTransactionHistory({ machineId });
    // console.log(machineTransactionHistory?.data)

    useEffect(() => {
        if (machineTransactionHistory?.data) {
            const filteredHistory = machineTransactionHistory.data.filter(transaction => {
                console.log(transaction.addedAmountToMachine, transaction.withdrawnAmountFromMachine);
                return transaction.addedAmountToMachine > 0 || transaction.withdrawnAmountFromMachine > 0;
            });
            setMachineHistory(filteredHistory);
        }
    }, [machineTransactionHistory]);

    useEffect(() => {
        setTotalPages(Math.ceil(machineHistory.length / limit));
    }, [machineHistory, limit]);
    

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = machineHistory.slice(startIndex, endIndex);

    const columns = [
        { key: 'createdAt', label: 'Date & Time' },
        { key: 'machineName', label: 'Machine' },
        { key: 'addedAmountToMachine', label: 'Added Amount' },
        { key: 'withdrawnAmountFromMachine', label: 'Withdrawn Amount' },
        // { key: 'payoutAmount', label: 'Payout Amount' },
        // { key: 'totalBetAmount', label: 'Total Bet Amount' },
        // { key: 'finalAmount', label: 'Final Amount' },
        // { key: 'deductedAmount', label: 'Deducted Amount' },
        // { key: 'unusedAmount', label: 'Unused Amount' },
        // { key: 'totalAdded', label: 'Total Added' },
        // { key: 'percentageDeducted', label: 'Percentage Deducted' },
        // { key: 'remainingBalance', label: 'Remaining Balance' },
        { key: 'note', label: 'Note' }
    ];

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Machine Transaction History</h3>
            </CardHeader>

            <CardBody>
                {/* Historical Sessions Table */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Machine Transaction History</h4>
                        {isMachineTransactionHistoryPending && (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                <span className="text-sm text-gray-600">Loading sessions...</span>
                            </div>
                        )}
                    </div>

                    <LoadingOverlay isLoading={isMachineTransactionHistoryPending}>
                        {machineTransactionHistory?.data?.length > 0 ? (
                            <>
                                <Table
                                    responsive
                                    columns={columns}
                                    data={paginatedData.map(transaction => ({
                                        ...transaction,
                                        machineName: transaction?.machineId?.machineName,
                                        addedAmountToMachine: `₹${transaction.addedAmountToMachine || 0}`,
                                        withdrawnAmountFromMachine: `₹${transaction.withdrawnAmountFromMachine || 0}`,
                                        createdAt: formatDateTime(transaction.createdAt)
                                    }))}
                                    onRowClick={(row) => console.log("Row clicked:", row)}
                                    clickable
                                />
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={(p) => setPage(p)}
                                    limit={limit}
                                    onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1) }}
                                    totalItems={machineHistory.length}
                                />
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-gray-500 text-lg mb-2">
                                    No machine transaction history found.
                                </div>
                            </div>
                        )}
                    </LoadingOverlay>
                </div>
            </CardBody>
        </Card>
    )
}

export default MachineTransactionHistoryPage