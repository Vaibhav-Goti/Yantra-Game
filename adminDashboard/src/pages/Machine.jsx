import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Pagination from "../components/Paginate";
import Loading, { LoadingOverlay, LoadingPage } from "../components/ui/Loading";
import { FaEdit, FaTrash, FaExclamationTriangle, } from "react-icons/fa";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "../components/ui/Modal";
import { useAddMachine, useDeleteMachine, useGetMachines, useUpdateMachine } from "../hooks/useMachine";

function Machines() {
  const [machines, setMachines] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // form state
  const [formData, setFormData] = useState({
    machineName: "",
    machineNumber: "",
    depositAmount: ""
  });
  const [formErrors, setFormErrors] = useState({});

  // Mock data
  const allMachines = Array.from({ length: 22 }, (_, i) => ({
    id: `M-${i + 1}`,
    name: `Machine ${i + 1}`,
    status: i % 2 === 0 ? "active" : "inactive",
  }));

  // api call
  const { data, isPending, isError, error, refetch } = useGetMachines({ page, limit })
  const { mutate: addMachine, isPending: isAddMachinePending, isError: isAddMachineError, error: addMachineError } = useAddMachine()
  const { mutate: deleteMachine, isPending: isDeleteMachinePending, isError: isDeleteMachineError, error: deleteMachineError } = useDeleteMachine()
  const { mutate: updateMachine, isPending: isUpdateMachinePending, isError: isUpdateMachineError, error: updateMachineError } = useUpdateMachine()
  // console.log(data)

  useEffect(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    setMachines(allMachines.slice(start, end));
    setTotalPages(Math.ceil(allMachines.length / limit));
  }, [page, limit]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this machine?")) {
      console.log("Delete machine id:", id);
      deleteMachine({ id })
    }
  };

  const handleStatusToggle = (machine) => {
    const newStatus = machine.status === "Active" ? "Inactive" : "Active";
    const confirmMessage = `Are you sure you want to ${newStatus === "Active" ? "activate" : "deactivate"} ${machine.machineName}?`;

    if (window.confirm(confirmMessage)) {
      updateMachine({
        id: machine.id || machine._id,
        status: newStatus
      });
    }
  };

  // form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.machineName.trim()) {
      errors.machineName = "Machine name is required";
    } else if (formData.machineName.trim().length < 2) {
      errors.machineName = "Machine name must be at least 2 characters";
    }

    if (!formData.machineNumber.trim()) {
      errors.machineNumber = "Machine number is required";
    } else if (formData.machineNumber.trim().length < 2) {
      errors.machineNumber = "Machine number must be at least 2 characters";
    }

    if (!formData.depositAmount) {
      errors.depositAmount = "Deposit amount is required";
    } else if (isNaN(formData.depositAmount) || parseFloat(formData.depositAmount) <= 0) {
      errors.depositAmount = "Deposit amount must be a positive number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleEdit = (machine) => {
    setModalMode("edit");
    setSelectedMachine(machine);
    setFormData({
      machineName: machine.machineName || "",
      machineNumber: machine.machineNumber || "",
      depositAmount: machine.depositAmount || ""
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setModalMode("add");
    setSelectedMachine(null);
    setFormData({
      machineName: "",
      machineNumber: "",
      depositAmount: ""
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        machineName: formData.machineName.trim(),
        machineNumber: formData.machineNumber.trim(),
        depositAmount: parseFloat(formData.depositAmount)
      };

      if (modalMode === "add") {
        console.log("Adding machine:", payload);
        addMachine(payload)
      } else {
        updateMachine({ id: selectedMachine.id, ...payload })
      }

      // Reset form and close modal
      setFormData({ machineName: "", machineNumber: "", depositAmount: "" });
      setFormErrors({});
      setIsModalOpen(false);

      // TODO: Refresh the machines list
      // refetch();

    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // table columns
  const columns = [
    { key: "id", label: "ID", render: (row) => row.id || row._id },
    { key: "machineName", label: "Machine Name" },
    { key: "machineNumber", label: "Machine Number" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
              }`}
          >
            {row.status}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusToggle(row);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${row.status === "Active" ? "bg-green-600" : "bg-gray-200"
              }`}
            disabled={isUpdateMachinePending}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${row.status === "Active" ? "translate-x-6" : "translate-x-1"
                }`}
            />
          </button>
        </div>
      ),
    },
    {
      key: "depositAmount",
      label: "Deposit Amount",
      render: (row) => <span>₹ {row.depositAmount?.toLocaleString() || '0'}</span>
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
          >
            <FaEdit />
          </Button>

          <Button
            size="sm"
            className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
          >
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ];

  // Error state component
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FaExclamationTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load machines</h3>
      <p className="text-gray-600 mb-4">
        {error?.message || "Something went wrong while loading the machines."}
      </p>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No machines found</h3>
      <p className="text-gray-600 mb-4">Get started by adding your first machine.</p>
      <Button variant="primary" size="sm" onClick={handleAdd}>
        + Add Machine
      </Button>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Machines</h3>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAdd}
            disabled={isPending}
          >
            + Add Machine
          </Button>
        </CardHeader>

        <CardBody>
          <LoadingOverlay isLoading={isPending}>
            {isError ? (
              <ErrorState />
            ) : data?.data?.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <Table
                  responsive
                  columns={columns}
                  data={data?.data?.length > 0 ? data?.data.map(machine => ({
                    id: machine?.id || machine?._id,
                    machineName: machine?.machineName,
                    machineNumber: machine?.machineNumber,
                    status: machine?.status,
                    depositAmount: machine?.depositAmount,
                    ...machine
                  })) : []}
                  onRowClick={(row) => console.log("Row clicked:", row)}
                />

                {/* Pagination */}
                <Pagination
                  currentPage={data?.currentPage || 1}
                  totalPages={data?.totalPages || 1}
                  onPageChange={(p) => setPage(p)}
                  limit={limit}
                  onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1) }}
                  totalItems={data?.totalItems || data?.count}
                />
              </>
            )}
          </LoadingOverlay>
        </CardBody>
      </Card>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader onClose={() => setIsModalOpen(false)}>
          {modalMode === "add" ? "Add Machine" : "Edit Machine"}
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Machine Name *
              </label>
              <input
                type="text"
                name="machineName"
                value={formData.machineName}
                onChange={handleInputChange}
                className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.machineName ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="Enter machine name"
              />
              {formErrors.machineName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.machineName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Machine Number *
              </label>
              <input
                type="text"
                name="machineNumber"
                value={formData.machineNumber}
                onChange={handleInputChange}
                className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.machineNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="Enter machine number (e.g., M1, M2)"
              />
              {formErrors.machineNumber && (
                <p className="mt-1 text-sm text-red-600">{formErrors.machineNumber}</p>
              )}
            </div>

            {modalMode === "add" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Deposit Amount *
                </label>
                <input
                  type="number"
                  name="depositAmount"
                  value={formData.depositAmount}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.depositAmount ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Enter deposit amount"
                  min="0"
                  step="0.01"
                />
                {formErrors.depositAmount && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.depositAmount}</p>
                )}
              </div>
            )}
            <ModalFooter>
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isAddMachinePending || isUpdateMachinePending}
                disabled={isAddMachinePending || isUpdateMachinePending}
              >
                {isAddMachinePending || isUpdateMachinePending ? (
                  <>
                    <Loading size="sm" className="mr-2" />
                    {modalMode === "add" ? "Adding..." : "Updating..."}
                  </>
                ) : (
                  modalMode === "add" ? "Add" : "Update"
                )}
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}

export default Machines;
