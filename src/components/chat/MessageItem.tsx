import { cn, formatMessageTime } from "@/lib/utils";
import { Conversation, Message, Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConversation: Conversation;
  lastMessageStatus: 'sent' | 'delivered' | 'read' | 'seen';
}

const MessageItem = ({message,index,messages,selectedConversation,lastMessageStatus}:MessageItemProps) => {
  const prev = messages[index - 1];
  const isGroupBreak = index === 0 || 
    message.senderId !== prev?.senderId ||
     (new Date(message.createdAt).getTime() - new Date(prev?.createdAt || 0).getTime()) > 5 * 60 * 1000; // 5 minutes gap
  const participant = selectedConversation.participants.find((p: Participant) => p._id.toString() === message.senderId.toString());
  return (
    <div className={cn("flex gap-2 message-bounce mt-1", message.isOwn ? "justify-end" : "justify-start", {
      // "mt-4": isGroupBreak,
      // "mt-1": !isGroupBreak,
    })}>
      {/* avatar */}
      {
        !message.isOwn && isGroupBreak && participant && participant.avatarUrl && (
          <div className="w-8">
            {
              isGroupBreak && 
              // participant ? 
              (
                <UserAvatar 
                  type={"chat"} 
                  name={participant?.name ?? "Unknown"}
                  avatarUrl={participant?.avatarUrl ?? undefined} 
                  // alt={participant.name} 
                  // size={32} 
                />
              ) 
              // : <div className="w-8 h-8" />
            }
          </div>
        )
      }
      {/* {isGroupBreak && (
        <div className="mb-1 text-sm text-gray-500">
          {participant ? participant.name : "Unknown"}
        </div>
      )} */}
      {/* message */}
      {/* <div className={cn("inline-block p-2 rounded shadow", {
        "bg-blue-500 text-white self-end": message.senderId === selectedConversation.ownerId,
        "bg-gray-200 text-black": message.senderId !== selectedConversation.ownerId,
      })}>
        {message.content}
      </div>
      {index === messages.length - 1 && message.senderId === selectedConversation.ownerId && (
        <div className="text-xs text-gray-400 mt-1 text-right">
          {lastMessageStatus}
        </div>
      )} */}
      <div className={cn("max-w-xs ld:max-w-md space-y-1 flex flex-col", message.isOwn ? "items-end" : "items-start")}>
        {/* {new Date(message.createdAt).toLocaleTimeString()} */}
        <Card className={cn("p-3 rounded shadow", message.isOwn ? "chat-bubble-sent border-0" : "bg-chat-bubble-received border-0")}>
          <p className="text-sm leading-relaxed break-words">
            {message.content}
          </p>
        </Card>
        {/* {index === messages.length - 1 && message.isOwn && (
          <div className="text-xs text-gray-400 mt-1">
            {lastMessageStatus}
          </div>
        )} */}
        {/* timestamp */}
        {
          isGroupBreak && (
            <span className="text-xs text-muted-foreground px-1">
              {formatMessageTime(
                new Date(message.createdAt)
                // .toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
              )}
            </span>
          )
        }
        {/* sent/ delivered */}
        {
          message.isOwn && message._id === selectedConversation.lastMessage?._id && 
          // index === messages.length - 1 && 
          (
            <Badge 
              variant="outline" 
              className={cn("text-xs px-1.5 py-0.5 h-4 border-0 mt-1", lastMessageStatus === 'read' || lastMessageStatus === 'seen' ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}
            >
              {/* {
                lastMessageStatus === 'sent' ? 'Đã gửi' :
                lastMessageStatus === 'delivered' ? 'Đã nhận' :
                lastMessageStatus === 'read' ? 'Đã đọc' :
                lastMessageStatus === 'seen' ? 'Đã xem' :
                ''
              } */}
              {lastMessageStatus}
            </Badge>
          )
        }
      </div>
    </div>
  )
}

export default MessageItem
