"use client"
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { apiHelper } from "@/Services/index";
import { HTTPVERBS } from "@/utils/HTTPVERBS";
import Cookies from "js-cookie";
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import TableHead from "@mui/material/TableHead";
import React, { useState, useEffect } from "react";
import { enqueueSnackbar } from "notistack";

interface Booking {
  id: number;
  post_id: number;
  user_id: number;
  card_id: number;
  charge_id: string;
  payment_status: string;
  status: string;
  date: string;
  created_at: string;
  updated_at: string;
  post: {
    id: number;
    name: string;
    price: number;
    description: string;
    status: number;
    created_at: string;
    updated_at: string;
    latitude: number;
    longitude: number;
  };
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    profile_picture_url: string;
  };
  card: {
    brand: string;
    last_four: string;
    exp_month: string;
    exp_year: string;
  };
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    const token = Cookies.get("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const { response, error } = await apiHelper(HTTPVERBS.GET, "admin/bookings", headers, null);
    if (response) {
      try {
        const bookingData = typeof response.data === "string" ? JSON.parse(response.data) : response.data.response.data;
        if (Array.isArray(bookingData)) {
          setBookings(bookingData);
        } else {
          setBookings([]);
        }
      } catch (error) {
        setBookings([]);
        enqueueSnackbar("Error parsing booking data", { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right" } });
      }
    } else {
      enqueueSnackbar("Cannot load bookings", { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right" } });
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-full">
        <Breadcrumb pageName="Bookings" />
        <div className="my-5">
          <h1 className="font-bold dark:text-white text-black">Bookings</h1>
        </div>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 500 }} aria-label="booking table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                {/* <TableCell>Post ID</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Card ID</TableCell>
                <TableCell>Charge ID</TableCell> */}
                <TableCell>Post Name</TableCell>
                <TableCell>Post Price</TableCell>
                {/* <TableCell>Post Latitude</TableCell>
                <TableCell>Post Longitude</TableCell>
                <TableCell>Post Creation</TableCell>
                <TableCell>Post Updation</TableCell> */}
                <TableCell>User Name</TableCell>
                <TableCell>User Email</TableCell>
                <TableCell>User's Phone Number</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                {/* <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking, index) => (
                <TableRow key={booking.id}>
                  <TableCell>{index + 1}</TableCell>
                  {/* <TableCell>{booking.post_id}</TableCell>
                  <TableCell>{booking.user_id}</TableCell>
                  <TableCell>{booking.card_id}</TableCell> */}
                  {/* <TableCell>{booking.charge_id}</TableCell> */}
                  <TableCell>{booking.post.name}</TableCell>
                  <TableCell>{booking.post.price}</TableCell>
                  {/* <TableCell>{booking.post.latitude}</TableCell>
                  <TableCell>{booking.post.longitude}</TableCell>
                  <TableCell>{new Date(booking.post.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(booking.post.updated_at).toLocaleDateString()}</TableCell> */}
                  <TableCell>{`${booking.user.first_name} ${booking.user.last_name}`}</TableCell>
                  <TableCell>{booking.user.email}</TableCell>
                  <TableCell>{booking.user.phone_number}</TableCell>
                  <TableCell>{booking.payment_status}</TableCell>
                  <TableCell>{booking.status}</TableCell>
                  <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                  {/* <TableCell>{new Date(booking.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(booking.updated_at).toLocaleDateString()}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
       {/* <div className="my-10">
       <div className="my-5">
          <h1 className="font-bold dark:text-white text-black">Bookings Post</h1>
        </div>
       <TableContainer component={Paper}>
            <Table sx={{ minWidth: 500 }} aria-label="Booking Post Table">
                <TableHead>
                    <TableRow>
                        <TableCell>Post Name</TableCell>
                        <TableCell>Post Price</TableCell>
                        <TableCell>Post Latitude</TableCell>
                        <TableCell>Post Longitude</TableCell>
                        <TableCell>Post Creation</TableCell>
                        <TableCell>Post Updation</TableCell>
                        <TableCell>Post Description</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.post.name}</TableCell>
                  <TableCell>{booking.post.price}</TableCell>
                  <TableCell>{booking.post.latitude}</TableCell>
                  <TableCell>{booking.post.longitude}</TableCell>
                  <TableCell>{new Date(booking.post.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(booking.post.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell>{booking.post.description || "No Description Provided"}</TableCell>
                </TableRow>
              ))}
                </TableBody>
            </Table>
        </TableContainer>
       </div> */}
      </div>
    </DefaultLayout>
  );
};

export default Bookings;
