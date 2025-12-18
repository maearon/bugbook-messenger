"use client";

import { useState } from "react";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { MessageSquare } from "lucide-react";
import FriendListModal from "../createNewChat/FriendListModal";
import { useFriendStore } from "@/stores/useFriendStore";

const CreateNewChatDialog = () => {
  const [open, setOpen] = useState(false);
  const { getFriends } = useFriendStore();

  const handleOpenChange = async (value: boolean) => {
    setOpen(value);
    if (value) {
      await getFriends();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="flex justify-center items-center size-5 rounded-full hover:bg-sidebar-accent cursor-pointer z-10">
          <MessageSquare className="size-4" />
        </div>
      </DialogTrigger>

      <FriendListModal onClose={() => setOpen(false)} />
    </Dialog>
  );
};

export default CreateNewChatDialog;
