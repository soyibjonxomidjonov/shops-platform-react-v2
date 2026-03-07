export interface Shop {
  id: number;
  name: string;
  description?: string;
  address?: string;
  bot_token?: string;
  chat_id?: string;
  slug?: string;
  created_at: string;
}

export interface Product {
  id: number;
  shop: number;
  name: string;
  image?: string;
  description?: string;
  price: number;
  stock: number;
  unity: 'dona' | 'kg' | 'litr' | 'metr';
  created_at: string;
}

export interface Order {
  id: number;
  first_name: string;
  phone_number: string;
  shop: number;
  address: string;
  items_json: CartItem[];
  total_price: number;
  created_at: string;
  status: 'yangi' | 'tayyorlanmoqda' | 'yakunlangan';
}

export interface CartItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  unity: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
