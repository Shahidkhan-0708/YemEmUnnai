import React from 'react';
import { Pencil, Copy, Heart, Share2 } from 'lucide-react';

export const PencilEdit02Icon = Pencil;
export const Copy01Icon = Copy;
export const FavouriteIcon = Heart;
export const Share01Icon = Share2;

export interface HugeiconsIconProps extends React.SVGProps<SVGSVGElement> {
  icon?: any;
  size?: number | string;
  className?: string;
}

export const HugeiconsIcon: React.FC<HugeiconsIconProps> = ({
  icon: IconComponent,
  size = 16,
  className = '',
  ...props
}) => {
  if (!IconComponent) return null;
  if (React.isValidElement(IconComponent)) return IconComponent;
  const Component = IconComponent as React.ComponentType<{ size?: number | string; className?: string }>;
  return <Component size={size} className={className} {...props} />;
};

export default HugeiconsIcon;
