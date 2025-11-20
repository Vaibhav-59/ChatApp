import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "./pages/lib/axios";
import { useAuthStore } from "./pages/store/auth";
import toast from "react-hot-toast";

const Profile = () => {
  const authUser = useAuthStore((s) => s.authUser);
  const onlineUsers = useAuthStore((s) => s.onlineUsers) || [];
  const setAuthUser = useAuthStore.setState;

  const myId = useMemo(() => String(authUser?._id || authUser?.id || authUser?.userId || ""), [authUser]);
  const isOnline = useMemo(() => onlineUsers.map(String).includes(myId), [onlineUsers, myId]);

  const [avatarPreview, setAvatarPreview] = useState(authUser?.avatar || "");
  const [name, setName] = useState(authUser?.name || authUser?.username || "");
  const [email, setEmail] = useState(authUser?.email || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAvatarPreview(authUser?.avatar || "");
    setName(authUser?.name || authUser?.username || "");
    setEmail(authUser?.email || "");
  }, [authUser]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === "string") setAvatarPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!authUser) return;
    if (!email?.trim()) {
      toast.error("Email is required");
      return;
    }
    setSaving(true);
    try {
      const payload = { avatar: avatarPreview, name: name?.trim(), email: email?.trim() };
      const id = String(authUser._id || authUser.id || authUser.userId);
      const res = await axiosInstance.put(`/users/${id}`, payload);
      // update auth store so UI reflects immediately
      setAuthUser((prev) => ({
        authUser: { ...(prev?.authUser || {}), ...res.data },
      }));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">My Profile</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center gap-4">
        <div className="relative">
          <img
            src={avatarPreview || "/avatar.png"}
            alt={name}
            className="w-28 h-28 rounded-full object-cover ring-2 ring-white shadow"
          />
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-white ${isOnline ? "bg-emerald-500" : "bg-zinc-400"}`}
            title={isOnline ? "Online" : "Offline"}
          />
        </div>

        <div className="w-full">
          <div className={`text-xs mb-1 font-medium ${isOnline ? "text-emerald-600" : "text-zinc-400"}`}>
            {isOnline ? "Active" : "Inactive"}
          </div>

          <label className="block text-sm text-gray-700 mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 mb-3 block w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Your name"
          />

          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="email@example.com"
          />
        </div>

        <div className="w-full mt-2">
          <label className="block text-sm text-gray-700 mb-1">Change avatar</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
          <p className="text-xs text-gray-400 mt-1">Pick an image; it will be saved and shown in chat header and sidebar.</p>
        </div>

        <div className="w-full flex items-center gap-3 mt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
