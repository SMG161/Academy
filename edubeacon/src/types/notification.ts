export type NotificationType =
  | 'access_granted'
  | 'expiry_30d'
  | 'expiry_7d'
  | 'expiry_1d'
  | 'expired';

export interface Notification {
  _id: string;
  type: NotificationType;
  course: { _id: string; name: string } | null;
  message: string;
  read: boolean;
  createdAt: string;
}
