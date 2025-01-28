"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { apiHelper } from "../../Services/index";
import { HTTPVERBS } from "@/utils/HTTPVERBS";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {Table,TableBody, TableCell, TableContainer, TableRow, Paper, IconButton, Box,Dialog, DialogTitle, DialogContent, DialogActions,TextField,Button,} from "@mui/material";
import TableHead from "@mui/material/TableHead";
import Modal from "@/components/CustomDeleteModal/page";

interface Animal {
  id: string;
  name: string;
  slug: string;
  status: number;
  created_at: string;
  updated_at: string;
}

const Animal = () => {
    const router = useRouter();
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [newAnimalName, setNewAnimalName] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [animalToDeleteId, setAnimalToDeleteId] = useState<string | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [animalToEditId, setAnimalToEditId] = useState<string | null>(null);
    const { enqueueSnackbar } = useSnackbar();

  const fetchAnimals = async () => {
    const token = Cookies.get("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const { response, error } = await apiHelper(HTTPVERBS.GET, "admin/animals", headers, null);
    if (response) {
      try {
        const animalsData = typeof response.data === "string" ? JSON.parse(response.data) : response?.data?.response?.data;
        setAnimals(Array.isArray(animalsData) ? animalsData : []);
      } catch (error) {
        setAnimals([]);
        enqueueSnackbar("Error parsing animals data", { variant: "error", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
      }
    } else {
      enqueueSnackbar(error || "Cannot load animals", { variant: "error", anchorOrigin: {vertical: "bottom", horizontal: "right"}});
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setNewAnimalName("");
  };

  const handleCreateAnimal = async () => {
    if (!newAnimalName) {
      enqueueSnackbar("Animal name is required", { variant: "warning", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
      return;
    }
    const token = Cookies.get("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const payload = { name: newAnimalName, status: 1 };

    const { response, error } = await apiHelper(HTTPVERBS.POST, "admin/animals/create", headers, payload);
    if (response) {
      enqueueSnackbar("Animal created successfully!", { variant: "success", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
      fetchAnimals();
      handleCloseModal();
    } else {
      enqueueSnackbar(error || "Failed to create animal", { variant: "error", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
    }
  };

  const handleOpenDeleteModal = (id: string) => {
    setAnimalToDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setAnimalToDeleteId(null);
    setDeleteModalOpen(false);
  };

  const handleAnimalDelete = async () => {
    if (!animalToDeleteId) return;
    const token = Cookies.get("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const { response, error } = await apiHelper(HTTPVERBS.DELETE,`admin/animals/delete/${animalToDeleteId}`,headers,null
    );
    if (response) {
      enqueueSnackbar("Animal deleted successfully!", { variant: "success", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
      fetchAnimals();
      handleCloseDeleteModal();
    } else {
      enqueueSnackbar(error || "Failed to delete animal", { variant: "error", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
    }
  };

  const handleOpenEditModal = (id: string, currentName: string) => {
    setAnimalToEditId(id);
    setNewAnimalName(currentName);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setAnimalToEditId(null);
    setNewAnimalName("");
    setEditModalOpen(false);
  };

  const handleEditAnimal = async () => {
    if (!animalToEditId || !newAnimalName.trim()) {
      enqueueSnackbar("Animal name is required", { variant: "warning", anchorOrigin: { vertical: "bottom", horizontal: "right" } });
      return;
    }

    const token = Cookies.get("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const payload = { name: newAnimalName };

    const { response, error } = await apiHelper(HTTPVERBS.POST, `admin/animals/update/${animalToEditId}`, headers, payload);
    if (response) {
      enqueueSnackbar("Animal updated successfully!", { variant: "success", anchorOrigin: { vertical: "bottom", horizontal: "right" } });
      fetchAnimals();
      handleCloseEditModal();
    } else {
      enqueueSnackbar(error || "Failed to update animal", { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right" } });
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-full">
        <Breadcrumb pageName="Animals" />
        <div className="flex justify-between items-center my-5">
          <h1 className="font-bold dark:text-white text-black">Animals</h1>
          <button onClick={handleOpenModal} className="py-3 px-5 bg-btnColor text-white border-2 rounded-lg">
            Create
          </button>
        </div>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 500 }} aria-label="animal table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Animal Name</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Update At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {animals.map((animal, index) => (
                <TableRow key={ index + 1 }>
                  <TableCell>{ index + 1 }</TableCell>
                  <TableCell component="th" scope="row">
                    {animal.name}
                  </TableCell>
                  <TableCell>{animal.slug}</TableCell>
                  <TableCell>{animal.status}</TableCell>
                  <TableCell>{new Date(animal.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(animal.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenEditModal(animal.id, animal.name)}>
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </IconButton>
                    <IconButton onClick={() => handleOpenDeleteModal(animal.id)}>
                      <FontAwesomeIcon icon={faTrash}/>
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
                    Create New Animal
                </DialogTitle>
                <DialogContent
                    sx={{display: "flex",flexDirection: "column", gap: "16px",}}>
                    <TextField
                    autoFocus
                    margin="dense"
                    label="Animal Name"
                    type="text"
                    fullWidth
                    value={newAnimalName}
                    onChange={(e) => setNewAnimalName(e.target.value)}
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
                    onClick={handleCreateAnimal}
                    variant="contained"
                    color="primary"
                    sx={{backgroundColor: "#007BFF",color: "#fff",textTransform: "none",borderRadius: "8px",padding: "8px 16px","&:hover": {backgroundColor: "#0056b3",},}}>
                    Save
                    </Button>
                </DialogActions>
                </Dialog>
                <Modal
                isOpen={deleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleAnimalDelete}
                itemType="animal"
                itemId={animalToDeleteId}
                />
                
                <Dialog
                open={editModalOpen}
                onClose={handleCloseEditModal}
                sx={{
                    "& .MuiDialog-paper": {
                    width: "400px",
                    padding: "10px",
                    borderRadius: "10px",
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",},}}>
                <DialogTitle
                    sx={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "#333",
                    }}>
                    Edit Animal
                </DialogTitle>
                <DialogContent
                    sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    }}>
                    <TextField
                    autoFocus
                    margin="dense"
                    label="Animal Name"
                    type="text"
                    fullWidth
                    value={newAnimalName}
                    onChange={(e) => setNewAnimalName(e.target.value)}
                    sx={{
                        "& .MuiInputLabel-root": { color: "#555" },
                        "& .MuiInputBase-root": {
                        borderRadius: "8px",
                        },
                    }}/>
                </DialogContent>
                <DialogActions
                    sx={{
                    justifyContent: "space-between",
                    padding: "16px 24px",
                    }}>
                    <Button
                    onClick={handleCloseEditModal}
                    sx={{
                        color: "#000",
                        borderColor: "#000",
                        "&:hover": {
                        borderColor: "#000",
                        },
                    }}> 
                    Cancel
                    </Button>
                    <Button
                    onClick={handleEditAnimal}
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
                        },
                    }}>
                    Save
                    </Button>
                </DialogActions>
                </Dialog>

      </div>
    </DefaultLayout>
  );
};

export default Animal;
