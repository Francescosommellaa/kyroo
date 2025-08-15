import { supabase } from "../../lib/supabase";
import { Profile } from "../../lib/supabase";
import { AuthResult, AvatarUploadResult, AuthEvent } from "./auth-types";
import {
  validateAvatarFile,
  generateAvatarPath,
  mapSupabaseError,
  logAuthEvent,
  logAuthError,
  withRetry
} from "./auth-utils";

export const useProfileActions = () => {
  // Update user profile
  const updateProfile = async (updates: Partial<Profile>): Promise<AuthResult> => {
    try {
      logAuthEvent(AuthEvent.PROFILE_UPDATE_ATTEMPT, { updates });

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return {
          success: false,
          error: 'You must be logged in to update your profile'
        };
      }

      // Update profile with retry
      const result = await withRetry(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data;
      });

      logAuthEvent(AuthEvent.PROFILE_UPDATE_SUCCESS, { 
        userId: user.id, 
        updates,
        result 
      });
      
      return { 
        success: true,
        details: result
      };

    } catch (error: any) {
      logAuthError(AuthEvent.PROFILE_UPDATE_ERROR, error, { updates });
      
      // Handle specific error cases
      if (error.message?.includes('permission denied') || error.code === '42501') {
        return {
          success: false,
          error: 'Permission denied. Please check your account permissions.'
        };
      }
      
      if (error.message?.includes('connection') || error.code === 'PGRST301') {
        return {
          success: false,
          error: 'Connection error. Please check your internet connection and try again.'
        };
      }
      
      const { message } = mapSupabaseError(error);
      return { 
        success: false, 
        error: message || 'Failed to update profile. Please try again.' 
      };
    }
  };

  // Upload avatar image
  const uploadAvatar = async (file: File): Promise<AvatarUploadResult> => {
    try {
      logAuthEvent(AuthEvent.AVATAR_UPLOAD_ATTEMPT, { 
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return {
          success: false,
          error: 'You must be logged in to upload an avatar'
        };
      }

      // Validate file
      const validation = validateAvatarFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Generate unique file path
      const filePath = generateAvatarPath(user.id, file.name);

      // Get current profile to check for existing avatar
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      // Remove existing avatar if it exists
      if (currentProfile?.avatar_url) {
        try {
          const existingPath = currentProfile.avatar_url.split('/').pop();
          if (existingPath) {
            await supabase.storage
              .from('avatars')
              .remove([`avatars/${user.id}/${existingPath}`]);
          }
        } catch (removeError) {
          // Log but don't fail the upload if removal fails
          logAuthError(AuthEvent.AVATAR_UPLOAD_ERROR, removeError, { 
            context: 'removing_existing_avatar',
            existingUrl: currentProfile.avatar_url
          });
        }
      }

      // Upload new avatar with retry
      await withRetry(async () => {
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          throw error;
        }

        return data;
      });

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const profileUpdateResult = await updateProfile({ avatar_url: publicUrl });
      
      if (!profileUpdateResult.success) {
        // If profile update fails, try to clean up uploaded file
        try {
          await supabase.storage.from('avatars').remove([filePath]);
        } catch (cleanupError) {
          logAuthError(AuthEvent.AVATAR_UPLOAD_ERROR, cleanupError, { 
            context: 'cleanup_after_profile_update_failure',
            filePath
          });
        }
        
        return {
          success: false,
          error: profileUpdateResult.error || 'Failed to update profile with new avatar'
        };
      }

      logAuthEvent(AuthEvent.AVATAR_UPLOAD_SUCCESS, { 
        userId: user.id,
        filePath,
        publicUrl,
        fileSize: file.size
      });
      
      return {
        success: true,
        url: publicUrl
      };

    } catch (error: any) {
      logAuthError(AuthEvent.AVATAR_UPLOAD_ERROR, error, { 
        fileName: file.name,
        fileSize: file.size
      });
      
      // Handle specific storage errors
      if (error.message?.includes('Bucket not found') || error.message?.includes('bucket')) {
        return {
          success: false,
          error: 'Avatar storage is not properly configured. Please contact support.'
        };
      }
      
      if (error.message?.includes('permission denied') || error.message?.includes('access denied')) {
        return {
          success: false,
          error: 'Permission denied. Please check your account permissions.'
        };
      }
      
      if (error.message?.includes('file size') || error.message?.includes('too large')) {
        return {
          success: false,
          error: 'File is too large. Please select a file smaller than 5MB.'
        };
      }
      
      return {
        success: false,
        error: 'Failed to upload avatar. Please try again.'
      };
    }
  };

  return {
    updateProfile,
    uploadAvatar
  };
};