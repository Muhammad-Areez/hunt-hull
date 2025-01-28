"use client";
import React, { useState, useEffect } from "react";
import { apiHelper } from "@/Services";
import { HTTPVERBS } from "@/utils/HTTPVERBS";
import Cookies from "js-cookie";
import { enqueueSnackbar } from "notistack";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

interface Chats {
  id: number;
  first_name: string;
  last_name: string;
  talking_to: {
    id: number;
    first_name: string;
    last_name: string;
  };
  first_user: {
    id: number;
    first_name: string;
    last_name: string;
  };
  second_user: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

const Chat = () => {
  const [chats, setChats] = useState<Chats[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchChats = async () => {
    const token = Cookies.get("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const { response } = await apiHelper(HTTPVERBS.GET, "admin/chats", headers, null);
      console.log("Full API Response:", response);

      if (response?.data?.response?.data && Array.isArray(response.data.response.data)) {
        const chatData = response.data.response.data;
        console.log("Chat Data:", chatData);
        setChats(chatData);
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      enqueueSnackbar("Cannot load chats", { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right" } });
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleUserClick = async (chat: Chats, userType: "first_user" | "second_user") => {
    const selectedUser = userType === "first_user" ? chat.first_user : chat.second_user;

    if (!selectedChat || selectedChat.id !== chat.id) {
      const token = Cookies.get("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      try {
        const { response } = await apiHelper(HTTPVERBS.POST, `admin/chats/create-chat/${selectedUser.id}`, headers, null);
        console.log("API Response for Create Chat:", response);

        if (response?.data?.response?.data) {
          setSelectedChat(chat);
        } else {
          enqueueSnackbar("Chat could not be created", { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right" } });
        }
      } catch (error) {
        console.error("Error creating chat:", error);
        enqueueSnackbar("Cannot create chat", { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right" } });
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredChats = chats.filter(
    (chat) =>
      `${chat.first_user.first_name} ${chat.first_user.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      `${chat.second_user.first_name} ${chat.second_user.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <DefaultLayout>
      <div className="w-full h-screen flex fixed">
        <div className="w-[35%] h-full bg-stroke overflow-y-auto">
          <div className="flex items-center h-[90px]">
            <div className="m-10 border-b border-gray-300 p-2 w-full">
              <h3 className="text-2xl">Admin Chats</h3>
              <p className="text-md text-black">My Account</p>
            </div>
          </div>
          <hr />
          <div className="ml-10 mt-5">
            <div className="text-xl text-black">My Messages</div>
            <div>
              {filteredChats.map((chat, index) => (
                <div key={index}>
                  <div
                    className="ml-2 mt-10 flex cursor-pointer border-b border-gray-300 p-2"
                    onClick={() => handleUserClick(chat, "first_user")}
                  >
                    <div className="h-15 w-15 flex border border-primary rounded-full p-[2px]">
                      <img src={'/Images/user/user-01.png'} alt="user Image" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-md text-black">{`${chat.second_user.first_name} ${chat.second_user.last_name}`}</h3>
                      <p className="text-md text-gray-400">Active</p>
                    </div>
                  </div>
                  <div
                    className="ml-2 mt-10 flex cursor-pointer border-b border-gray-300 p-2"
                    onClick={() => handleUserClick(chat, "second_user")}
                  >
                    <div className="h-15 w-15 flex border border-primary rounded-full p-[2px]">
                      <img src={'/Images/user/user-01.png'} alt="user Image" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-md text-black">{`${chat.second_user.first_name} ${chat.second_user.last_name}`}</h3>
                      <p className="text-md text-gray-400">Active</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-[65%] flex flex-col ml-5 bg-offWhite overflow-y-auto ">
          {selectedChat ? (
            <div className="flex flex-col">
              <div className="bg-stroke h-[90px] w-full flex items-center px-10 fixed">
                <div className="h-15 w-15 flex border border-primary rounded-full p-[1px]">
                  <img
                    src={`/Images/user/user-01.png`} 
                    alt="user Image"
                  />
                </div>
                <h3 className="text-lg font-semibold ml-6">
                  {selectedChat.talking_to.first_name} {selectedChat.talking_to.last_name}
                </h3>
              </div>
              <div className="fixed bottom-0 w-[40%] bg-white p-4 shadow-lg flex items-center">
                <div className="relative w-full absolute">
                 <input
                    type="text"
                    placeholder="Enter your message here..."
                    className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    className="absolute top-1/2 right-1 mr-5 transform -translate-y-1/2 text-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>Select a user to start your Chat</div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Chat;
