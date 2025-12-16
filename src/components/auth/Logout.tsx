"use client"

import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation"
import { LoadingDots } from "../products/enhanced-product-form";

const Logout = () => {
  const t = useTranslations("auth");
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
      className="w-full justify-start"
    >
      <LogOut className="text-destructive" />
      {t?.logOut || "Log out"}
    </Button>
  );
};

export default Logout;
