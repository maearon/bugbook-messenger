import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface UserAvatarProps {
  type: 'sidebar' | 'chat' | 'profile';
  userId?: string;
  name: string;
  avatarUrl?: string;
  className?: string;
}

const UserAvatar = ({ type, name , avatarUrl, className}: UserAvatarProps) => {
  const bgColor = !avatarUrl ? 'bg-blue-500' : '';
  if (!name) {
    name = "Autofill User Name";
  }
  return (
    <Avatar 
      className={cn(
        className ?? "", 
        type === 'sidebar' && 'size-12 text-base',
        type === 'chat' && 'size-8 text-sm',
        type === 'profile' && 'size-24 text-3xl shadow-md'
      )}
    > 
      <AvatarImage 
        src={avatarUrl || undefined} 
        alt={name} 
        className={cn(bgColor, 'object-cover')}
      />
      <AvatarFallback
        className={cn(
          bgColor,
          'text-white font-semibold',
          // 'flex items-center justify-center',
          // type === 'sidebar' && 'text-base',
          // type === 'chat' && 'text-sm',
          // type === 'profile' && 'text-3xl'
        )}
      >
        {name.charAt(0)
        // .toUpperCase()
        }
      </AvatarFallback> 
    </Avatar>
  )
}

export default UserAvatar
