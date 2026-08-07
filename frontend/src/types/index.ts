export interface Color {
  id: number;
  name: string;
  hex_code: string;
}

export interface Size {
  id: number;
  label: string;
  sort_order: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: number;
  url: string;
  color_id: number | null;
  is_primary: boolean;
  sort_order: number;
}

export interface Variant {
  id: number;
  color: Color;
  size: Size;
  stock: number;
  sku?: string | null;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  rating: number;
  rating_count: number;
  is_active: boolean;
  is_featured: boolean;
  total_stock: number;
  primary_image: string | null;
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  rating: number;
  rating_count: number;
  is_active: boolean;
  is_featured: boolean;
  total_stock: number;
  category: Category | null;
  images: ProductImage[];
  variants: Variant[];
  colors: Color[];
  sizes: Size[];
}

export interface PaginatedProducts {
  items: ProductListItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface CartItem {
  productId: number;
  productName: string;
  slug: string;
  colorId: number;
  colorName: string;
  sizeId: number;
  sizeLabel: string;
  quantity: number;
  price: number;
  image: string;
  maxStock: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItemOut {
  id: number;
  product_id: number;
  product_name: string;
  color_name: string | null;
  size_label: string | null;
  image_url: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer: { id: number; name: string; phone: string; email: string | null };
  governorate: string;
  city: string;
  address: string;
  notes: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  items: OrderItemOut[];
}

export interface CustomerAdmin {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  total_orders: number;
  total_spent: number;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface DashboardStats {
  total_orders: number;
  total_sales: number;
  total_customers: number;
  total_products: number;
  pending_orders: number;
  top_products: { name: string; sold: number }[];
  daily_sales: { date: string; sales: number }[];
  monthly_sales: { month: string; sales: number }[];
}
