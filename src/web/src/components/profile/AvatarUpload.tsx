import { User, Camera } from 'lucide-react';
import { AvatarUploadProps } from './profile-types';

/**
 * Avatar Upload Component
 * Handles profile picture upload and display
 */
export default function AvatarUpload({
  avatarUrl,
  loading,
  onAvatarChange,
  onAvatarClick,
  fileInputRef
}: AvatarUploadProps) {
  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <div
          className="w-20 h-20 rounded-full overflow-hidden cursor-pointer group"
          onClick={onAvatarClick}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent-violet to-accent-cyan flex items-center justify-center">
              <User className="text-white" size={32} />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="text-white" size={20} />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onAvatarChange}
          className="hidden"
          disabled={loading}
        />
      </div>
      <div>
        <h3 className="font-medium text-foreground">
          Foto Profilo
        </h3>
        <p className="text-sm text-foreground-secondary">
          Clicca per cambiare la tua foto profilo
        </p>
        <p className="text-xs text-foreground-secondary mt-1">
          JPG, PNG o GIF. Max 5MB.
        </p>
      </div>
    </div>
  );
}