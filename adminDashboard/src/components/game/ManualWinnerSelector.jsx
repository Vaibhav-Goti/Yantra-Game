import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../ui/Modal';
import Input from '../ui/Input';
import { FaPlus, FaEdit, FaTrash, FaClock } from 'react-icons/fa';
import { useGetMachines } from '../../hooks/useMachine';
import { useGetWinnerRules, useCreateWinnerRule, useUpdateWinnerRule, useDeleteWinnerRule } from '../../hooks/useWinnerRule';

const ManualWinnerSelector = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedRule, setSelectedRule] = useState(null);
  const [machines, setMachines] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    machineId: '',
    startTime: '',
    endTime: '',
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
    
    if (!formData.machineId || !formData.startTime || !formData.endTime || formData.allowedButtons.length === 0) {
      return;
    }

    if (modalMode === 'add') {
      createWinnerRule(formData);
    } else {
      updateWinnerRule({ ...formData, id: selectedRule._id });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (rule) => {
    setSelectedRule(rule);
    setModalMode('edit');
    setFormData({
      machineId: rule.machineId,
      startTime: rule.startTime,
      endTime: rule.endTime,
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

  const renderButtonGrid = () => {
    const buttons = [];
    for (let i = 1; i <= 12; i++) {
      buttons.push(
        <button
          key={i}
          type="button"
          onClick={() => handleButtonToggle(i)}
          className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-semibold transition-colors ${
            formData.allowedButtons.includes(i)
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
            <div className="space-y-4">
              {winnerRules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No winner rules found. Create your first rule to get started.
                </div>
              ) : (
                winnerRules.map((rule) => (
                  <div key={rule._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {getMachineName(rule.machineId)}
                          </h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                            {rule.active ? 'Active' : 'Inactive'}
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
                ))
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
