import { Participant } from "@/types/chat";

import { Ellipsis } from "lucide-react";
import UserAvatar from "./UserAvatar";

interface GroupChatAvatarProps {
  participants: Participant[];
  type: "chat" | "sidebar";
}

const GroupChatAvatar = ({participants, type}: GroupChatAvatarProps) => {
  const avatars = [];
  const limit = Math.min(participants.length, 4);
  for (let i = 0; i < limit; i++) {
    const participant = participants[i];
    avatars.push(
      <UserAvatar
        key={i}
        type={type}
        name={participant.name ?? "Unknown User"}
        avatarUrl={participant.avatarUrl || undefined}
      />
    );
  }
  return (
    <div className="relative flex -space-x-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:ring-2">
      {avatars}
      {/* If more than 4 participants, show ... */}
      { participants.length > limit && (
          <div className="flex items-center justify-center z-10 size-8 bg-muted text-muted-foreground rounded-full border ring-2 ring-background">
            <Ellipsis className="size-4" />
          </div>
        )
      }
    </div>
  )
}

export default GroupChatAvatar
