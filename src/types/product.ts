export interface Product {
  id: string;
  name: string;
  category: "Komputer" | "Laptop" | "Spare Part";
  price: number;
  stock: number;
  description: string;
  condition: "Baru" | "Bekas";
  images: string[];
  ecommerceLink: {
    shopee?: string;
    blibli?: string;
    lazada?: string;
    tokopedia?: string;
  };
}

export interface EcommerceOption {
  label: string;
  value: "shopee" | "blibli" | "lazada" | "tokopedia";
  url: string;
}
