import { Component, OnInit } from '@angular/core';
import 'jspdf-autotable'; import { Customer, Product, InvoiceItem } from '../../models/invoice';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-invoice',
  standalone: false,
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit {
  currentStep = 1;
  private TAX_RATE = 0.09;
  discountCode: string = '';
  appliedDiscount: number = 0;
  shippingCharge: number = 0;
  private SHIPPING_RATE = 50; 
  private DISCOUNT_RATES = [
    { minAmount: 5000, discountPercent: 0.05 },
    { minAmount: 15000, discountPercent: 0.10 },
    { minAmount: 50000, discountPercent: 0.15 }
  ];
  customers: Customer[] = [
    {
      id: '1',
      name: 'Acme Corporation',
      email: 'billing@acme.com',
      address: '123 Business Street, New York, NY 10001',
    },
    {
      id: '2',
      name: 'Tech Innovations Inc.',
      email: 'finance@techinnovations.com',
      address: '456 Tech Park, San Francisco, CA 94105',
    },
    {
      id: '3',
      name: 'Global Enterprises',
      email: 'contact@globalenterprises.com',
      address: '789 Corporate Blvd, Chicago, IL 60601',
    },
    {
      id: '4',
      name: 'NextGen Solutions',
      email: 'info@nextgensolutions.com',
      address: '321 Future Lane, Austin, TX 73301',
    },
    {
      id: '5',
      name: 'Pioneer Tech',
      email: 'support@pioneertech.com',
      address: '987 Innovation Drive, Seattle, WA 98101',
    }
];


products: Product[] = [
  { id: '1', name: 'Laptop', basePrice: 89999 },   
  { id: '2', name: 'Smartphone', basePrice: 15999 }, 
  { id: '3', name: 'Tablet', basePrice: 14599 }, 
  { id: '4', name: 'Headphones', basePrice: 5999 },
  { id: '5', name: 'Monitor', basePrice: 25999 }   
];


  selectedCustomer: Customer | null = null;
  selectedProducts: Product[] = [];
  selectedProductId: string = '';
  invoiceItems: InvoiceItem[] = [];
  constructor(private invoiceService: InvoiceService) { }

  ngOnInit() {
  }

  

  nextStep() {
    if (this.currentStep === 2) {
      this.updateInvoiceItems();
    }

    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onCustomerSelect(customerId: string) {
    this.selectedCustomer = this.customers.find(c => c.id === customerId) || null;
  }

  addProduct() {
    if (this.selectedProductId) {
      const product = this.products.find(p => p.id === this.selectedProductId);

      if (product && !this.isProductSelected(product)) {
        this.selectedProducts.push(product);
        this.selectedProductId = '';
      }
    }
  }

  isProductSelected(product: Product): boolean {
    return this.selectedProducts.some(p => p.id === product.id);
  }

  removeProduct(product: Product) {
    const index = this.selectedProducts.findIndex(p => p.id === product.id);
    if (index > -1) {
      this.selectedProducts.splice(index, 1);
    }
  }

  updateInvoiceItems() {
    this.invoiceItems = this.selectedProducts.map(product => ({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.basePrice,
      totalPrice: product.basePrice
    }));
    
    // Recalculate shipping and discount
    this.calculateShippingCharge();
    this.applyDiscount();
  }

  updateProductQuantity(productId: string, quantity: number) {
    const itemIndex = this.invoiceItems.findIndex(item => item.productId === productId);
    if (itemIndex !== -1) {
      const item = this.invoiceItems[itemIndex];
      this.invoiceItems[itemIndex] = {
        ...item,
        quantity: Math.max(1, quantity),
        totalPrice: item.unitPrice * Math.max(1, quantity)
      };
      
      // Recalculate shipping and discount after quantity change
      this.calculateShippingCharge();
      this.applyDiscount();
    }
  }

  getSubtotal(): number {
    return this.invoiceItems.reduce((total, item) => total + item.totalPrice, 0);
  }

  calculateShippingCharge() {
    // Apply shipping charge based on total order value
    const subtotal = this.getSubtotal();
    this.shippingCharge = subtotal > 10000 ? 0 : this.SHIPPING_RATE;
  }

  applyDiscount() {
    // Reset applied discount
    this.appliedDiscount = 0;

    // Find the highest applicable discount rate
    const subtotal = this.getSubtotal();
    const applicableDiscount = this.DISCOUNT_RATES
      .filter(rate => subtotal >= rate.minAmount)
      .sort((a, b) => b.discountPercent - a.discountPercent)[0];

    if (applicableDiscount) {
      this.appliedDiscount = subtotal * applicableDiscount.discountPercent;
    }
  }

  getTaxAmount(): number {
    // Calculate tax on subtotal after shipping and before discount
    const subtotalWithShipping = this.getSubtotal() + this.shippingCharge;
    return (subtotalWithShipping - this.appliedDiscount) * this.TAX_RATE;
  }

  getTotalInvoiceAmount(): number {
    const subtotal = this.getSubtotal();
    return subtotal + 
           this.shippingCharge - 
           this.appliedDiscount + 
           this.getTaxAmount();
  }

  finalizeInvoice() {
    this.nextStep();
  }

  generateInvoicePDF() {
    if (this.selectedCustomer) {
      this.invoiceService.generatePDF(this.selectedCustomer, this.invoiceItems);
    }
  }
}