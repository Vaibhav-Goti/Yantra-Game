import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../ui/Modal';
import Input from '../ui/Input';
import { FaPlus, FaEdit, FaTrash, FaClock, FaGamepad, FaMoneyBillWave, FaTrophy } from 'react-icons/fa';
import { useGetMachines } from '../../hooks/useMachine';
import { useGetWinnerRules, useCreateWinnerRule, useUpdateWinnerRule, useDeleteWinnerRule } from '../../hooks/useWinnerRule';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { TextField } from '@mui/material';
import moment from 'moment';

const ManualWinnerSelector = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedRule, setSelectedRule] = useState(null);
  const [machines, setMachines] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    machineId: '',
    startTime: null,
    endTime: null,
    allowedButtons: []
  });

  // Hooks
  const { data: machinesData } = useGetMachines({ page: 1, limit: 100 });
  const { data: winnerRulesData, isPending: loading } = useGetWinnerRules({ page: 1, limit: 100 });
  const { mutate: createWinnerRule, isPending: createLoading } = useCreateWinnerRule();
  const { mutate: updateWinnerRule, isPending: updateLoading } = useUpdateWinnerRule();
  const { mutate: deleteWinnerRule, isPending: deleteLoading } = useDeleteWinnerRule();

  useEffect(() => {
    if (machinesData?.data) {
      setMachines(machinesData.data);
    }
  }, [machinesData]);

  const winnerRules = winnerRulesData?.data || [];

  // Separate active and inactive rules
  const activeRules = winnerRules.filter(rule => rule.active);
  const inactiveRules = winnerRules.filter(rule => !rule.active);

  const handleButtonToggle = (buttonNumber) => {
    setFormData(prev => ({
      ...prev,
      allowedButtons: prev.allowedButtons.includes(buttonNumber)
        ? prev.allowedButtons.filter(btn => btn !== buttonNumber)
        : [...prev.allowedButtons, buttonNumber]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.machineId || formData.allowedButtons.length === 0) {
      return;
    }

    // Convert 12-hour format to 24-hour format for storage
    const submitData = {
      machineId: formData.machineId,
      startTime: formData.startTime ? moment(formData.startTime, 'hh:mm A').format('HH:mm') : '',
      endTime: formData.endTime ? moment(formData.endTime, 'hh:mm A').format('HH:mm') : '',
      allowedButtons: formData.allowedButtons
    };

    if (modalMode === 'add') {
      if (!formData.startTime || !formData.endTime) {
        return;
      }
      createWinnerRule(submitData);
    } else {
      updateWinnerRule({ ...submitData, id: selectedRule._id });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (rule) => {
    setSelectedRule(rule);
    setModalMode('edit');
    setFormData({
      machineId: rule.machineId,
      startTime: rule.startTime ? moment(rule.startTime, 'HH:mm').format('hh:mm A') : null,
      endTime: rule.endTime ? moment(rule.endTime, 'HH:mm').format('hh:mm A') : null,
      allowedButtons: rule.allowedButtons || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this winner rule?')) {
      return;
    }

    deleteWinnerRule({ id: ruleId });
  };

  const resetForm = () => {
    setFormData({
      machineId: '',
      startTime: '',
      endTime: '',
      allowedButtons: []
    });
    setSelectedRule(null);
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

  const renderButtonGrid = () => {
    const buttons = [];
    for (let i = 1; i <= 12; i++) {
      buttons.push(
        <button
          key={i}
          type="button"
          onClick={() => handleButtonToggle(i)}
          className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-semibold transition-colors ${formData.allowedButtons.includes(i)
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
            }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Manual Winner Rules</h3>
            <Button onClick={openAddModal} icon={<FaPlus />}>
              Add Rule
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
              {/* Active Rules Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <FaClock className="mr-2 text-blue-500" />
                  Active Rules ({activeRules.length})
                </h4>
                {activeRules.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                    <FaClock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p>No active winner rules. Create your first rule to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeRules.map((rule) => (
                      <div key={rule._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {getMachineName(rule.machineId)}
                              </h4>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                                Active
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                              <div className="flex items-center">
                                <FaClock className="mr-1" />
                                {rule.startTime} - {rule.endTime}
                              </div>
                              <div className="break-words">
                                Allowed Buttons: {rule.allowedButtons?.join(', ') || 'None'}
                              </div>
                            </div>
                            
                            {/* Game Session Details */}
                            {/* {renderGameSessionDetails(rule.appliedInSessions)} */}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<FaEdit />}
                              onClick={() => handleEdit(rule)}
                              className="w-full sm:w-auto"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={<FaTrash />}
                              onClick={() => handleDelete(rule._id)}
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
              {inactiveRules.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <FaClock className="mr-2 text-gray-500" />
                    History ({inactiveRules.length})
                  </h4>
                  <div className="space-y-4">
                    {inactiveRules.map((rule) => (
                      <div key={rule._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-700">
                                {getMachineName(rule.machineId)}
                              </h4>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 w-fit">
                                Inactive
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                              <div className="flex items-center">
                                <FaClock className="mr-1" />
                                {rule.startTime} - {rule.endTime}
                              </div>
                              <div className="break-words">
                                Allowed Buttons: {rule.allowedButtons?.join(', ') || 'None'}
                              </div>
                            </div>
                            
                            {/* Game Session Details */}
                            {renderGameSessionDetails(rule.appliedInSessions)}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="danger"
                              size="sm"
                              icon={<FaTrash />}
                              onClick={() => handleDelete(rule._id)}
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
          <h3 className="text-lg font-semibold text-gray-900">
            {modalMode === 'add' ? 'Add Winner Rule' : 'Edit Winner Rule'}
          </h3>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-4">
              {/* Machine Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

              {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div> */}

              {/* Button Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Buttons * (Select buttons that can win during this time)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {renderButtonGrid()}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Selected: {formData.allowedButtons.length} button(s)
                </p>
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
                disabled={formData.allowedButtons.length === 0}
                className="w-full sm:w-auto"
              >
                {modalMode === 'add' ? 'Create Rule' : 'Update Rule'}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default ManualWinnerSelector;
