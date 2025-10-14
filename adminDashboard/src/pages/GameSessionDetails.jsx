import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Loading, { LoadingPage } from "../components/ui/Loading";
import { useGetMachines } from "../hooks/useMachine";
import { useGameSessions } from "../hooks/useGameSessions";
import { formatDateTime } from "../utils/timeUtils";
import { FaArrowLeft, FaTrophy, FaClock, FaUsers, FaMoneyBillWave } from "react-icons/fa";
import { useGetGameSessionById } from "../hooks/useGameSession";

function GameSessionDetails() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    // const [selectedSession, setSelectedSession] = useState(null);

    // Get machines data for machine name lookup
    const { data: machinesData } = useGetMachines();

    // Get all game sessions to find the specific one
    const { data: selectedSession, isLoading, isError, error } = useGetGameSessionById(sessionId);
    console.log(selectedSession?.data)

    // Show loading page if data is loading
    if (isLoading) {
        return <LoadingPage text="Loading session details..." />;
    }

    // Show error state if data failed to load
    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-lg mb-4">Failed to load session details</div>
                    <p className="text-gray-600">{error?.message || 'Something went wrong'}</p>
                    <Button
                        onClick={() => navigate('/sessions')}
                        className="mt-4"
                        variant="outline"
                    >
                        Back to Sessions
                    </Button>
                </div>
            </div>
        );
    }

    // Show not found if session doesn't exist
    if (!selectedSession.data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-gray-500 text-lg mb-4">Session not found</div>
                    <p className="text-gray-600">The requested session could not be found.</p>
                    <Button
                        onClick={() => navigate('/sessions')}
                        className="mt-4"
                        variant="outline"
                    >
                        Back to Sessions
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Game Session Details</h1>
                    <p className="text-gray-600">Session ID: {selectedSession?.data?.sessionId}</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    icon={<FaArrowLeft />}
                >
                    Back to Sessions
                </Button>
            </div>

                        {/* Machine Balance Information */}
                        <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FaMoneyBillWave className="mr-2 text-green-500" />
                        Machine Balance Information
                    </h3>
                </CardHeader>
                <CardBody>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-2">
                            <p className="text-lg text-blue-600 font-medium">Balance Before Game</p>
                            <p className="text-lg font-bold text-blue-700">₹{selectedSession?.data?.balanceBeforeGame || 0}</p>
                        </div>
                        <div className="flex items-center justify-between p-2">
                            <p className="text-lg text-green-600 font-medium">Game Bet Amount</p>
                            <p className="text-lg font-bold text-green-700">₹{selectedSession?.data?.totalBetAmount || 0}</p>
                        </div>
                        <div className="flex items-center justify-between p-2">
                            <p className="text-lg text-purple-600 font-medium">Payout Amount</p>
                            <p className="text-lg font-bold text-purple-700">₹{selectedSession?.data?.winners?.reduce((sum, winner) => sum + winner.payOutAmount, 0) || 0}</p>
                        </div>
                        <hr className="border-gray-200 border-1" />
                        <div className="flex items-center justify-between p-2">
                            <p className="text-lg text-orange-600 font-medium">Balance After Game</p>
                            <p className="text-lg font-bold text-orange-700">₹{selectedSession?.data?.balanceAfterGame || 0}</p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Session Overview */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FaTrophy className="mr-2 text-yellow-500" />
                        Session Overview
                    </h3>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <FaUsers className="text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Machine</span>
                            </div>
                            <p className="text-lg font-bold text-blue-900">{selectedSession?.data?.machineId?.machineName}</p>
                            <p className="text-sm text-blue-700">#{selectedSession?.data?.machineId?.machineNumber}</p>
                        </div>

                       
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                                <FaClock className="text-green-600" />
                                <span className="text-sm font-medium text-green-800">Status</span>
                            </div>
                            <p className="text-lg font-bold text-green-900">{selectedSession?.data?.status}</p>
                            <p className="text-sm text-green-700">Completed Session</p>
                        </div>

                        
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center gap-2 mb-2">
                                <FaMoneyBillWave className="text-purple-600" />
                                <span className="text-sm font-medium text-purple-800">Payout Amount</span>
                            </div>
                            <p className="text-lg font-bold text-purple-900">₹{selectedSession?.data?.winners?.reduce((sum, winner) => sum + winner.payOutAmount, 0)}</p>
                            <p className="text-sm text-purple-700">Total Payout</p>
                        </div>

                        
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-2 mb-2">
                                <FaTrophy className="text-orange-600" />
                                <span className="text-sm font-medium text-orange-800">Winners</span>
                            </div>
                            <p className="text-lg font-bold text-orange-900">{selectedSession?.data?.winners?.length || 0}</p>
                            <p className="text-sm text-orange-700">Total Winners</p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Time and Amount Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Time Information */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FaClock className="mr-2 text-blue-500" />
                            Time Information
                        </h3>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Stop Time</label>
                                <p className="text-lg font-semibold text-gray-900">{selectedSession?.data?.startTime}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Relevant Time Frame</label>
                                <p className="text-lg font-semibold text-gray-900">
                                    {selectedSession?.data?.gameTimeFrames[0]?.time} ({selectedSession?.data?.gameTimeFrames[0]?.percentage}%)
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Processing Time</label>
                                <p className="text-sm text-gray-600">{formatDateTime(selectedSession?.data?.createdAt)}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Amount Details */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FaMoneyBillWave className="mr-2 text-green-500" />
                            Amount Details
                        </h3>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <label className="text-sm font-medium text-gray-500">Total Bet</label>
                                    <p className="text-lg font-bold text-green-600">₹{selectedSession?.data?.totalBetAmount}</p>
                                </div>
                                <div className="p-3 bg-red-50 rounded-lg">
                                    <label className="text-sm font-medium text-gray-500">Total Deducted</label>
                                    <p className="text-lg font-bold text-red-600">₹{selectedSession?.data?.totalDeductedAmount}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <label className="text-sm font-medium text-gray-500">Final Amount</label>
                                    <p className="text-lg font-bold text-blue-600">₹{selectedSession?.data?.finalAmount}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <label className="text-sm font-medium text-gray-500">Deduction Percentage</label>
                                    <p className="text-lg font-bold text-blue-600">{selectedSession?.data?.gameTimeFrames[0]?.deductedPercentage}%</p>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Extra Amounts */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Extra Amounts</h3>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-600 font-medium">Unused Amount</p>
                            <p className="text-lg font-bold text-blue-700">₹{selectedSession?.data?.unusedAmount || 0}</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-xs text-purple-600 font-medium">Total Added</p>
                            <p className="text-lg font-bold text-purple-700">₹{selectedSession?.data?.totalAdded || 0}</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <p className="text-xs text-orange-600 font-medium">Adjusted Deducted</p>
                            <p className="text-lg font-bold text-orange-700">₹{selectedSession?.data?.adjustedDeductedAmount || 0}</p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Winners Section */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FaTrophy className="mr-2 text-yellow-500" />
                        Winners ({selectedSession?.data?.winners?.length || 0})
                    </h3>
                </CardHeader>
                <CardBody>
                    {selectedSession?.data?.winners?.length > 0 ? (
                        <div className="space-y-4">
                            {selectedSession?.data?.winners.map((winner, index) => (
                                <div key={index} className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div>
                                        <p className="text-sm font-medium">Button {winner.buttonNumber}</p>
                                        <p className="text-xs text-gray-500">Amount: ₹{winner.amount}</p>
                                        <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${winner.winnerType === 'jackpot'
                                            ? 'bg-purple-100 text-purple-700'
                                            : winner.winnerType === 'manual'
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {winner.winnerType === 'jackpot' ? '🎰 Jackpot Winner' :
                                                winner.winnerType === 'manual' ? '👤 Manual Winner' :
                                                    '🤖 Auto Winner'}
                                        </span>
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
                </CardBody>
            </Card>

            {/* All Button Results */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">All Button Results</h3>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedSession?.data?.buttonPresses?.map((button, index) => {
                            // Check if this button is a winner
                            const isWinner = selectedSession?.data?.winners?.some(winner => winner.buttonNumber === button.buttonNumber);

                            return (
                                <div
                                    key={index}
                                    className={`flex justify-between items-center p-4 rounded-lg border ${isWinner
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">Button {button.buttonNumber}</span>
                                            {isWinner && (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                    WINNER
                                                </span>
                                            )}
                                        </div>
                                        {isWinner && (
                                            <span className={`inline-block px-2 py-1 rounded text-xs ${selectedSession.winners?.find(w => w.buttonNumber === button.buttonNumber)?.winnerType === 'jackpot'
                                                ? 'bg-purple-100 text-purple-700'
                                                : selectedSession.winners?.find(w => w.buttonNumber === button.buttonNumber)?.winnerType === 'manual'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {selectedSession?.data?.winners?.find(w => w.buttonNumber === button.buttonNumber)?.winnerType === 'jackpot' ? '🎰 Jackpot' :
                                                    selectedSession?.data?.winners?.find(w => w.buttonNumber === button.buttonNumber)?.winnerType === 'manual' ? '👤 Manual' :
                                                        '🤖 Auto'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">{button.pressCount} presses</p>
                                        <p className="text-sm font-bold">₹{button.totalAmount}</p>
                                        {isWinner && (
                                            <p className="text-xs text-green-600 font-medium">
                                                Won: ₹{selectedSession?.data?.winners?.find(w => w.buttonNumber === button.buttonNumber)?.payOutAmount}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

export default GameSessionDetails;
