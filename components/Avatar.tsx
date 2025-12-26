
import React, { useState } from 'react';
import { getUserAvatar } from '../constants';
import { User } from 'lucide-react';

interface AvatarProps {
  username: string;
  avatarUrl?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ username, avatarUrl, className = '' }) => {
  const [error, setError] = useState(false);
  const src = getUserAvatar(username, avatarUrl);

  // Fallback to a plain true yellow circle with a generic user silhouette if the API fails
  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-yellow-400 text-white border border-yellow-500 shadow-inner ${className}`}>
        <User size="60%" strokeWidth={2} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={username}
      onError={() => setError(true)}
      className={`object-cover bg-yellow-400 ${className} transition-all duration-300`}
      loading="lazy"
    />
  );
};
