export interface ServiceRequest {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  deviceType: "Laptop" | "Komputer";
  computerTypes?: string;
  brand?: string;
  customBrand?: string;
  model?: string;
  damage: string;
  date: string;
  images: string[];
  status: "pending" | "in_progress" | "completed" | "rejected";
  rejectedReason?: string;
  createdAt: {
    toDate: any;
    seconds: number;
    nanoseconds: number;
  };
}
