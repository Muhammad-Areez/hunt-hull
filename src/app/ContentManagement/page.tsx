"use client"
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { apiHelper } from "@/Services/index";
import { HTTPVERBS } from "@/utils/HTTPVERBS";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, IconButton, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Tab } from "@mui/material";
import TableHead from "@mui/material/TableHead";
import React, { useState, useEffect } from "react";
import { enqueueSnackbar } from "notistack";
import Modal from "@/components/CustomDeleteModal/page"; 

interface ContentManagement {
    id: number,
    name: string,
    slug: string,
    link: any,
    description: string,
    status: number,
    created_at: string,
    updated_at: string,
}

const ContentManagement = () => {
    const [content, setContent] = useState<ContentManagement[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [newContentName, setNewContentName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [contentToDelete, setContentToDelete] = useState<number | null>(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [contentToEditId, setContentToEditId] = useState<ContentManagement | null>(null)
    const [openEditModal, setOpenEditModal] = useState(false);
    
    const fetchContent = async () => {
        const token = Cookies.get("token");
        const header = { Authorization: `Bearer ${token}` };
    
        const { response, error } = await apiHelper(HTTPVERBS.GET, "admin/pages", header, null);
    
        if (error) {
            console.error("Error fetching content:", error);
            enqueueSnackbar("Cannot load Content", { variant: "error" });
            return;
        }
    
        try {
            const contentData = response?.data?.response?.data || [];
            console.log("API Response:", contentData);
            setContent(contentData); 
        } catch (err) {
            console.error("Error parsing Content data:", err);
            setContent([]);
            enqueueSnackbar("Error parsing Content data", { variant: "error" });
        }
    };
    
    useEffect(() => {
        fetchContent();
      }, []);

      const handleOpenModal = () => setOpenModal(true);
      const handleCloseModal = () => {
        setOpenModal(false);
        setNewContentName("");
      };

    const handleCreateContent = async () => {
        if (!newContentName || !newDescription) {
            enqueueSnackbar("Content name & description required", {
                variant: "error",
                anchorOrigin: { vertical: "bottom", horizontal: "right" },
            });
            return;
        }
        const token = Cookies.get("token");
        const headers = {
            Authorization: `Bearer ${token}`,
        };
        const payload = { name: newContentName, description: newDescription };
        const { response, error } = await apiHelper(HTTPVERBS.POST, "admin/pages/create", headers, payload);
    
        if (response) {
            enqueueSnackbar("Category created successfully", {
                variant: "success",
                anchorOrigin: { vertical: "bottom", horizontal: "right" },
            });
            const newCategory = {
                id: response.data.id, 
                name: newContentName,
                slug: response.data.slug, 
                link: response.data.link || null, 
                description: newDescription,
                status: 1, 
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setContent((prevContent) => [newCategory, ...prevContent]); 
            handleCloseModal();
        } else {
            enqueueSnackbar("Failed to create category", {
                variant: "error",
                anchorOrigin: { vertical: "bottom", horizontal: "right" },
            });
        }
    };
    
    const handleDeleteContent = async () => {
        if (contentToDelete) {
            const token = Cookies.get("token");
            const headers = {
                Authorization: `Bearer ${token}`,
            }
            const { response, error } = await apiHelper(HTTPVERBS.DELETE, `admin/pages/delete/${contentToDelete}`, headers, null );
            if (response) {
                setContent((prevContent) =>
                  prevContent.filter((content) => content.id !== contentToDelete)
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
        setContentToDelete(categoryId);
        setOpenDeleteModal(true);
      };

      const handleCloseDeleteModal = () => {
        setOpenDeleteModal(false);
        setContentToDelete(null);
      };

      const handleEditcontent = async () => {
        if(contentToEditId) {
            const token = Cookies.get("token");
                const headers = {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                };
                const { response, error } = await apiHelper(HTTPVERBS.POST, `admin/pages/update/${contentToEditId.id}`, headers, {
                    name: contentToEditId.name,
                    link: contentToEditId.link,
                    status: contentToEditId.status,
                    description: contentToEditId.description,
                });
                if (response) {
                    setContent((prevContent) =>
                      prevContent.map((content) =>
                        content.id === contentToEditId.id ? { ...contentToEditId } : content
                    )
                    );
                    enqueueSnackbar("Category updated successfully!", { variant: "success", anchorOrigin: { vertical: "bottom", horizontal: "right"} });
                    handleCloseEditModal();
                  } else {
                    enqueueSnackbar(error || "Failed to update category", { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right"} });
                  }
        }
      }
      const handleOpenEditModal = (category: ContentManagement) => {
        setContentToEditId(category);
        setOpenEditModal(true);
      };
    
      const handleCloseEditModal = () => {
        setOpenEditModal(false);
        setContentToEditId(null);
      };

    return (
        <DefaultLayout>
            <div  className="mx-auto max-w-full">
            <Breadcrumb pageName="Content Management"/>
            <div className="flex justify-between items-center my-5">
                    <h1  className="font-bold dark:text-white text-black">Content</h1>
                    <button onClick={handleOpenModal} className="py-3 px-5 bg-btnColor text-white border-2 rounded-lg">Create</button>
                </div>
           <div className="overflow-x-auto">
           <TableContainer component={Paper}>
                <Table sx={{ minWidth: 900 }} aria-label="Content table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Slug</TableCell>
                            <TableCell>Link</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell>Updated At</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {content.map ((content, index) => (
                            <TableRow key={content.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{content.name}</TableCell>
                                <TableCell>{content.slug}</TableCell>
                                <TableCell>{content.link}</TableCell>
                                <TableCell>{content.status}</TableCell>
                                <TableCell>{new Date(content.created_at).toLocaleDateString ()}</TableCell>
                                <TableCell>{new Date(content.updated_at).toLocaleDateString ()}</TableCell>
                                <TableCell>{content.description}</TableCell>
                                <TableCell>
                               <div className="flex g-8px">
                               <IconButton onClick={() => handleOpenEditModal(content)}>
                                        <FontAwesomeIcon icon={faPenToSquare} />
                                    </IconButton>
                                    <IconButton onClick={()=> handleOpenDeleteModal(content.id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </IconButton>
                               </div>
                                </TableCell>
                                
                            </TableRow>
                        ))}
                    </TableBody>
                   
                </Table>
            </TableContainer>
            <Modal
                isOpen={openDeleteModal}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteContent}
                itemType="content"
                itemId={contentToDelete}
                />
            <Dialog
                    open={openModal}
                    onClose={handleCloseModal}
                    sx={{"& .MuiDialog-paper": { width: "400px",padding: "10px",borderRadius: "10px",boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",}, }}>
                <DialogTitle
                    sx={{fontSize: "20px",fontWeight: "bold",textAlign: "center",color: "#333",}}>
                    Create New Content
                </DialogTitle>
                <DialogContent
                    sx={{display: "flex",flexDirection: "column", gap: "16px",}}>
                    <TextField
                    autoFocus
                    margin="dense"
                    label="Content Name"
                    type="text"
                    fullWidth
                    value={newContentName}
                    onChange={(e) => setNewContentName(e.target.value)}
                    sx={{ "& .MuiInputLabel-root": { color: "#555" }, "& .MuiInputBase-root": {borderRadius: "8px", },}}/>
                    <TextField
                    autoFocus
                    margin="dense"
                    label="Content Description"
                    type="text"
                    fullWidth
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
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
                    onClick={handleCreateContent}
                    variant="contained"
                    color="primary"
                    sx={{backgroundColor: "#007BFF",color: "#fff",textTransform: "none",borderRadius: "8px",padding: "8px 16px","&:hover": {backgroundColor: "#0056b3",},}}>
                    Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEditModal} onClose={handleCloseEditModal}>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Content Name"
              fullWidth
              value={contentToEditId?.name || ""}
              onChange={(e) =>
                setContentToEditId((prev) => (prev ? { ...prev, name: e.target.value } : prev))
              }
            />
            <TextField
              autoFocus
              margin="dense"
              label="Content Link"
              fullWidth
              value={contentToEditId?.link || ""}
              onChange={(e) =>
                setContentToEditId((prev) => (prev ? { ...prev, link: e.target.value } : prev))
              }
            />
            <TextField
              autoFocus
              margin="dense"
              label="Content Description"
              fullWidth
              value={contentToEditId?.description || ""}
              onChange={(e) =>
                setContentToEditId((prev) => (prev ? { ...prev, description: e.target.value } : prev))
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
            <Button onClick={handleEditcontent}
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
            </div>
        </DefaultLayout>
    )
}

export default ContentManagement