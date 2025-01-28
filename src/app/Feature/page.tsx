"use client"
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { apiHelper } from "@/Services/index";
import { HTTPVERBS } from "@/utils/HTTPVERBS";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, IconButton, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import TableHead from "@mui/material/TableHead";
import React, { useState, useEffect } from "react";
import { enqueueSnackbar } from "notistack";
import Modal from "@/components/CustomDeleteModal/page"; 

interface Feature {
    id: number,
    name: string,
    status: number,
    created_at: string,
    updated_at: string,
}

const Features = () => {
    const [feature, setFeateure] = useState<Feature[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [newFeatureName, setNewFeatureName] = useState("")
    const [featureToDelete, setFeatureToDelete] = useState<number | null>(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [featureToEditId, setFeatureToEditId] = useState<Feature | null>(null);
    const [openEditModal, setOpenEditModal] = useState(false);

    const fetchFeature = async () => {
        const token = Cookies.get("token");
        const headers = {
        Authorization: `Bearer ${token}`,
        };
        const { response, error } = await apiHelper(HTTPVERBS.GET, "admin/features", headers, null);
        if (response) {
            try {
              const FeatureData = typeof response.data === "string" ? JSON.parse(response.data) : response?.data?.response?.data;
              if (Array.isArray(FeatureData)) {
                setFeateure(FeatureData);
              } else {
                setFeateure([]);
              }
            } catch (error) {
              setFeateure([]);
              enqueueSnackbar("Error parsing Feature data", { variant: "error", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
            }
          } else {
            enqueueSnackbar("Cannot load Features", { variant: "error", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
          }
        };
      
        useEffect(() => {
          fetchFeature();
        }, []);

        const handleOpenModal = () => setOpenModal(true);
        const handleCloseModal = () => {
          setOpenModal(false);
          setNewFeatureName("");
        };

        const handleCreateFeature = async () => {
            if(!newFeatureName) {
                enqueueSnackbar("Feature name required", { variant: "error", anchorOrigin: {vertical: "bottom", horizontal: "right"}})
            }
            const token = Cookies.get("token");
            const headers = {
            Authorization: `Bearer ${token}`,
            };
            const payload = { name: newFeatureName, status: 1 };
            const { response, error } = await apiHelper(HTTPVERBS.POST, "admin/features/create", headers, payload);
            if (response) {
                enqueueSnackbar("Category created successfully!", { variant: "success", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
                fetchFeature();
                handleCloseModal();
              } else {
                enqueueSnackbar("Failed to create category", { variant: "error", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
              }
        }

        const handleDeleteFeature = async () => {
            if (featureToDelete) {
                const token = Cookies.get("token");
                const headers = {
                    Authorization: `Bearer ${token}`,
                };
                const { response, error } = await apiHelper (HTTPVERBS.DELETE, `admin/features/delete/${featureToDelete}`, headers, null);
                 if (response) {
                    setFeateure((prevFeatures) =>
                      prevFeatures.filter((feature) => feature.id !== featureToDelete)
                    );
                    enqueueSnackbar("Category deleted successfully!", { variant: "success", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
                    handleCloseDeleteModal();
                  } 
                  else {
                    enqueueSnackbar("Failed to delete category", { variant: "error", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
                  }
            }
        }
        const handleOpenDeleteModal = (categoryId: number) => {
            setFeatureToDelete(categoryId);
            setOpenDeleteModal(true);
          };

          const handleCloseDeleteModal = () => {
            setOpenDeleteModal(false);
            setFeatureToDelete(null);
          };

          const handleEditFeature = async () => {
            if (featureToEditId) {
                const token = Cookies.get("token");
                const headers = {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                };
                const { response, error } = await apiHelper(HTTPVERBS.POST, `admin/features/update/${featureToEditId.id}`, headers, {
                    name: featureToEditId.name,
                });
                if (response) {
                    setFeateure((prevFeatures) =>
                      prevFeatures.map((feature) =>
                        feature.id === featureToEditId.id ? { ...featureToEditId } : feature
                    )
                    );
                    enqueueSnackbar("Category updated successfully!", { variant: "success", anchorOrigin: { vertical: "bottom", horizontal: "right"} });
                    handleCloseEditModal();
                  } else {
                    enqueueSnackbar(error || "Failed to update category", { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right"} });
                  }
            }
          }

          const handleOpenEditModal = (category: Feature) => {
            setFeatureToEditId(category);
            setOpenEditModal(true);
          };
        
          const handleCloseEditModal = () => {
            setOpenEditModal(false);
            setFeatureToEditId(null);
          };

        return (
            <DefaultLayout>
                <div  className="mx-auto max-w-full">
                <Breadcrumb pageName="Features"/>
                <div className="flex justify-between items-center my-5">
                    <h1  className="font-bold dark:text-white text-black">Features</h1>
                    <button  onClick={handleOpenModal} className="py-3 px-5 bg-btnColor text-white border-2 rounded-lg">Create</button>
                </div>

                <TableContainer  component={Paper}>
                    <Table sx={{ minWidth: 500 }} aria-label="feature table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell>UpdatedAt</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {feature.map ((feature, index)=> (
                                <TableRow key={index + 1}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{feature.name}</TableCell>
                                    <TableCell>{feature.status}</TableCell>
                                    <TableCell>{new Date(feature.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(feature.updated_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                    <IconButton onClick={() => handleOpenEditModal(feature)}>
                                        <FontAwesomeIcon icon={faPenToSquare} />
                                    </IconButton>
                                    <IconButton onClick={()=> handleOpenDeleteModal(feature.id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </IconButton>
                                </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                <Dialog
                    open={openModal}
                    onClose={handleCloseModal}
                    sx={{"& .MuiDialog-paper": { width: "400px",padding: "10px",borderRadius: "10px",boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",}, }}>
                <DialogTitle
                    sx={{fontSize: "20px",fontWeight: "bold",textAlign: "center",color: "#333",}}>
                    Create New Feature
                </DialogTitle>
                <DialogContent
                    sx={{display: "flex",flexDirection: "column", gap: "16px",}}>
                    <TextField
                    autoFocus
                    margin="dense"
                    label="Feature Name"
                    type="text"
                    fullWidth
                    value={newFeatureName}
                    onChange={(e) => setNewFeatureName(e.target.value)}
                    sx={{ "& .MuiInputLabel-root": { color: "#555" }, "& .MuiInputBase-root": {borderRadius: "8px", },}}/>
                </DialogContent>
                <DialogActions
                    sx={{justifyContent: "space-between",padding: "16px 24px",}}>
                    <Button
                    onClick={handleCloseModal}
                    sx={{color: "#000",borderColor: "#000","&:hover": {borderColor: "#000",},}}>
                    Cancel
                    </Button>
                    <Button
                    onClick={handleCreateFeature}
                    variant="contained"
                    color="primary"
                    sx={{backgroundColor: "#007BFF",color: "#fff",textTransform: "none",borderRadius: "8px",padding: "8px 16px","&:hover": {backgroundColor: "#0056b3",},}}>
                    Save
                    </Button>
                </DialogActions>
            </Dialog>
                <Modal
                isOpen={openDeleteModal}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteFeature}
                itemType="feature"
                itemId={featureToDelete}
                />

            <Dialog open={openEditModal} onClose={handleCloseEditModal}>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              fullWidth
              value={featureToEditId?.name || ""}
              onChange={(e) =>
                setFeatureToEditId((prev) => (prev ? { ...prev, name: e.target.value } : prev))
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditModal} 
            sx={{
                color: "#000",
                borderColor: "#000",
                "&:hover": {
                borderColor: "#000",
                },}}>
              Cancel
            </Button>
            <Button onClick={handleEditFeature}
            variant="contained"
            color="primary"
            sx={{
                backgroundColor: "#007BFF",
                color: "#fff",
                textTransform: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                "&:hover": {
                backgroundColor: "#0056b3",
                },}}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
            </div>
            </DefaultLayout>
        )
    } 


export default Features