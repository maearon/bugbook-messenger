import React from 'react'
import { Card } from '../ui/card';
import { cn, formatOnlineTime } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';

interface ChatCardProps {
    conversationId?: string;
    name?: string;
    timeStamp?: Date;
    isActive?: boolean;
    onSelect: (id: string) => void;
    unreadCount?: number;
    leftSection: React.ReactNode;
    subtitle: React.ReactNode;
}

const ChatCard = ({
    conversationId, name, timeStamp, isActive, onSelect, unreadCount, leftSection, subtitle
}: ChatCardProps) => {
  return (
    <Card
      key={conversationId}
      className={cn("border-none p-3 cursor-pointer transition-smooth glass hover:bg-muted/30",
        isActive && "ring-2 ring-primary/50 bg-gradient-to-tr from-primary-grow/10 to-primary-foreground")}
      onClick={() => conversationId && onSelect(conversationId)}
    > 
      <div className="flex items-center gap-3">

        <div className="relative">
          {leftSection}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <h3 className={cn("text-sm font-semibold truncate",
              unreadCount && unreadCount > 0 && "text-foreground"
            )}>{name}</h3>
            {timeStamp && (
              // <span className="text-sm text-gray-500">
              //   {timeStamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              // </span>
              <span className="text-xs text-muted-foreground">
                {formatOnlineTime(timeStamp)}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {subtitle}
            </div>
            <MoreHorizontal className="size-4 hover:size-5 text-muted-foreground opacity-0 
              group-hover:opacity-100 transition-smooth" />
          </div>
        </div>

      </div>
      {unreadCount && unreadCount > 0 && (
        <div className="ml-4 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm">
          {unreadCount}
        </div>
      )}     
    </Card>
  )
}

export default ChatCard
