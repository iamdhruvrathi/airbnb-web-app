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

      <div className="grid gap-12 md:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="font-semibold">Legal name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="max-w-md"
              />
            </div>
            <div className="space-y-2">
              <label className="font-semibold">Email address</label>
              <Input value={user.email} disabled className="max-w-md text-neutral-500" />
              <p className="text-xs text-neutral-500">Email addresses cannot be changed here.</p>
            </div>
            <div className="space-y-2">
              <label className="font-semibold">About</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a little about yourself..."
                className="min-h-[120px] max-w-md"
              />
            </div>
            <div className="space-y-2">
              <label className="font-semibold">Profile Photo</label>
              <div className="max-w-md">
                <ImageUpload
                  value={avatarUrl ? [{ url: avatarUrl }] : []}
                  onChange={(imgs) => setAvatarUrl(imgs[0]?.url || "")}
                />
              </div>
            </div>

            <Button type="submit" disabled={isSaving} className="bg-[#FF385C] hover:bg-[#D70466]">
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </div>

        <div>
          <div className="sticky top-24 rounded-2xl border border-neutral-200 p-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <Avatar className="mb-4 h-24 w-24">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
                <AvatarFallback className="text-2xl">{name[0]}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{name}</h2>
              <p className="text-sm text-neutral-500 capitalize">{user.role}</p>
            </div>
            <div className="mt-6 space-y-4 border-t border-neutral-200 pt-6">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-5 w-5 text-neutral-400" />
                <span>Identity verified</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-5 w-5 text-neutral-400" />
                <span>Email address verified</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-5 w-5 text-neutral-400" />
                <span>Joined {new Date(user.created_at).getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
