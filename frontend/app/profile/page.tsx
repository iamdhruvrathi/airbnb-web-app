"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-provider";
import { authApi } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { User, Mail, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    } else if (user) {
      setName(user.name);
      setBio(user.bio || "");
      setAvatarUrl(user.avatar_url || "");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await authApi.updateMe({ name, bio, avatar_url: avatarUrl });
      toast.success("Profile updated successfully!");
      window.location.reload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <h1 className="mb-8 text-3xl font-bold">Personal info</h1>

      <div className="flex flex-col gap-12">
        {/* Profile Card Top */}
        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-col items-center text-center">
              <Avatar className="mb-4 h-24 w-24 border-2 border-white shadow-md">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
                <AvatarFallback className="text-2xl">{name[0]}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">{name}</h2>
              <p className="text-sm font-medium text-neutral-500 capitalize">{user.role}</p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
              <div className="flex flex-col items-center gap-2 text-center text-sm">
                <User className="h-5 w-5 text-neutral-400" />
                <span>Identity verified</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center text-sm">
                <Mail className="h-5 w-5 text-neutral-400" />
                <span>Email address verified</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center text-sm">
                <Calendar className="h-5 w-5 text-neutral-400" />
                <span>Joined {new Date(user.created_at).getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Below */}
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
            <div className="space-y-2">
              <label className="font-semibold">Legal name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="max-w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="font-semibold">Email address</label>
              <Input value={user.email} disabled className="max-w-full text-neutral-500 bg-neutral-50 dark:bg-neutral-950" />
              <p className="text-xs text-neutral-500">Email addresses cannot be changed here.</p>
            </div>
            <div className="space-y-2">
              <label className="font-semibold">About</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a little about yourself..."
                className="min-h-[120px] max-w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="font-semibold">Profile Photo</label>
              <div className="max-w-full">
                <ImageUpload
                  value={avatarUrl ? [{ url: avatarUrl }] : []}
                  onChange={(imgs) => setAvatarUrl(imgs[0]?.url || "")}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isSaving} className="w-full sm:w-auto bg-[#FF385C] hover:bg-[#D70466] text-white">
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
