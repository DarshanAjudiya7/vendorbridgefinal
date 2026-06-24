"use client";

import React, { useState } from "react";
import { User, Camera, Trash2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProfileSettingsClient({ user }: { user: any }) {
  const router = useRouter();
  const { update } = useSession();
  
  const [name, setName] = useState(user.name || "");
  const [imagePreview, setImagePreview] = useState<string | null>(user.image || null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setSuccessMsg("");
    try {
      let uploadedImageUrl = imagePreview;

      // Only upload if a new file was selected
      if (profileImage) {
        const formData = new FormData();
        formData.append("file", profileImage);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedImageUrl = uploadData.url;
        } else {
          throw new Error("Failed to upload image");
        }
      }

      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          image: uploadedImageUrl
        })
      });

      if (res.ok) {
        setSuccessMsg("Profile updated successfully!");
        
        // Update the client-side session so the header/sidebar updates immediately
        await update({ name, image: uploadedImageUrl });
        
        router.refresh();
      } else {
        alert("Failed to update profile");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Details</h2>

      {successMsg && (
        <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle2 size={18} />
          {successMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-10">
        {/* Photo Upload Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-gray-50 flex items-center justify-center overflow-hidden bg-gray-100">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-gray-300" />
              )}
            </div>
            
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-emerald-700 transition-colors border-2 border-white">
              <Camera size={18} />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
          
          {imagePreview && (
            <button 
              onClick={handleRemovePhoto}
              className="text-sm text-red-500 font-medium flex items-center gap-1 hover:text-red-700 transition-colors"
            >
              <Trash2 size={14} /> Remove Photo
            </button>
          )}
        </div>

        {/* Form Fields */}
        <div className="flex-1 space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Read Only)</label>
            <input 
              type="email" 
              value={user.email}
              readOnly
              className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-4 py-2.5 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <div className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
              {user.role.replace('_', ' ')}
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
