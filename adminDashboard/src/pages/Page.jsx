import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout"; // adjust path
import Input, { Textarea } from "../components/ui/Input"; // adjust path
import Button from "../components/ui/Button"; // adjust path
import useUserApi, { useFetchUserApi, useUpdateProfileApi } from "../hooks/useUserApi";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const {data, isPending, isError, error} = useFetchUserApi()
  const {updateProfile, isUpdating, isUpdateError, updateError} = useUpdateProfileApi()

  useEffect(() => {
    setProfile((prev) => ({ ...prev, name: data?.data?.name, email: data?.data?.email }));
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated profile:", profile);
    updateProfile({name: profile.name, email: profile.email});
  };

  return (
    <>
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <Input
              label="Name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
            />
            {/* <Input
              label="Last Name"
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              required
            /> */}
          </div>

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={profile.email}
            onChange={handleChange}
            required
          />

          {/* <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={profile.phone}
            onChange={handleChange}
          />

          <Textarea
            label="Bio"
            name="bio"
            rows={4}
            value={profile.bio}
            onChange={handleChange}
            helperText="Tell us a little about yourself."
          /> */}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isUpdating} disabled={isUpdating}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProfilePage;
