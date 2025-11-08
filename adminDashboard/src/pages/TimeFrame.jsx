import React, { useState, useEffect } from "react";
import Card, { CardHeader, CardBody, CardFooter } from "../components/ui/Card";
import Dropdown, {
    DropdownItem,
    DropdownHeader,
    DropdownDivider,
} from "../components/ui/Dropdown";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "../components/ui/Modal";
import { FaRegClock, FaChevronDown, FaChevronRight, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { Button, Input } from "../components/ui";
import Loading, { LoadingOverlay, LoadingPage } from "../components/ui/Loading";
import { useGetMachines } from "../hooks/useMachine";
import { useCreateTimeFrame, useTimeFrame, useTimeFramesByMachine, useUpdateBulkTimeFrames, useUpdateTimeFrame } from "../hooks/useTimeFrame";
import moment from "moment";

// Edit Time Frame Input Component
const EditTimeFrameInput = ({ timeFrame, machineId, onSave, onCancel }) => {
    const [editValue, setEditValue] = useState(timeFrame.percentage);

    const handleSave = () => {
        onSave(machineId, timeFrame._id, editValue);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div className="flex items-center gap-0.5">
            <Input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                min="0"
                max="100"
                className="w-8 text-xs h-6"
                onKeyPress={handleKeyPress}
                autoFocus
            />
            <Button
                size="sm"
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 p-0.5 h-6"
            >
                <FaSave className="text-xs" />
            </Button>
            <Button
                size="sm"
                variant="secondary"
                onClick={onCancel}
                className="p-0.5 h-6"
            >
                <FaTimes className="text-xs" />
            </Button>
        </div>
    );
};

function MachineTimeFrames() {
    const [expandedMachines, setExpandedMachines] = useState({});
    const [editingTimeFrames, setEditingTimeFrames] = useState({});
    const [machineTimeFrames, setMachineTimeFrames] = useState([]);
    const [localEdits, setLocalEdits] = useState({});
    const [applyToAllPercentage, setApplyToAllPercentage] = useState('');
    const [multipleValues, setMultipleValues] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editFrame, setEditFrame] = useState(null);
    const [formData, setFormData] = useState({
        machineId: '',
        time: '',
        percentage: ''
    });
    const [errors, setErrors] = useState({});

    const { data: machinesData, isPending: isMachinesPending, isError: isMachinesError, error: machinesError } = useGetMachines();
    const { data: timeFrameData, isLoading: isTimeFrameLoading, isError: isTimeFrameError, error: timeFrameError } = useTimeFrame({});
    const { mutate: createTimeFrame, isPending: isCreateTimeFramePending, isError: isCreateTimeFrameError, error: createTimeFrameError } = useCreateTimeFrame();
    const { mutate: updateTimeFrame, isPending: isUpdateTimeFramePending, isError: isUpdateTimeFrameError, error: updateTimeFrameError } = useUpdateTimeFrame();
    const { mutate: timeFramesByMachine, data: timeFramesByMachineData, isPending: isTimeFramesByMachinePending, isError: isTimeFramesByMachineError, error: timeFramesByMachineError } = useTimeFramesByMachine();
    const { mutate: updateBulkTimeFrames, isPending: isUpdateBulkTimeFramesPending, isError: isUpdateBulkTimeFramesError, error: updateBulkTimeFramesError } = useUpdateBulkTimeFrames();
    // console.log(timeFramesByMachineData)


    // Show loading page if machines are loading
    if (isMachinesPending) {
        return <LoadingPage text="Loading machines..." />;
    }

    // Show error state if machines failed to load
    if (isMachinesError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-lg mb-4">Failed to load machines</div>
                    <p className="text-gray-600">{machinesError?.message || 'Something went wrong'}</p>
                </div>
            </div>
        );
    }

    // Toggle machine expansion - only one machine open at a time
    const toggleMachine = (machineId) => {
        // Close all other machines first
        const newExpanded = {};

        // If the clicked machine is not currently expanded, expand it
        if (!expandedMachines[machineId]) {
            newExpanded[machineId] = true;
            // Fetch time frames for this machine
            timeFramesByMachine({ machineId }, {
                onSuccess: (data) => {
                    setMachineTimeFrames(data.data);
                    setLocalEdits((prev) => ({ ...prev, [machineId]: data.data }));
                },
                onError: (error) => {
                    console.error('Error fetching time frames:', error);
                }
            });
        }

        setExpandedMachines(newExpanded);
    };

    // Handle edit time frame
    const handleEditTimeFrame = (machineId, timeFrameId) => {
        setEditingTimeFrames(prev => ({
            ...prev,
            [`${machineId}-${timeFrameId}`]: true
        }));
    };

    // Handle cancel edit
    const handleCancelEdit = (machineId, timeFrameId) => {
        setEditingTimeFrames(prev => {
            const newState = { ...prev };
            delete newState[`${machineId}-${timeFrameId}`];
            return newState;
        });
    };

    // Handle save time frame
    const handleSaveTimeFrame = (machineId, timeFrameId, newPercentage) => {
        const timeFrame = machineTimeFrames[machineId]?.timeFrames.find(tf => tf._id === timeFrameId);
        if (timeFrame) {
            updateTimeFrame({
                id: timeFrameId,
                machineId: machineId,
                time: timeFrame.time,
                percentage: newPercentage
            }, {
                onSuccess: () => {
                    handleCancelEdit(machineId, timeFrameId);
                }
            });
        }
    };

    // Parse multiple values from comma-separated string
    const parseMultipleValues = (valueString) => {
        if (!valueString) return [];
        return valueString.split(',').map(val => val.trim()).filter(val => val !== '' && !isNaN(val));
    };

    // Handle apply multiple values to time frames
    const handleApplyMultipleValues = (machineId) => {
        const values = parseMultipleValues(multipleValues);
        if (values.length === 0) return;

        const currentTimeFrames = localEdits[machineId] || timeFramesByMachineData?.data || [];

        const updatedTimeFrames = currentTimeFrames.map((timeFrame, index) => ({
            ...timeFrame,
            percentage: values[index % values.length] // Cycle through values if more time frames than values
        }));

        setLocalEdits((prev) => ({
            ...prev,
            [machineId]: updatedTimeFrames
        }));
    };

    // Handle apply to all
    const handelSaveChanges = (machineId) => {
        const machineData = localEdits[machineId] || [];

        if (machineData.length > 0) {
            const data = machineData?.map(timeFrame => {
                return {
                    _id: timeFrame._id,
                    percentage: Number(timeFrame.percentage)
                };
            });
            console.log("data", data);
            updateBulkTimeFrames({
                machineId: machineId,
                timeFrames: data
            }, {
                onSuccess: () => {
                    setApplyToAllPercentage('');
                    setMultipleValues('');
                    // Refresh the data after successful update
                    timeFramesByMachine({ machineId }, {
                        onSuccess: (data) => {
                            setMachineTimeFrames(data.data);
                            setLocalEdits((prev) => ({ ...prev, [machineId]: data.data }));
                        }
                    });
                },
                onError: (error) => {
                    console.error('Error updating bulk time frames:', error);
                }
            });
        }
    };

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
            time24hFormatted = moment(formData.time, 'h:mm A', true).format('HH:mm');
        } else {
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

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                    <h3 className="text-lg font-semibold">Machine Time Frames</h3>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Add Time Frame */}
                        <Button
                            onClick={() => setShowModal(true)}
                            className="w-full sm:w-auto px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                        >
                            + Add Time Frame
                        </Button>
                    </div>
                </CardHeader>

                <CardBody padding="p-0 sm:p-1">
                    <LoadingOverlay isLoading={isTimeFrameLoading}>
                        {machinesData?.data?.length > 0 ? (
                            <div className="space-y-3 sm:space-y-4 ">
                                {machinesData?.data?.map((machine) => (
                                    <Card padding="p-2 sm:p-1" key={machine._id} className="border border-gray-200">
                                        <CardHeader
                                            padding="p-0 sm:p-1"
                                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => toggleMachine(machine._id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                                    {expandedMachines[machine._id] ? (
                                                        <FaChevronDown className="text-gray-500 flex-shrink-0" />
                                                    ) : (
                                                        <FaChevronRight className="text-gray-500 flex-shrink-0" />
                                                    )}
                                                    <div className="min-w-0 flex-1 flex items-center justify-between flex-wrap">
                                                        <div>
                                                            <h4 className="font-semibold text-base sm:text-lg truncate">{machine.machineName}</h4>
                                                            <p className="text-xs sm:text-sm text-gray-500 truncate">ID: {machine._id}</p>
                                                        </div>
                                                        <div>
                                                            <span className={`text-sm font-medium ${machine.isMachineOffline ? 'text-red-600 animate-pulse' : 'text-green-600 animate-pulse'}`}>
                                                                Status: {machine.isMachineOffline ? 'Offline' : 'Online'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* <div className="text-sm text-gray-500">
                                                    {timeFramesByMachineData?.data?.length} time frame(s)
                                                </div> */}
                                            </div>
                                        </CardHeader>

                                        {/* {expandedMachines[machine._id] && (
                                            <CardBody padding="p-2 sm:p-1">
                                                <div className="space-y-4">
                                                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                                            <Input
                                                                type="number"
                                                                placeholder="Enter percentage (0-100)"
                                                                value={applyToAllPercentage}
                                                                onChange={(e) => setApplyToAllPercentage(e.target.value)}
                                                                min="0"
                                                                className="flex-1 w-full sm:w-auto"
                                                            />
                                                            <Button
                                                                onClick={() => handleApplyToAll(machine._id)}
                                                                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                                                disabled={!applyToAllPercentage || isNaN(applyToAllPercentage)}
                                                            >
                                                                Apply to All
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    
                                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                                        {timeFramesByMachineData?.data?.map((timeFrame) => {
                                                            const isEditing = editingTimeFrames[`${machine._id}-${timeFrame._id}`];
                                                            return (
                                                                <div key={timeFrame._id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm flex-shrink-0 min-w-fit border">
                                                                    <FaRegClock className="text-gray-400 text-sm flex-shrink-0" />
                                                                    <span className="font-medium text-sm whitespace-nowrap">
                                                                        {timeFrame.time}
                                                                    </span>
                                                                    
                                                                    {isEditing ? (
                                                                        <div className="flex items-center gap-1">
                                                                            <Input
                                                                                type="number"
                                                                                value={timeFrame.percentage}
                                                                                onChange={(e) => {
                                                                                    const newPercentage = e.target.value;
                                                                                    if (newPercentage !== '' && !isNaN(newPercentage) && newPercentage >= 0 && newPercentage <= 100) {
                                                                                        handleSaveTimeFrame(machine._id, timeFrame._id, newPercentage);
                                                                                    }
                                                                                }}
                                                                                onBlur={() => handleCancelEdit(machine._id, timeFrame._id)}
                                                                                onKeyPress={(e) => {
                                                                                    if (e.key === 'Enter') {
                                                                                        handleCancelEdit(machine._id, timeFrame._id);
                                                                                    } else if (e.key === 'Escape') {
                                                                                        handleCancelEdit(machine._id, timeFrame._id);
                                                                                    }
                                                                                }}
                                                                                min="0"
                                                                                className="w-16 text-md h-7"
                                                                                autoFocus
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <span 
                                                                            className={`px-2 py-1 rounded text-sm font-medium whitespace-nowrap cursor-pointer hover:bg-blue-200 transition-colors ${
                                                                                timeFrame.percentage > 50 
                                                                                    ? "bg-blue-100 text-blue-700" 
                                                                                    : "bg-gray-100 text-gray-600"
                                                                            }`}
                                                                            onClick={() => handleEditTimeFrame(machine._id, timeFrame._id)}
                                                                        >
                                                                            {timeFrame.percentage}%
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </CardBody>
                                        )} */}
                                        {expandedMachines[machine._id] && (
                                            <CardBody padding="p-4 sm:p-5 bg-gray-50">
                                                <LoadingOverlay isLoading={isTimeFramesByMachinePending || isUpdateBulkTimeFramesPending}>
                                                    {/* Show loading state when fetching time frames */}
                                                    {isTimeFramesByMachinePending ? (
                                                        <div className="flex items-center justify-center py-8">
                                                            <div className="text-center">
                                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                                                <p className="text-gray-600">Loading time frames...</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {/* Show no data message if no time frames */}
                                                            {(!timeFramesByMachineData?.data || timeFramesByMachineData.data.length === 0) ? (
                                                                <div className="text-center py-8">
                                                                    <div className="text-gray-500 text-lg mb-2">No time frames available</div>
                                                                    <p className="text-gray-400">This machine doesn't have any time frames configured</p>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {/* Apply to All Section */}
                                                                    <div className="mb-4 space-y-3">
                                                                        {/* Single Value Apply */}
                                                                        {/* <div className="flex flex-col sm:flex-row items-center gap-3">
                                                                            <Input
                                                                                type="number"
                                                                                placeholder="Apply single percentage to all (0–100)"
                                                                                value={applyToAllPercentage}
                                                                                onChange={(e) => setApplyToAllPercentage(e.target.value)}
                                                                                min="0"
                                                                                max="100"
                                                                                className="w-full sm:w-1/3"
                                                                            />
                                                                            <Button
                                                                                onClick={() => {
                                                                                    if (!applyToAllPercentage) return;
                                                                                    setLocalEdits((prev) => ({
                                                                                        ...prev,
                                                                                        [machine._id]:
                                                                                            prev[machine._id]?.map((tf) => ({
                                                                                                ...tf,
                                                                                                percentage: Number(applyToAllPercentage),
                                                                                            })) ||
                                                                                            (timeFramesByMachineData?.data || []).map((tf) => ({
                                                                                                ...tf,
                                                                                                percentage: Number(applyToAllPercentage),
                                                                                            })),
                                                                                    }));
                                                                                }}
                                                                                className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                disabled={!applyToAllPercentage || isNaN(applyToAllPercentage) || applyToAllPercentage < 0 || applyToAllPercentage > 100}
                                                                            >
                                                                                Apply Single Value
                                                                            </Button>
                                                                        </div> */}

                                                                        {/* Multiple Values Apply */}
                                                                        <div className="flex flex-col sm:flex-row items-center gap-3">
                                                                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                                                                                <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                                                                                    <Input
                                                                                        type="text"
                                                                                        placeholder="Apply multiple values (e.g., 10,30,50)"
                                                                                        value={multipleValues}
                                                                                        onChange={(e) => setMultipleValues(e.target.value)}
                                                                                        className="w-full sm:w-1/2 text-lg"
                                                                                    />
                                                                                    <Button
                                                                                        onClick={() => handleApplyMultipleValues(machine._id)}
                                                                                        className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                        disabled={!multipleValues || parseMultipleValues(multipleValues).length === 0}
                                                                                    >
                                                                                        Apply All
                                                                                    </Button>
                                                                                </div>
                                                                                <div className="flex gap-3 justify-end">
                                                                                    <Button
                                                                                        variant="secondary"
                                                                                        className="bg-gray-200 hover:bg-gray-300"
                                                                                        onClick={() => {
                                                                                            setLocalEdits((prev) => {
                                                                                                const newEdits = { ...prev };
                                                                                                delete newEdits[machine._id];
                                                                                                return newEdits;
                                                                                            });
                                                                                            setApplyToAllPercentage("");
                                                                                            setMultipleValues("");
                                                                                        }}
                                                                                    >
                                                                                        Cancel
                                                                                    </Button>

                                                                                    <Button
                                                                                        className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                                                        onClick={() => {
                                                                                            handelSaveChanges(machine._id);
                                                                                        }}
                                                                                        disabled={isUpdateBulkTimeFramesPending}
                                                                                        loading={isUpdateBulkTimeFramesPending}
                                                                                    >
                                                                                        {isUpdateBulkTimeFramesPending ? 'Saving...' : 'Save'}
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Help Text */}
                                                                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                                                            <strong>Examples:</strong><br />
                                                                            • Single value: <code>25</code> (applies 25% to all time frames)<br />
                                                                            • Multiple values: <code>10,30,50</code> (applies 10%, 30%, 50% sequentially, cycling if more time frames than values)
                                                                        </div>
                                                                    </div>

                                                                    {/* Time Frames in Grid (NO SCROLLBAR) */}
                                                                    <div
                                                                        className="grid gap-4 sm:gap-3 md:grid-cols-3 sm:grid-cols-2 grid-cols-1"
                                                                        style={{ overflow: "hidden" }}
                                                                    >
                                                                        {(localEdits[machine._id] || timeFramesByMachineData?.data || []).map(
                                                                            (timeFrame, index) => (
                                                                                <div
                                                                                    key={timeFrame._id || index}
                                                                                    className="flex flex-col gap-2 p-3 bg-white rounded-lg shadow-sm border border-gray-200"
                                                                                >
                                                                                    <div className="flex items-center justify-between">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <FaRegClock className="text-gray-400 text-sm" />
                                                                                            <span className="font-medium text-gray-700 text-sm sm:text-base">
                                                                                                {timeFrame.time}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>

                                                                                    <Input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        max="100"
                                                                                        value={timeFrame.percentage}
                                                                                        onChange={(e) => {
                                                                                            const newVal = e.target.value;
                                                                                            setLocalEdits((prev) => ({
                                                                                                ...prev,
                                                                                                [machine._id]:
                                                                                                    (prev[machine._id] ||
                                                                                                        timeFramesByMachineData?.data)?.map((tf) =>
                                                                                                            tf._id === timeFrame._id
                                                                                                                ? { ...tf, percentage: newVal }
                                                                                                                : tf
                                                                                                        ),
                                                                                            }));
                                                                                        }}
                                                                                        className="w-full text-center text-sm sm:text-base"
                                                                                        disabled={isUpdateBulkTimeFramesPending}
                                                                                    />
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>

                                                                    {/* Save / Cancel Buttons */}
                                                                    {/* <div className="flex justify-end gap-3 mt-6">
                                                                        <Button
                                                                            variant="secondary"
                                                                            className="bg-gray-200 hover:bg-gray-300"
                                                                            onClick={() => {
                                                                                setLocalEdits((prev) => {
                                                                                    const newEdits = { ...prev };
                                                                                    delete newEdits[machine._id];
                                                                                    return newEdits;
                                                                                });
                                                                                setApplyToAllPercentage("");
                                                                                setMultipleValues("");
                                                                            }}
                                                                        >
                                                                            Cancel
                                                                        </Button>

                                                                        <Button
                                                                            className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                                            onClick={() => {
                                                                                handelSaveChanges(machine._id);
                                                                            }}
                                                                            disabled={isUpdateBulkTimeFramesPending}
                                                                            loading={isUpdateBulkTimeFramesPending}
                                                                        >
                                                                            {isUpdateBulkTimeFramesPending ? 'Saving...' : 'Save Changes'}
                                                                        </Button>
                                                                    </div> */}
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </LoadingOverlay>
                                            </CardBody>
                                        )}

                                    </Card>
                                ))}
                            </div>
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
                size="sm"
                className="mx-4 sm:mx-0"
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
                                {machinesData?.data?.length > 0 && machinesData?.data?.map((m) => (
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

                <ModalFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleModalClose}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
                        disabled={isCreateTimeFramePending || isUpdateTimeFramePending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="timeFrameForm"
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
