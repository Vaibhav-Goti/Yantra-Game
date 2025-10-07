import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../ui/Modal';
import Input from '../ui/Input';
import { FaPlus, FaMinus, FaWallet, FaHistory, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { useGetMachines } from '../../hooks/useMachine';
import { useAddAmountToMachine, useWithdrawAmountFromMachine } from '../../hooks/useMachineTransaction';

const MachineBalanceManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [machines, setMachines] = useState([]);

  // Form states
  const [addFormData, setAddFormData] = useState({
    machineId: '',
    amount: '',
    note: ''
  });
  const [withdrawFormData, setWithdrawFormData] = useState({
    machineId: '',
    amount: '',
    note: ''
  });

  // Hooks
  const { data: machinesData, isPending: machinesLoading, isError: isMachinesError, error: machinesError } = useGetMachines();
  // const { data: balanceData, isPending: balanceLoading } = useGetMachineBalanceSummary({ machineId: selectedMachine });
  const { mutate: addAmount, isPending: addLoading } = useAddAmountToMachine();
  const { mutate: withdrawAmount, isPending: withdrawLoading } = useWithdrawAmountFromMachine();

  useEffect(() => {
    if (machinesData?.data) {
      setMachines(machinesData.data);
    }
  }, [machinesData]);

  const handleAddAmount = async (e) => {
    e.preventDefault();
    
    if (!addFormData.machineId || !addFormData.amount || Number(addFormData.amount) <= 0) {
      return;
    }

    const data = {
      machineId: addFormData.machineId,
      amount: Number(addFormData.amount),
      note: addFormData.note
    }

    addAmount(data);
    setIsAddModalOpen(false);
    setAddFormData({ machineId: '', amount: '', note: '' });
  };

  const handleWithdrawAmount = async (e) => {
    e.preventDefault();
    
    if (!withdrawFormData.machineId || !withdrawFormData.amount || parseFloat(withdrawFormData.amount) <= 0) {
      return;
    }

    const machine = machines.find(m => m._id === withdrawFormData.machineId);
    if (machine && machine.depositAmount < parseFloat(withdrawFormData.amount)) {
      return;
    }

    const data = {
      machineId: withdrawFormData.machineId,
      amount: Number(withdrawFormData.amount),
      note: withdrawFormData.note
    }

    withdrawAmount(data);
    setIsWithdrawModalOpen(false);
    setWithdrawFormData({ machineId: '', amount: '', note: '' });
  };

  const getBalanceStatus = (balance) => {
    if (balance < 1000) {
      return { color: 'text-red-600', bg: 'bg-red-50', icon: FaExclamationTriangle, text: 'Low Balance' };
    } else if (balance < 5000) {
      return { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: FaExclamationTriangle, text: 'Medium Balance' };
    } else {
      return { color: 'text-green-600', bg: 'bg-green-50', icon: FaCheckCircle, text: 'Good Balance' };
    }
  };

  const openAddModal = (machineId = '') => {
    setAddFormData({ machineId, amount: '', note: '' });
    setIsAddModalOpen(true);
  };

  const openWithdrawModal = (machineId = '') => {
    setWithdrawFormData({ machineId, amount: '', note: '' });
    setIsWithdrawModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Machine Balance Overview */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaWallet className="mr-2" />
              Machine Balance Management
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="success"
                icon={<FaPlus />}
                onClick={() => openAddModal()}
                className="w-full sm:w-auto"
              >
                Add Amount
              </Button>
              <Button
                variant="warning"
                icon={<FaMinus />}
                onClick={() => openWithdrawModal()}
                className="w-full sm:w-auto"
              >
                Withdraw Amount
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {machinesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {machinesData.data.map((machine) => {
                const status = getBalanceStatus(machine.depositAmount);
                const StatusIcon = status.icon;

                return (
                  <div key={machine._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{machine.machineName}</h4>
                        <p className="text-sm text-gray-500">#{machine.machineNumber}</p>
                      </div>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        <StatusIcon className="mr-1" />
                        {status.text}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-gray-900">₹{machine.depositAmount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Current Balance</div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        icon={<FaPlus />}
                        onClick={() => openAddModal(machine._id)}
                        className="flex-1"
                      >
                        Add
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        icon={<FaMinus />}
                        onClick={() => openWithdrawModal(machine._id)}
                        className="flex-1"
                        disabled={machine.depositAmount <= 0}
                      >
                        Withdraw
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Amount Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} size="md">
        <ModalHeader onClose={() => setIsAddModalOpen(false)}>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaPlus className="mr-2 text-green-600" />
            Add Amount to Machine
          </h3>
        </ModalHeader>
        <form onSubmit={handleAddAmount}>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Machine *
                </label>
                <select
                  value={addFormData.machineId}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, machineId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount to Add *
                </label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={addFormData.amount}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount to add"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (Optional)
                </label>
                <Input
                  type="text"
                  value={addFormData.note}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Add a note for this transaction"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                loading={addLoading}
                className="w-full sm:w-auto"
              >
                Add Amount
              </Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>

      {/* Withdraw Amount Modal */}
      <Modal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} size="md">
        <ModalHeader onClose={() => setIsWithdrawModalOpen(false)}>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaMinus className="mr-2 text-yellow-600" />
            Withdraw Amount from Machine
          </h3>
        </ModalHeader>
        <form onSubmit={handleWithdrawAmount}>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Machine *
                </label>
                <select
                  value={withdrawFormData.machineId}
                  onChange={(e) => setWithdrawFormData(prev => ({ ...prev, machineId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                >
                  <option value="">Select a machine</option>
                  {machines.map((machine) => {
                    const balance = machine.depositAmount;
                    return (
                      <option key={machine._id} value={machine._id} disabled={balance <= 0}>
                        {machine.machineName} ({machine.machineNumber}) - ₹{balance.toLocaleString()}
                        {balance <= 0 && ' (No Balance)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount to Withdraw *
                </label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  max={withdrawFormData.machineId ? machines.find(m => m._id === withdrawFormData.machineId).depositAmount : 0}
                  value={withdrawFormData.amount}
                  onChange={(e) => setWithdrawFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount to withdraw"
                  required
                />
                {withdrawFormData.machineId && (
                  <p className="text-sm text-gray-500 mt-1">
                    Available balance: ₹{withdrawFormData.machineId ? machines.find(m => m._id === withdrawFormData.machineId).depositAmount.toLocaleString() : 0}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (Optional)
                </label>
                <Input
                  type="text"
                  value={withdrawFormData.note}
                  onChange={(e) => setWithdrawFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Add a note for this transaction"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="warning"
                loading={withdrawLoading}
                disabled={withdrawFormData.machineId ? machines.find(m => m._id === withdrawFormData.machineId).depositAmount <= 0 : false}
                className="w-full sm:w-auto"
              >
                Withdraw Amount
              </Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default MachineBalanceManagement;
