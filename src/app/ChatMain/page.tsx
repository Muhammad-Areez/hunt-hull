"use client"
import React, { useState, useEffect, use } from "react"
import DefaultLayout from "@/components/Layouts/DefaultLayout"
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { apiHelper } from "@/Services/index";
import { HTTPVERBS } from "@/utils/HTTPVERBS";
import Cookies from "js-cookie";
import { enqueueSnackbar } from "notistack"

interface Chats {

}
const ChatMain = () => {
    const [chats, setChats] = useState<Chats[]>([]);

    const fetchChats = async () => {
        const token = Cookies.get('token');
        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const { response } = await apiHelper(HTTPVERBS.GET, 'admin/chats', headers, null);
        console.log("API Response:", response);
        if (response && response.data && Array.isArray(response.data.data)) {
            const chatData = response.data.data;
            setChats(chatData);
          } else {
            setChats([]); 
            enqueueSnackbar("Cannot load chat", { variant: "error" , anchorOrigin:{vertical:"bottom", horizontal:"right"}});
          }
    }

    useEffect(() => {
        fetchChats();
    }, [])


    return(
        <DefaultLayout>
            <div className="mx-auto max-w-full">
            <Breadcrumb pageName="Chat"/>
            <div className="flex justify-between items-center my-5">
                <h3 className="font-bold dark:text-white text-black">Existing Chats</h3>
                <button className="py-3 px-5 bg-btnColor text-white border-2 rounded-lg">Create</button>
            </div>
            </div>
        </DefaultLayout>
    )
}

export default ChatMain