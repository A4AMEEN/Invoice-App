export interface Customer {
    id: string;
    name: string;
    email?: string;
    address?: string;
  }
  
  export interface Product {
    id: string;
    name: string;
    basePrice: number;
  }
  
  export interface InvoiceItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }