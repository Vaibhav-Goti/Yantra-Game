import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../ui/Modal';
import Input from '../ui/Input';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { TextField } from '@mui/material';
import { FaPlus, FaEdit, FaTrash, FaClock, FaTrophy, FaUsers, FaGamepad, FaMoneyBillWave } from 'react-icons/fa';
import { useGetMachines } from '../../hooks/useMachine';
import { useGetJackpotWinners, useCreateJackpotWinner, useUpdateJackpotWinner, useDeleteJackpotWinner } from '../../hooks/useJackpotWinner';
import moment from 'moment';

const JackpotManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedJackpot, setSelectedJackpot] = useState(null);
  const [machines, setMachines] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    machineId: '',
    startTime: null,
    endTime: null,
    maxWinners: ''
  });

  // Hooks
  const { data: machinesData } = useGetMachines();
  const { data: jackpotWinnersData, isPending: loading } = useGetJackpotWinners();
  const { mutate: createJackpotWinner, isPending: createLoading } = useCreateJackpotWinner();
  const { mutate: updateJackpotWinner, isPending: updateLoading } = useUpdateJackpotWinner();
  const { mutate: deleteJackpotWinner, isPending: deleteLoading } = useDeleteJackpotWinner();

  useEffect(() => {
    if (machinesData?.data) {
      setMachines(machinesData.data);
    }
  }, [machinesData]);

  const jackpotWinners = jackpotWinnersData?.data || [];

  // Separate active and inactive jackpots
  const activeJackpots = jackpotWinners.filter(jackpot => jackpot.active);
  const inactiveJackpots = jackpotWinners.filter(jackpot => !jackpot.active);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.machineId || !formData.maxWinners) {
      return;
    }

    const maxWinners = parseInt(formData.maxWinners);
    if (maxWinners < 1 || maxWinners > 10) {
      return;
    }

    // Convert 12-hour format to 24-hour format for storage
    const submitData = {
      machineId: formData.machineId,
      startTime: formData.startTime ? moment(formData.startTime, 'hh:mm A').format('HH:mm') : '',
      endTime: formData.endTime ? moment(formData.endTime, 'hh:mm A').format('HH:mm') : '',
      maxWinners: parseInt(formData.maxWinners)
    };

    if (modalMode === 'add') {
      if (!formData.startTime || !formData.endTime) {
        return;
      }
      createJackpotWinner(submitData);
    } else {
      updateJackpotWinner({ ...submitData, id: selectedJackpot._id });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (jackpot) => {
    setSelectedJackpot(jackpot);
    setModalMode('edit');
    setFormData({
      machineId: jackpot.machineId,
      startTime: jackpot.startTime ? moment(jackpot.startTime, 'HH:mm').format('hh:mm A') : null,
      endTime: jackpot.endTime ? moment(jackpot.endTime, 'HH:mm').format('hh:mm A') : null,
      maxWinners: jackpot.maxWinners
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (jackpotId) => {
    if (!window.confirm('Are you sure you want to delete this jackpot winner?')) {
      return;
    }

    deleteJackpotWinner({ id: jackpotId });
  };

  const resetForm = () => {
    setFormData({
      machineId: '',
      startTime: null,
      endTime: null,
      maxWinners: ''
    });
    setSelectedJackpot(null);
    setModalMode('add');
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const getMachineName = (machineId) => {
    const machine = machines.find(m => m._id === machineId);
    return machine ? machine.machineName : 'Unknown Machine';
  };

  const isCurrentlyActive = (jackpot) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const startTime = jackpot.startTime;
    const endTime = jackpot.endTime;

    return currentTime >= startTime && currentTime <= endTime && jackpot.active;
  };

  const getStatusBadge = (jackpot) => {
    if (isCurrentlyActive(jackpot)) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
          Active Now
        </span>
      );
    } else if (jackpot.active) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Scheduled
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Inactive
        </span>
      );
    }
  };

  const calculateTotalPayout = (winners) => {
    if (!winners || !Array.isArray(winners)) return 0;
    return winners.reduce((total, winner) => total + (winner.payOutAmount || 0), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const renderGameSessionDetails = (session) => {
    if (!session) {
      return (
        <div className="text-sm text-gray-500 italic">
          No game session found for this rule
        </div>
      );
    }

    return (
      <div className="bg-gray-50 mt-3">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <FaGamepad className="text-blue-500 text-sm" />
          <span className="text-sm font-medium text-gray-700">
            Session: {session.sessionId}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            session.status === 'Completed' 
              ? 'bg-green-100 text-green-800' 
              : session.status === 'Active'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {session.status}
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <FaClock className="text-gray-500" />
            <div>
              <div className="text-xs text-gray-500">Stop Time</div>
              <div className="font-medium">{session.endTime || 'N/A'}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FaMoneyBillWave className="text-green-500" />
            <div>
              <div className="text-xs text-gray-500">Bet Amount</div>
              <div className="font-medium">{formatCurrency(session.totalBetAmount)}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            <div>
              <div className="text-xs text-gray-500">Total Payout</div>
              <div className="font-medium">{formatCurrency(calculateTotalPayout(session.winners))}</div>
            </div>
          </div>
        </div>

        {/* {session.winners && session.winners.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-2">Winners:</div>
            <div className="flex flex-wrap gap-2">
              {session.winners.filter(w => w.isWinner).map((winner, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Button {winner.buttonNumber}: {formatCurrency(winner.payOutAmount)}
                </span>
              ))}
            </div>
          </div>
        )} */}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Jackpot Winner Management</h3>
            <Button onClick={openAddModal} icon={<FaPlus />}>
              Add Jackpot
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {loading || createLoading || updateLoading || deleteLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Jackpots Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <FaTrophy className="mr-2 text-yellow-500" />
                  Active Jackpots ({activeJackpots.length})
                </h4>
                {activeJackpots.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                    <FaTrophy className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p>No active jackpots. Create your first jackpot to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeJackpots.map((jackpot) => (
                      <div key={jackpot._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900 flex items-center">
                                <FaTrophy className="mr-2 text-yellow-500" />
                                {getMachineName(jackpot.machineId)}
                              </h4>
                              {getStatusBadge(jackpot)}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <FaClock className="mr-2" />
                                <span>{jackpot.startTime} - {jackpot.endTime}</span>
                              </div>
                              <div className="flex items-center">
                                <FaUsers className="mr-2" />
                                <span>Max Winners: {jackpot.maxWinners}</span>
                              </div>
                              <div className="text-xs text-gray-500 sm:col-span-2 lg:col-span-1">
                                Created: {new Date(jackpot.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            {/* Game Session Details */}
                            {/* {renderGameSessionDetails(jackpot.appliedInSessions)} */}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<FaEdit />}
                              onClick={() => handleEdit(jackpot)}
                              className="w-full sm:w-auto"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={<FaTrash />}
                              onClick={() => handleDelete(jackpot._id)}
                              className="w-full sm:w-auto"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* History Section */}
              {inactiveJackpots.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <FaClock className="mr-2 text-gray-500" />
                    History ({inactiveJackpots.length})
                  </h4>
                  <div className="space-y-4">
                    {inactiveJackpots.map((jackpot) => (
                      <div key={jackpot._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-700 flex items-center">
                                <FaTrophy className="mr-2 text-gray-500" />
                                {getMachineName(jackpot.machineId)}
                              </h4>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <FaClock className="mr-2" />
                                <span>{jackpot.startTime} - {jackpot.endTime}</span>
                              </div>
                              <div className="flex items-center">
                                <FaUsers className="mr-2" />
                                <span>Max Winners: {jackpot.maxWinners}</span>
                              </div>
                              <div className="text-xs text-gray-500 sm:col-span-2 lg:col-span-1">
                                Created: {new Date(jackpot.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            {/* Game Session Details */}
                            {renderGameSessionDetails(jackpot.appliedInSessions)}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="danger"
                              size="sm"
                              icon={<FaTrash />}
                              onClick={() => handleDelete(jackpot._id)}
                              className="w-full sm:w-auto"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalHeader onClose={() => setIsModalOpen(false)}>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaTrophy className="mr-2 text-yellow-500" />
            {modalMode === 'add' ? 'Add Jackpot Winner' : 'Edit Jackpot Winner'}
          </h3>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-3">
              {/* Machine Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">
                  Machine *
                </label>
                <select
                  value={formData.machineId}
                  onChange={(e) => setFormData(prev => ({ ...prev, machineId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a machine</option>
                  {machines.map((machine) => (
                    <option key={machine._id} value={machine._id}>
                      {machine.machineName} ({machine.machineNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <TimePicker
                      value={formData.startTime ? moment(formData.startTime, 'hh:mm A') : null}
                      onChange={(value) =>
                        setFormData(prev => ({
                          ...prev,
                          startTime: value ? value.format('hh:mm A') : null
                        }))
                      }
                      ampm
                      enableAccessibleFieldDOMStructure={false}
                      slots={{
                        textField: (params) => <TextField {...params} fullWidth size="small" />
                      }}
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <TimePicker
                      value={formData.endTime ? moment(formData.endTime, 'hh:mm A') : null}
                      onChange={(value) =>
                        setFormData(prev => ({
                          ...prev,
                          endTime: value ? value.format('hh:mm A') : null
                        }))
                      }
                      ampm
                      enableAccessibleFieldDOMStructure={false}
                      slots={{
                        textField: (params) => <TextField {...params} fullWidth size="small" />
                      }}
                    />
                  </div>
                </LocalizationProvider>
              </div>

              {/* Max Winners */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">
                  Maximum Winners *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxWinners}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxWinners: e.target.value }))}
                  placeholder="Enter maximum number of winners"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum number of jackpot winners during this time period (1-10)
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaTrophy className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Jackpot Winner Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>During jackpot time, multiple winners can be selected</li>
                        <li>Winners are chosen based on button payout amounts</li>
                        <li>Machine deposit may be used to cover extra payouts</li>
                        <li>All winners will be marked as "jackpot" type in history</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createLoading || updateLoading}
                className="w-full sm:w-auto"
              >
                {modalMode === 'add' ? 'Create Jackpot' : 'Update Jackpot'}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default JackpotManagement;
