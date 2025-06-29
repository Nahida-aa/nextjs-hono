import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import NextImage from 'next/image'

export const ShadcnAvatar = ({ 
  src, size = 10, className = '', onclick,
}: {
  src: string;
  size?: number;
  className?: string;
  onclick?: () => void;
}) => {
  return (
    <Avatar className={`h-${size} w-${size} ${className}`} onClick={onclick}>
      <AvatarImage src={src} className={`h-${size} w-${size}`} />
      <AvatarFallback>
        <Skeleton className={`h-${size} w-${size} rounded-full`} />
      </AvatarFallback>
    </Avatar>
  );
}

interface GroupAvatarProps {
  images: string[];
  size?: number;
}
export const GroupAvatar: React.FC<GroupAvatarProps> = ({ images, size = 48 }) => {
  const imageSize = size / 2;

  return (
    <div style={{ width: size, height: size, position: 'relative' }} className="rounded-full overflow-hidden">
      {images.slice(0, 4).map((src, index) => {
        let style = {};
        if (images.length === 2) {
          style = {
            width: size,
            height: imageSize,
            position: 'absolute',
            objectFit: 'cover',
            boxSizing: 'border-box',
            ...(index === 0 && { top: 0, left: 0 }),
            ...(index === 1 && { bottom: 0, left: 0 }),
          };
        } else if (images.length === 3) {
          style = {
            width: index === 0 ? imageSize : imageSize,
            height: index === 0 ? size : imageSize,
            position: 'absolute',
            objectFit: 'cover',
            boxSizing: 'border-box',
            ...(index === 0 && { top: 0, left: 0 }),
            ...(index === 1 && { top: 0, right: 0 }),
            ...(index === 2 && { bottom: 0, right: 0 }),
          };
        } else {
          style = {
            width: imageSize,
            height: imageSize,
            position: 'absolute',
            objectFit: 'cover',
            boxSizing: 'border-box',
            ...(index === 0 && { top: 0, left: 0 }),
            ...(index === 1 && { top: 0, right: 0 }),
            ...(index === 2 && { bottom: 0, left: 0 }),
            ...(index === 3 && { bottom: 0, right: 0 }),
          };
        }
        return (
          <NextImage
            key={index}
            src={src}
            width={imageSize}
            height={imageSize}
            alt={`avatar-${index}`}
            style={style}
          />
        );
      })}
    </div>
  );
};

