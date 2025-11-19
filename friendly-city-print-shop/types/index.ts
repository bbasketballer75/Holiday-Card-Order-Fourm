// Type definitions for Holiday Card Order Forum

export interface Template {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  category?: string;
  featured?: boolean;
}

export interface ForumMessage {
  id: string;
  user: string;
  message: string;
  created_at: string;
  pending?: boolean;
  failed?: boolean;
}

export interface OrderFormData {
  template?: Template;
  message: string;
  quantity: number;
  from: string;
  to: string;
  uploadedPreview?: string;
}

export interface FormStep {
  num: number;
  label: string;
  icon: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface NavItem {
  href: string;
  label: string;
}

export type ThemeColor =
  | 'primary'
  | 'accent'
  | 'destructive'
  | 'foreground'
  | 'background'
  | 'muted'
  | 'secondary';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
