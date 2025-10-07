import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../ui/Modal';
import Input from '../ui/Input';
import { FaPlus, FaEdit, FaTrash, FaClock, FaTrophy, FaUsers } from 'react-icons/fa';
import { useGetMachines } from '../../hooks/useMachine';
import { useGetJackpotWinners, useCreateJackpotWinner, useUpdateJackpotWinner, useDeleteJackpotWinner } from '../../hooks/useJackpotWinner';

const JackpotManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedJackpot, setSelectedJackpot] = useState(null);
  const [machines, setMachines] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    machineId: '',
    startTime: '',
    endTime: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.machineId || !formData.startTime || !formData.endTime || !formData.maxWinners) {
      return;
    }

    const maxWinners = parseInt(formData.maxWinners);
    if (maxWinners < 1 || maxWinners > 10) {
      return;
    }

    const submitData = {
      ...formData,
      maxWinners: parseInt(formData.maxWinners)
    };

    if (modalMode === 'add') {
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
      startTime: jackpot.startTime,
      endTime: jackpot.endTime,
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
      startTime: '',
      endTime: '',
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
            <div className="space-y-4">
              {jackpotWinners.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaTrophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>No jackpot winners configured. Create your first jackpot to get started.</p>
                </div>
              ) : (
                jackpotWinners.map((jackpot) => (
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
                ))
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
              </div>

              {/* Max Winners */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
