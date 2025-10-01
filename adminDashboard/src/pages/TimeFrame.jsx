import React, { useState } from "react";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Table from "../components/ui/Table";
import Pagination from "../components/Paginate";
import Dropdown, {
    DropdownItem,
    DropdownHeader,
    DropdownDivider,
} from "../components/ui/Dropdown";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "../components/ui/Modal";
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from "react-datepicker";
import { FaRegClock } from "react-icons/fa";
import { Button, Input } from "../components/ui";
import Loading, { LoadingOverlay, LoadingPage } from "../components/ui/Loading";
import { useGetMachines } from "../hooks/useMachine";
import { useCreateTimeFrame, useTimeFrame, useUpdateTimeFrame } from "../hooks/useTimeFrame";
import moment from "moment";

function MachineTimeFrames() {
    const [timeFrames, setTimeFrames] = useState([
        { id: 1, machine: "Machine 1", start: "10:00", end: "12:00", usage: 40 },
        { id: 2, machine: "Machine 2", start: "14:00", end: "16:00", usage: 65 },
    ]);

    // console.log(data)
    const [timeFrame, setTimeFrame] = useState("All");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editFrame, setEditFrame] = useState(null);
    const [machineId, setMachineId] = useState(null);
    const [formData, setFormData] = useState({
        machineId: '',
        time: '',
        percentage: ''
    });
    const [errors, setErrors] = useState({});
    
    const { data, isPending, isError, error } = useGetMachines()
    const { data: timeFrameData, isLoading: isTimeFrameLoading, isError: isTimeFrameError, error: timeFrameError } = useTimeFrame({ page, limit, ...(machineId && { machineId }) });
    const { mutate: createTimeFrame, isPending: isCreateTimeFramePending, isError: isCreateTimeFrameError, error: createTimeFrameError } = useCreateTimeFrame();
    const { mutate: updateTimeFrame, isPending: isUpdateTimeFramePending, isError: isUpdateTimeFrameError, error: updateTimeFrameError } = useUpdateTimeFrame();
    // console.log(timeFrameData)

    // Show loading page if machines are loading
    if (isPending) {
        return <LoadingPage text="Loading machines..." />;
    }

    // Show error state if machines failed to load
    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-lg mb-4">Failed to load machines</div>
                    <p className="text-gray-600">{error?.message || 'Something went wrong'}</p>
                </div>
            </div>
        );
    }

    // Table Columns
    const columns = [
        { key: "time", label: "Time" },
        { key: "machine", label: "Machine" },
        {
            key: "percentage",
            label: "Percentage %",
            render: (row) => (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${row.percentage > 50
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                        }`}
                >
                    {row.percentage}%
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <Button
                    variant="link"
                    className="text-sm text-indigo-600 hover:underline p-0 h-auto"
                    onClick={() => handleEdit(row)}
                >
                    Edit
                </Button>
            ),
        },
    ];

    // Time conversion functions
    const convertTo24Hour = (timeInput) => {
        if (!timeInput) return '';
        // Native time input already provides HH:mm format, so return as is
        if (timeInput.match(/^\d{2}:\d{2}$/)) {
            return timeInput;
        }
        // Convert from 12-hour format to 24-hour format if needed
        const momentTime = moment(timeInput, ['h:mm A', 'hh:mm A', 'h:mm a', 'hh:mm a']);
        return momentTime.isValid() ? momentTime.format('HH:mm') : timeInput;
    };

    const convertTo12Hour = (time24h) => {
        if (!time24h) return '';
        // Convert from 24-hour format to 12-hour format for display
        const momentTime = moment(time24h, 'HH:mm');
        return momentTime.isValid() ? momentTime.format('h:mm A') : time24h;
    };

    // Convert 24-hour to time input format (HH:mm)
    const convertToTimeInput = (time24h) => {
        if (!time24h) return '';
        // If already in HH:mm format, return as is
        if (time24h.match(/^\d{2}:\d{2}$/)) {
            return time24h;
        }
        // Convert from 12-hour format to HH:mm for time input
        const momentTime = moment(time24h, ['h:mm A', 'hh:mm A', 'h:mm a', 'hh:mm a']);
        return momentTime.isValid() ? momentTime.format('HH:mm') : time24h;
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.machineId) {
            newErrors.machineId = 'Machine is required';
        }
        
        if (!formData.time) {
            newErrors.time = 'Time is required';
        }
        
        if (!formData.percentage) {
            newErrors.percentage = 'Percentage is required';
        } else if (isNaN(formData.percentage) || formData.percentage < 0 || formData.percentage > 100) {
            newErrors.percentage = 'Percentage must be between 0 and 100';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };


    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const time24h = moment(formData.time, 'HH:mm', true);
        let time24hFormatted = formData.time;
        if (!time24h.isValid()) {
            time24hFormatted =  moment(formData.time, 'h:mm A', true).format('HH:mm');
        }else{
            time24hFormatted = formData.time;
        }


        
        // Native time input already provides HH:mm format, so use directly
        const submitData = {
            machineId: editFrame ? editFrame.machineId._id : formData.machineId,
            time: time24hFormatted, // Already in HH:mm format from time input
            percentage: Number(formData.percentage)
        };
        
        if (editFrame) {
            submitData.id = editFrame._id;
            // Handle edit logic here
            // console.log('Edit time frame:', submitData);
            updateTimeFrame(submitData, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditFrame(null);
                    setFormData({ machineId: '', time: '', percentage: '' });
                    setErrors({});
                },
            });
        } else {
            // Handle create
            // console.log('Create time frame:', submitData);
            createTimeFrame(submitData, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditFrame(null);
                    setFormData({ machineId: '', time: '', percentage: '' });
                    setErrors({});
                },
                onError: (error) => {
                    console.error('Error creating time frame:', error);
                }
            });
        }
    };

    // Handle modal open/close
    const handleModalOpen = () => {
        setShowModal(true);
        setEditFrame(null);
        setFormData({ machineId: '', time: '', percentage: '' });
        setErrors({});
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditFrame(null);
        setFormData({ machineId: '', time: '', percentage: '' });
        setErrors({});
    };

    // Handle edit
    const handleEdit = (row) => {
        console.log(row);
        setEditFrame(row);
        setFormData({
            machineId: row.machineId._id || '',
            time: convertToTimeInput(row.time) || '', // Convert to HH:mm for time input
            percentage: row.percentage || ''
        });
        setShowModal(true);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex justify-between items-center flex-wrap">
                    <h3 className="text-lg font-semibold">Machine Time Frames</h3>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Filter Dropdown */}
                        <Dropdown
                            trigger={
                                <button 
                                    className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 text-sm font-medium flex items-center gap-2"
                                    disabled={isPending}
                                >
                                    {isPending ? <Loading size="sm" /> : null}
                                    {timeFrame}
                                </button>
                            }
                            placement="bottom-end"
                        >
                            <DropdownHeader>Filter</DropdownHeader>
                            <DropdownItem onClick={() => {
                                setTimeFrame("All");
                                setMachineId(null);   // reset filter
                            }}>All</DropdownItem>
                            {data?.data?.length > 0 && data?.data?.map((m) => (
                                <DropdownItem key={m._id} onClick={() => {
                                    setTimeFrame(m.machineName);
                                    setMachineId(m._id);
                                }}>
                                    {m.machineName}
                                </DropdownItem>
                            ))}
                            {/* <DropdownDivider />
                            <DropdownItem onClick={() => setTimeFrame("Today")}>
                                Today
                            </DropdownItem> */}
                        </Dropdown>

                        {/* Add Time Frame */}
                        <Button
                            onClick={handleModalOpen}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                        >
                            + Add Time Frame
                        </Button>
                    </div>
                </CardHeader>

                <CardBody>
                    <LoadingOverlay isLoading={isTimeFrameLoading}>
                        {timeFrameData?.data?.length > 0 ? (
                            <>
                                <Table
                                    responsive
                                    columns={columns}
                                    data={timeFrameData?.data?.map(timeFrame => ({
                                        id: timeFrame?._id,
                                        time: convertTo12Hour(timeFrame?.time), // Convert to 12-hour for display
                                        machine: timeFrame?.machineId?.machineName,
                                        percentage: timeFrame?.percentage,
                                        ...timeFrame
                                    }))}
                                />

                                <Pagination
                                    currentPage={page}
                                    totalPages={timeFrameData?.totalPages}
                                    onPageChange={(p) => setPage(p)}
                                    limit={limit}
                                    onLimitChange={(newLimit) => setLimit(newLimit)}
                                    totalItems={timeFrameData?.totalItems || timeFrameData?.count}
                                />
                            </>
                        ) : !isTimeFrameLoading ? (
                            <div className="text-center py-8">
                                <div className="text-gray-500 text-lg mb-2">No time frames found</div>
                                <p className="text-gray-400">Start by adding a new time frame</p>
                            </div>
                        ) : null}
                    </LoadingOverlay>
                </CardBody>
            </Card>

            {/* Modal using your reusable component */}
            <Modal
                isOpen={showModal}
                onClose={handleModalClose}
                size="md"
            >
                <ModalHeader onClose={handleModalClose}>
                    {editFrame ? "Edit Time Frame" : "Add Time Frame"}
                </ModalHeader>

                <ModalBody>
                    {/* API Error Display */}
                    {isCreateTimeFrameError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm">
                                {createTimeFrameError?.message || 'Failed to save time frame. Please try again.'}
                            </p>
                        </div>
                    )}
                    
                    <form
                        id="timeFrameForm"
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        {/* Machine */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Machine</label>
                            <select
                                name="machineId"
                                value={formData.machineId}
                                onChange={handleInputChange}
                                className={`w-full border rounded px-3 py-2 ${errors.machineId ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Select a machine</option>
                                {data?.data?.length > 0 && data?.data?.map((m) => (
                                    <option key={m._id} value={m._id}>
                                        {m.machineName}
                                    </option>
                                ))}
                            </select>
                            {errors.machineId && (
                                <p className="text-red-500 text-sm mt-1">{errors.machineId}</p>
                            )}
                        </div>

                        {/* Time Range */}
                        {/* <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Start</label>
                <input
                  type="time"
                  name="start"
                  defaultValue={editFrame?.start || ""}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">End</label>
                <input
                  type="time"
                  name="end"
                  defaultValue={editFrame?.end || ""}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div> */}
                        {/* Time Range */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Time</label>
                            <Input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                className={`w-full ${errors.time ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {formData.time && (
                                <p className="text-xs text-blue-600 font-medium mt-1">
                                    Will be saved as: {convertTo24Hour(formData.time)}
                                </p>
                            )}
                            {errors.time && (
                                <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                            )}
                        </div>


                        {/* Usage % */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Percentage %</label>
                            <Input
                                type="number"
                                name="percentage"
                                value={formData.percentage}
                                onChange={handleInputChange}
                                min="0"
                                max="100"
                                placeholder="Enter percentage (0-100)"
                                className={`w-full ${errors.percentage ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.percentage && (
                                <p className="text-red-500 text-sm mt-1">{errors.percentage}</p>
                            )}
                        </div>
                    </form>
                </ModalBody>

                <ModalFooter>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleModalClose}
                        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                        disabled={isCreateTimeFramePending || isUpdateTimeFramePending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="timeFrameForm"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        disabled={isCreateTimeFramePending || isUpdateTimeFramePending}
                        loading={isCreateTimeFramePending || isUpdateTimeFramePending}
                    >
                        {editFrame ? 'Update' : 'Add'}
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
}

export default MachineTimeFrames;
