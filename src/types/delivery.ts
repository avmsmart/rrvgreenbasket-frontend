export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  area: string;
  totalDeliveries: number;
  rating: number;
  status: "Active" | "On Delivery" | "Idle" | "Inactive";
  currentOrder?: string;
  vehicleDetails?: string;
}
