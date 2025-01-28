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
import { profile } from "console";

interface Category {
  id: number;
  name: string;
  slug: string;
  status: number;
  created_at: string;
  updated_at: string;
}

const Category = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [categoryToEditId, setCategoryToEditId] = useState<Category | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const fetchCategory = async () => {
    const token = Cookies.get("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const { response, error } = await apiHelper(HTTPVERBS.GET, "admin/categories", headers, null);
    if (response) {
      try {
        const categoryData = typeof response.data === "string" ? JSON.parse(response.data) : response.data.response.data;
        if (Array.isArray(categoryData)) {
          setCategories(categoryData);
        } else {
          setCategories([]);
        }
      } catch (error) {
        setCategories([]);
        enqueueSnackbar("Error parsing category data", { variant: "error" });
      }
    } else {
      enqueueSnackbar("Cannot load categories", { variant: "error" });
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const handleOpenEditModal = (category: Category) => {
    setCategoryToEditId(category);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setCategoryToEditId(null);
  };

  const handleEditCategory = async () => {
    if (categoryToEditId) {
      const token = Cookies.get("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const { response, error } = await apiHelper(HTTPVERBS.POST, `admin/categories/update/${categoryToEditId.id}`, headers, {
        name: categoryToEditId.name,
        slug: categoryToEditId.slug,
      });
      if (response) {
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category.id === categoryToEditId.id ? { ...categoryToEditId } : category
          )
        );
        enqueueSnackbar("Category updated successfully!", { variant: "success", anchorOrigin: { vertical: "bottom", horizontal: "right"} });
        handleCloseEditModal();
      } else {
        enqueueSnackbar(error || "Failed to update category", { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right"} });
      }
    }
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      const token = Cookies.get("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const { response, error } = await apiHelper(HTTPVERBS.DELETE, `admin/categories/delete/${categoryToDelete}`, headers, null);
      if (response) {
        setCategories((prevCategories) =>
          prevCategories.filter((category) => category.id !== categoryToDelete)
        );
        enqueueSnackbar("Category deleted successfully!", { variant: "success", anchorOrigin: { vertical: "bottom", horizontal: "right"} });
        handleCloseDeleteModal();
      } else {
        enqueueSnackbar(error || "Failed to delete category", { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right"} });
      }
    }
  };

  const handleOpenDeleteModal = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setNewCategoryName("");
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName) {
        enqueueSnackbar("Category Name required", { variant: "warning", anchorOrigin: {vertical: "bottom", horizontal: "right"}})
        return;
    }
    const token = Cookies.get("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const payload = { name: newCategoryName, status: 1 };
    const { response, error } = await apiHelper(HTTPVERBS.POST, "admin/categories/create", headers, payload)
    if (response) {
        enqueueSnackbar("Category created successfully!", { variant: "success", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
        fetchCategory();
        handleCloseModal();
      } else {
        enqueueSnackbar("Failed to create category", { variant: "error", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
      }
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-full">
        <Breadcrumb pageName="Category" />
        <div className="flex justify-between items-center my-5">
          <h1 className="font-bold dark:text-white text-black">Category</h1>
          <button onClick={handleOpenModal} className="py-3 px-5 bg-btnColor text-white border-2 rounded-lg">Create</button>
        </div>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 500 }} aria-label="category table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category, index) => (
                <TableRow key={ index + 1}>
                  <TableCell>{index + 1 }</TableCell>
                  <TableCell component="th" scope="row">
                    {category.name}
                  </TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>{category.status}</TableCell>
                  <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(category.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenEditModal(category)}>
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </IconButton>
                    <IconButton onClick={() => handleOpenDeleteModal(category.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
        <Dialog open={openEditModal} onClose={handleCloseEditModal}>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              fullWidth
              value={categoryToEditId?.name || ""}
              onChange={(e) =>
                setCategoryToEditId((prev) => (prev ? { ...prev, name: e.target.value } : prev))
              }
            />
              <TextField
              margin="dense"
              label="Slug"
              fullWidth
              value={categoryToEditId?.slug || ""}
              onChange={(e) =>
                setCategoryToEditId((prev) => (prev ? { ...prev, slug: e.target.value } : prev))
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
            <Button onClick={handleEditCategory}
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
        <Modal
          isOpen={openDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteCategory}
          itemType="category"
          itemId={categoryToDelete}
        />
        <Dialog
            open={openModal}
            onClose={handleCloseModal}
            sx={{"& .MuiDialog-paper": { width: "400px",padding: "10px",borderRadius: "10px",boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",}, }}>
                <DialogTitle
                    sx={{fontSize: "20px",fontWeight: "bold",textAlign: "center",color: "#333",}}>
                    Create New Category
                </DialogTitle>
                <DialogContent
                    sx={{display: "flex",flexDirection: "column", gap: "16px",}}>
                    <TextField
                    autoFocus
                    margin="dense"
                    label="Category Name"
                    type="text"
                    fullWidth
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
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
                    onClick={handleCreateCategory}
                    variant="contained"
                    color="primary"
                    sx={{backgroundColor: "#007BFF",color: "#fff",textTransform: "none",borderRadius: "8px",padding: "8px 16px","&:hover": {backgroundColor: "#0056b3",},}}>
                    Save
                    </Button>
                </DialogActions>
            </Dialog>
      </div>
    </DefaultLayout>
  );
};

export default Category;
