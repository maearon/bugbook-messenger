import { MessageCircle } from "lucide-react"
import { SidebarInset } from "../ui/sidebar"
import ChatWindowHeader from "./ChatWindowHeader"

const ChatWelcomeScreen = () => {
  return (
    // <SidebarInset className="flex w-full h-full bg-transparent">
    //   <ChatWindowHeader />
    //   <div className="flex flex-1 items-center justify-center bg-primary-foreground rounded-2xl">
    //     <div className="text-center">
    //       <div className="size-24 mx-auto mb-6 bg-gradient-chat rounded-full flex items-center justify-center shadow-grow pulse-ring">
    //         <span className="text-3xl">
    //           <MessageCircle className="h-16 w-16 text-muted-foreground dark:text-white" />
    //         </span>
    //       </div>
    //       <h2 className="text-2xl font-bold mb-2 bg-gradient-chat bg-clip-text text-muted-foreground dark:text-white">Chào mừng đến với Moji!</h2>
    //       <p className="text-muted-foreground dark:text-white">Chọn một cuộc hội thoại để bắt đầu chat!</p>
    //     </div>
    //   </div>
    // </SidebarInset>
    <SidebarInset className="flex w-full h-full bg-transparent">
      <ChatWindowHeader />
      <div className="flex h-full flex-col items-center justify-center">
        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-400">
          <MessageCircle className="h-16 w-16 text-white" />
        </div>
        <h2 className="mb-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-3xl font-bold text-transparent">
          Chào mừng bạn đến với Moji!
        </h2>
        <p className="text-gray-600">Chọn một cuộc hội thoại để bắt đầu chat!</p>
      </div>
    </SidebarInset>
  )
}

export default ChatWelcomeScreen
