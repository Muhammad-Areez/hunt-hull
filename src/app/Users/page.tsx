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

interface User {
    id: number,
    first_name: string,
    last_name: string,
    email: string,
    fcm_token: string,
    phone_number: number,
    email_verified_at: string,
    profile_picture: any,
    status: number,
    is_verified: number,
    type: string,
    social_id: string,
    platform: string,
    latitude: number,
    longitude: number,
    address: string,
    created_at: number,
    updated_at: number,
    license_number: string,
    stripe_id: number,
    deleted_at: number,
}

const Users = () => {
    const [user, setUser] = useState<User[]>([])

    const fetchUsers = async () => {
        const token = Cookies.get("token");
        const header = { Authorization: `Bearer ${token}` };

        const { response, error } = await apiHelper(HTTPVERBS.GET, "admin/users", header, null);
        console.log("API Response:", response);
        if(response) {
            try {
                const userData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data.response.data;
                if (Array.isArray(userData)) {
                    setUser(userData);
                  } else {
                    setUser([]);
                  }
            } catch (error){
                setUser([]);
                enqueueSnackbar("Error parsing User data", { variant: "error", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
            }
        }
        else {
            enqueueSnackbar("Cannot load user", { variant: "error", anchorOrigin: {vertical: "bottom", horizontal: "right"} });
          }
    }

    useEffect(() => {
        fetchUsers();
    }, []);


    return (
        <DefaultLayout>
             <div  className="mx-auto max-w-full">
            <Breadcrumb pageName="Users"/>
            
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 900 }} aria-label="User table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>First Name</TableCell>
                            <TableCell>Last Name</TableCell>
                            <TableCell>Email</TableCell>
                            {/* <TableCell>Token</TableCell> */}
                            <TableCell>Phone Number</TableCell>
                            <TableCell>Email Verified at</TableCell>
                            <TableCell>Profile Picture</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Verified</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell style={
                                { whiteSpace: "nowrap"}
                            }>Social ID</TableCell>
                            <TableCell>Platform</TableCell>
                            <TableCell>Longitude</TableCell>
                            <TableCell>License Number</TableCell>
                            <TableCell>Latitude</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Stripe ID</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell>Deleted At</TableCell>
                            <TableCell>Updated At</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {user.map ((user, index )=> (
                            <TableRow key={user.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.first_name}</TableCell>
                                <TableCell>{user.last_name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                {/* <TableCell>{user.fcm_token}</TableCell> */}
                                <TableCell>{user.phone_number}</TableCell>
                                <TableCell>{new Date(user.email_verified_at).toLocaleDateString()}</TableCell>
                                <TableCell>{user.profile_picture || "N/A"}</TableCell>
                                <TableCell>{user.status}</TableCell>
                                <TableCell>{user.is_verified}</TableCell>
                                <TableCell>{user.type}</TableCell>
                                <TableCell>{user.social_id || "N/A"}</TableCell>
                                <TableCell>{user.platform || "N/A"}</TableCell>
                                <TableCell>{user.longitude}</TableCell>
                                <TableCell>{user.license_number || "N/A"}</TableCell>
                                <TableCell>{user.latitude}</TableCell>
                                <TableCell>{user.address}</TableCell>
                                <TableCell>{user.stripe_id || "N/A"}</TableCell>
                                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{user.deleted_at|| "N/A"}</TableCell>
                                <TableCell>{new Date(user.updated_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            </div>
        </DefaultLayout>
    )
}

export default Users;