import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation"

const Logout = () => {
  const { signOut } = useAuthStore();
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/signin");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button
      variant="completeGhost"
      onClick={handleLogout}
    >
      <LogOut className="text-destructive" />
      Log out
    </Button>
  );
};

export default Logout;
