import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Table from "../components/ui/Table";
import Pagination from "../components/Paginate";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "../components/ui/Modal";
import Loading, { LoadingOverlay, LoadingPage } from "../components/ui/Loading";
import { useCreateUserApi, useDeleteUserApi, useGetUserListApi, useUpdateUserApi } from "../hooks/useUserApi";
import { useDebounce } from "../hooks/useDebounce";
import { Input, PasswordInput, Button } from "../components/ui";

function AdminManagement() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  // Debounce search input with 500ms delay
  const debouncedSearch = useDebounce(search, 500);


  
  // Reset page when search or limit changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit]);
  
  // API call with debounced search and pagination
  const { data, isPending, isError, error } = useGetUserListApi({ 
    page, 
    limit, 
    search: debouncedSearch.trim() || ''
  });

  const { createUser, isCreatingUserPending, isCreatingUserError, creatingUserError } = useCreateUserApi();
  const { updateUser, isUpdatingUserPending, isUpdatingUserError, updatingUserError } = useUpdateUserApi();
  const { deleteUser, isDeletingUserPending, isDeletingUserError, deletingUserError } = useDeleteUserApi();
  // Handle edit
  const handleEdit = (row) => {
    setEditAdmin(row);
    setFormData({
      name: row.name || '',
      email: row.email || '',
      password: ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = (row) => {
    // console.log(row)
    const warning = window.confirm('Are you sure you want to delete this user?');
    if(warning){
      deleteUser({userId: row._id});
    }
  }

  // Show loading page if data is loading
  if (isPending) {
    return <LoadingPage text="Loading users..." />;
  }

  // Show error state if data failed to load
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Failed to load users</div>
          <p className="text-gray-600">{error?.message || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  // Table Columns
  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3">
          <button
            className="text-sm text-indigo-600 hover:underline"
            onClick={() => handleEdit(row)}
          >
            Edit
          </button>
          <button
            className="text-sm text-red-600 hover:underline"
            onClick={() => {
              // Handle delete logic here
              handleDelete(row);
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!editAdmin && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!editAdmin && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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

  // Handle search input change
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if(editAdmin){
      const data = {
        userId: editAdmin._id,
        name: formData.name,
        email: formData.email,
      }
      // console.log(data)
      updateUser(data,{
        onSuccess: () => {
          setFormData({ name: '', email: '', password: '' });
          setShowModal(false);
        },
      });
    }else{
      createUser(formData,{
        onSuccess: () => {
          setFormData({ name: '', email: '', password: '' });
          setShowModal(false);
        },
      });
    }
    handleModalClose();
  };

  // Handle modal open/close
  const handleModalOpen = () => {
    setShowModal(true);
    setEditAdmin(null);
    setFormData({ name: '', email: '', password: '' });
    setErrors({});
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditAdmin(null); 
    setFormData({ name: '', email: '', password: '' });
    setErrors({});
  };


  return (
    <>
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Admin Users</h3>
          <Button
            onClick={handleModalOpen}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            + Add Admin
          </Button>
        </CardHeader>

        <CardBody>
          {/* Search Input */}
          <div className="mb-4">
            <div className="relative w-full max-w-md">
              <Input
                type="text"
                placeholder="Search users by name..."
                value={search}
                onChange={handleSearch}
                className="w-full pr-8"
              />
              {/* Search indicator */}
              {search !== debouncedSearch && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </div>
            {/* {search !== debouncedSearch && (
              <p className="text-xs text-gray-500 mt-1">
                Searching...
              </p>
            )} */}
          </div>

          <LoadingOverlay isLoading={isPending}>
            {data?.data?.length > 0 ? (
              <>
                <Table responsive columns={columns} data={data.data} />
                <Pagination
                  currentPage={data.pagination?.currentPage || page}
                  totalPages={data.pagination?.totalPages || 1}
                  onPageChange={(p) => setPage(p)}
                  limit={limit}
                  onLimitChange={(newLimit) => setLimit(newLimit)}
                  totalItems={data.pagination?.totalItems || data.count}
                />
              </>
            ) : !isPending ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">
                  {debouncedSearch ? 'No users found matching your search' : 'No users found'}
                </div>
                <p className="text-gray-400">
                  {debouncedSearch ? 'Try adjusting your search terms' : 'Start by adding a new admin user'}
                </p>
              </div>
            ) : null}
          </LoadingOverlay>
        </CardBody>
      </Card>

      {/* Reusable Modal with Header/Body/Footer */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        size="md"
      >
        <ModalHeader onClose={handleModalClose}>
          {editAdmin ? "Edit Admin" : "Add Admin"}
        </ModalHeader>

        <ModalBody>
          <form
            id="adminForm"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter admin name"
                className={`w-full ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter admin email"
                className={`w-full ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password only when creating */}
            {!editAdmin && (
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <PasswordInput
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  className={`w-full ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            )}
          </form>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleModalClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            disabled={isCreatingUserPending || isUpdatingUserPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="adminForm"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            disabled={isCreatingUserPending || isUpdatingUserPending}
            loading={isCreatingUserPending || isUpdatingUserPending}
          >
            {editAdmin ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default AdminManagement;
