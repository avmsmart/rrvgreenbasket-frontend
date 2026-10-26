export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  totalOrders: number;
  totalSpent: number;
  status: "Active" | "Inactive";
  joinedOn: string;
  avatarColor?: string;
}
