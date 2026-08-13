/** Entity shapes aligned with the backend data contract. */

export interface PageParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  birthDate: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ContractStatus = 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';

export interface ContractClient {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface Contract {
  id: string;
  clientId: string;
  client: ContractClient;
  status: ContractStatus;
  type: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export type ResourceType = 'SIM' | 'ESIM';
export type ResourceStatus = 'ASSIGNED' | 'AVAILABLE' | 'BLOCKED';

export interface Resource {
  id: string;
  contractId: string | null;
  type: ResourceType;
  iccid: string;
  imsi: string;
  msisdn: string;
  status: ResourceStatus;
  createdAt: string;
  updatedAt: string;
}

export type ServiceType = 'INTERNET' | 'ROAMING' | 'VOLTE' | 'SMS' | 'OPTION';

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  description: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AccessoryCategory = 'SMARTPHONE' | 'CHARGER' | 'HEADSET' | 'MODEM';

export interface Accessory {
  id: string;
  name: string;
  category: AccessoryCategory;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type OrderItemType = 'ACCESSORY' | 'SERVICE' | 'RESOURCE';

export interface OrderItem {
  id: string;
  orderId: string;
  itemName: string;
  itemType: OrderItemType;
  quantity: number;
  priceAtPurchase: number;
  createdAt: string;
}

export interface Order {
  id: string;
  clientId: string;
  client: ContractClient;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
