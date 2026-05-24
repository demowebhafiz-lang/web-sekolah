import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { cn } from '../lib/utils.js';
import { getInitials } from '../utils/fileUpload.js';

export default function AvatarImage({ src, name, className, imageClassName }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <div className={cn('grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-emerald-50 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100', className)}>
      {showImage ? (
        <img
          alt={name ? `Foto ${name}` : 'Foto siswa'}
          className={cn('h-full w-full object-cover', imageClassName)}
          src={src}
          onError={() => setFailed(true)}
        />
      ) : name ? (
        <span>{getInitials(name)}</span>
      ) : (
        <UserRound className="h-5 w-5" />
      )}
    </div>
  );
}
