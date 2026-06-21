declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  export type Icon = FC<IconProps>;
  export const Briefcase: Icon;
  export const FileText: Icon;
  export const CheckSquare: Icon;
  export const User: Icon;
  export const Compass: Icon;
  export const LogOut: Icon;
  export const Plus: Icon;
  export const X: Icon;
  export const Upload: Icon;
  export const Sparkles: Icon;
  export const AlertCircle: Icon;
  export const Search: Icon;
  export const MapPin: Icon;
  export const Globe: Icon;
  export const ArrowRight: Icon;
  export const Calendar: Icon;
  export const Users: Icon;
  export const Download: Icon;
  export const ExternalLink: Icon;
  export const RefreshCw: Icon;
  export const Trash2: Icon;
  export const ArrowLeft: Icon;
  export const Loader2: Icon;
  export const Award: Icon;
  export const CheckCircle2: Icon;
  export const AlertTriangle: Icon;
  export const ShieldCheck: Icon;
  export const BookOpen: Icon;
  export const ChevronRight: Icon;
  export const Copy: Icon;
  // Fallback for any other icons imported
  const content: any;
  export default content;
}
