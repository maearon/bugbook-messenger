"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ProfileEditDialog } from "@/components/profile/profile-edit-dialog"
import { FriendList } from "@/components/friends/friend-list"
import { FriendRequests } from "@/components/friends/friend-requests"
import { AddFriendDialog } from "@/components/friends/add-friend-dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const { user } = useAuth()
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl p-4">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.image || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">{user?.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-muted-foreground">@{user?.name}</p>
                </div>
              </div>
              <ProfileEditDialog />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{user?.email}</p>
                </div>
                {user?.name && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bio</p>
                    <p>{user.name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add Friend Button */}
          <div className="flex justify-end">
            <AddFriendDialog />
          </div>

          {/* Friend Requests */}
          <FriendRequests />

          {/* Friends List */}
          <FriendList />
        </div>
      </div>
    </div>
  )
}
