
export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  featured: boolean;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: CartItem[];
  total: number;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  paymentMethod: 'COD';
  status: OrderStatus;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
}
