"use client";
import React, { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { apiHelper } from "@/Services/index";
import { HTTPVERBS } from "@/utils/HTTPVERBS";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import TableHead from "@mui/material/TableHead";
import { enqueueSnackbar } from "notistack";

interface Profiles {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: number;
  email_verified_at: string;
  status: number;
  type: string;
  latitude: number;
  longitude: number;
  profile_picture: string;
  profile_picture_name?: string;
  profile_picture_url: any;
}

const Profiles = () => {
  const [profiles, setProfiles] = useState<Profiles[]>([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [profilesToEditId, setProfilesToEditId] = useState<Profiles | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  const fetchProfiles = async () => {
    const token = Cookies.get("token");
    const headers = { Authorization: `Bearer ${token}` };
    const { response, error } = await apiHelper(HTTPVERBS.GET, "admin/profile", headers, null);

    if (response) {
      try {
        const profileData = response?.data?.response?.data;
        if (profileData && typeof profileData === "object") {
          setProfiles(
            [profileData].map((profile) => ({
              ...profile,
              // profile_picture_name: profile.profile_picture_name || "N/A",
              profile_picture_name: profile.profile_picture_name || (profile.profile_picture ? profile.profile_picture.split('/').pop() : "N/A"),
            }))
          );
        } else {
          enqueueSnackbar("Profiles data is not in the expected format.", { variant: "warning", anchorOrigin: {vertical: "bottom", horizontal:"right"} });
        }
      } catch (err) {
        enqueueSnackbar("Error parsing profile data.", { variant: "error", anchorOrigin: { vertical:"bottom", horizontal:"right"} });
      }
    } else {
      enqueueSnackbar("Failed to fetch profiles.", { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right"} });
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleEditProfile = async () => {
    if (!profilesToEditId?.first_name || !profilesToEditId?.last_name || !profilesToEditId?.phone_number) {
      enqueueSnackbar("Please fill out all required fields.", { variant: "warning", anchorOrigin: { vertical: "bottom", horizontal: "right"} });
      return;
    }

    const token = Cookies.get("token");
    const headers = { Authorization: `Bearer ${token}` };
    const formData = new FormData();
    formData.append("first_name", profilesToEditId.first_name);
    formData.append("last_name", profilesToEditId.last_name);
    formData.append("email", profilesToEditId.email);
    formData.append("phone_number", profilesToEditId.phone_number.toString());
    formData.append("latitude", profilesToEditId.latitude.toString());
    formData.append("longitude", profilesToEditId.longitude.toString());

    if (profilePictureFile) {
      formData.append("profilePicture", profilePictureFile);
      formData.append("profile_picture_name", profilePictureFile.name);
    }
    console.log("Sending form data:", formData);

    const { response, error } = await apiHelper(HTTPVERBS.POST, "admin/profile/update", headers, formData);

    if (response) {
      setProfiles((prevProfiles) =>
        prevProfiles.map((profile) =>
          profile.id === profilesToEditId.id
            ? {
                ...profile,
                ...profilesToEditId,
                profile_picture: response?.data?.profile_picture || profile.profile_picture,
                profile_picture_name: profilePictureFile?.name || profile.profile_picture_name,
                profile_picture_url: response?.data?.profile_picture_url || profile.profile_picture_url,
                // profile_picture_name: profilePictureFile?.name || profile.profile_picture_name,
              }
            : profile
        )
      );
      enqueueSnackbar("Profile updated successfully!", { variant: "success", anchorOrigin: { vertical: "bottom", horizontal: "right"} });
      handleCloseEditModal();
    } else {
      enqueueSnackbar("Failed to update profile. Please try again.", { variant: "error", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
    }
  };


  const handleOpenEditModal = (profile: Profiles) => {
    setProfilesToEditId(profile);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setProfilesToEditId(null);
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-full">
        <Breadcrumb pageName="Business Profile" />
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 500 }} aria-label="Profile table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Email Verified At</TableCell>
                {/* <TableCell>Status</TableCell> */}
                <TableCell>Type</TableCell>
                <TableCell>Latitude</TableCell>
                <TableCell>Longitude</TableCell>
                <TableCell>Profile Picture</TableCell>
                <TableCell>Profile Picture Url</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profiles.map((profile, index) => (
                <TableRow key={profile.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{profile.first_name}</TableCell>
                  <TableCell>{profile.last_name}</TableCell>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>{profile.phone_number}</TableCell>
                  <TableCell>{new Date(profile.email_verified_at).toLocaleDateString()}</TableCell>
                  {/* <TableCell>{profile.status}</TableCell> */}
                  <TableCell>{profile.type}</TableCell>
                  <TableCell>{profile.latitude}</TableCell>
                  <TableCell>{profile.longitude}</TableCell>
                  <TableCell>{profile.profile_picture_name}</TableCell>
                  <TableCell>
                    <a href={profile.profile_picture_url} target="_blank" rel="noopener noreferrer">
                      {profile.profile_picture_url}
                    </a>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenEditModal(profile)}>
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Dialog open={openEditModal} onClose={handleCloseEditModal}>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="First Name"
              fullWidth
              value={profilesToEditId?.first_name || ""}
              onChange={(e) =>
                setProfilesToEditId((prev) => (prev ? { ...prev, first_name: e.target.value } : prev))
              }
            />
            <TextField
              margin="dense"
              label="Last Name"
              fullWidth
              value={profilesToEditId?.last_name || ""}
              onChange={(e) =>
                setProfilesToEditId((prev) => (prev ? { ...prev, last_name: e.target.value } : prev))
              }
            />
            <TextField
              margin="dense"
              label="Email"
              fullWidth
              value={profilesToEditId?.email || ""}
              onChange={(e) =>
                setProfilesToEditId((prev) => (prev ? { ...prev, email: e.target.value } : prev))
              }
            />
            <TextField
              margin="dense"
              label="Phone Number"
              fullWidth
              value={profilesToEditId?.phone_number || ""}
              onChange={(e) =>
                setProfilesToEditId((prev) => (prev ? { ...prev, phone_number: Number(e.target.value) } : prev))
              }
            />
            <TextField
              margin="dense"
              label="Latitude"
              fullWidth
              value={profilesToEditId?.latitude || ""}
              onChange={(e) =>
                setProfilesToEditId((prev) => (prev ? { ...prev, latitude: Number(e.target.value) } : prev))
              }
            />
            <TextField
              margin="dense"
              label="Longitude"
              type="number"
              fullWidth
              value={profilesToEditId?.longitude || ""}
              onChange={(e) =>
                setProfilesToEditId((prev) => (prev ? { ...prev, longitude: Number(e.target.value) } : null))
              }
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setProfilePictureFile(e.target.files[0]);
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditModal}>Cancel</Button>
            <Button onClick={handleEditProfile} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </DefaultLayout>
  );
};

export default Profiles;

