import { useTheme } from "next-themes"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Smile } from "lucide-react"
// import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"

interface EmojiPickerProps {
  onchange?: (emoji: string) => void
}

interface EmojiData {
  native: string
}

const EmojiPicker = ({ 
  // onChange 
}: EmojiPickerProps) => {
  const { 
    // theme, 
    resolvedTheme 
  } = useTheme()
  const isDark = resolvedTheme === "dark"
  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer p-0 m-0">
        <Smile className={`size-4 ${isDark ? 'text-white' : 'text-black'}`} />
      </PopoverTrigger>
      <PopoverContent 
        size={"right"} 
        sideOffset={40} 
        align="end" 
        className="bg-transparent border-none shadow-none drop-shadow-none mb-12 w-80 h-80 p-0 overflow-hidden"
      >
        {/* <iframe 
          src="https://emojipicker.com/embed" 
          className="w-full h-full border-0"
          title="Emoji Picker"
        /> */}
        {/* <Picker 
          theme={isDark ? "dark" : "light"}
          data={data} 
          onEmojiSelect={(emoji: EmojiData) => {
            if (onChange) {
              onChange(emoji.native)
            }
          }} 
          emojiSize={24}
          previewPosition="none"
          skinTonePosition="none"
          perLine={8}
          searchPosition="none"
          set="apple"
          style={{ width: '100%', height: '100%' }}
        /> */}
      </PopoverContent>
    </Popover>
  )
}

export default EmojiPicker
