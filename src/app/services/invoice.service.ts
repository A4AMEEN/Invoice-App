import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceItem, Customer } from '../models/invoice';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private TAX_RATE = 0.18;
  private SHIPPING_RATE = 50;
  private DISCOUNT_RATES = [
    { minAmount: 5000, discountPercent: 0.05 },
    { minAmount: 15000, discountPercent: 0.10 },
    { minAmount: 50000, discountPercent: 0.15 }
  ];

  constructor() {}

  generatePDF(customer: Customer, invoiceItems: InvoiceItem[]) {
    if (!customer || invoiceItems.length === 0) return;
    
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Tax Invoice', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Invoice Management', 105, 28, { align: 'center' });
    doc.text('GST: 07AAPCA1234C1Z1', 105, 34, { align: 'center' });

    const today = new Date();
    const invoiceDate = today.toLocaleDateString();
    const invoiceNumber = 'INV-' + today.getTime().toString().slice(-6);
    
    doc.setFontSize(10);
    doc.text(`Invoice Number: ${invoiceNumber}`, 150, 50, { align: 'right' });
    doc.text(`Date: ${invoiceDate}`, 150, 57, { align: 'right' });

    doc.setFontSize(12);
    doc.text(`Customer Details:`, 20, 50);
    doc.setFontSize(10);
    doc.text(`Name: ${customer.name}`, 20, 60);
    doc.text(`Email: ${customer.email || 'N/A'}`, 20, 67);
    doc.text(`Address: ${customer.address || 'N/A'}`, 20, 74);

    const tableColumn = ['Product', 'Quantity', 'Unit Price', 'Total Price'];
    const tableRows = invoiceItems.map(item => [
      item.productName,
      item.quantity.toString(),
      `₹${item.unitPrice.toFixed(2)}`,
      `₹${item.totalPrice.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 90,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 90;
   
    const subtotal = this.getSubtotal(invoiceItems);
    const shippingCharge = this.calculateShippingCharge(subtotal);
    const appliedDiscount = this.applyDiscount(subtotal);
    const subtotalWithShipping = subtotal + shippingCharge;
    const discountedSubtotal = subtotalWithShipping - appliedDiscount;
    const taxAmount = this.getTaxAmount(discountedSubtotal);
    const totalAmount = discountedSubtotal + taxAmount;


    doc.setFontSize(10);
    doc.text(`Subtotal:`, 130, finalY + 10);
    doc.text(`₹${subtotal.toFixed(2)}`, 170, finalY + 10, { align: 'right' });
    
    doc.text(`Shipping Charge:`, 130, finalY + 17);
    doc.text(`₹${shippingCharge.toFixed(2)}`, 170, finalY + 17, { align: 'right' });
    
    doc.text(`Discount:`, 130, finalY + 24);
    doc.text(`₹${appliedDiscount.toFixed(2)}`, 170, finalY + 24, { align: 'right' });
    
    doc.text(`Taxable Value:`, 130, finalY + 31);
    doc.text(`₹${discountedSubtotal.toFixed(2)}`, 170, finalY + 31, { align: 'right' });
    
    doc.text(`Tax (18%):`, 130, finalY + 38);
    doc.text(`₹${taxAmount.toFixed(2)}`, 170, finalY + 38, { align: 'right' });

    doc.setDrawColor(0);
    doc.line(130, finalY + 42, 170, finalY + 42);

    doc.setFontSize(12);
    doc.setFont( 'bold');
    doc.text(`Total Amount:`, 130, finalY + 48);
    doc.text(`₹${totalAmount.toFixed(2)}`, 170, finalY + 48, { align: 'right' });
    doc.setFont( 'normal');
    

    doc.setFontSize(8);
    doc.text('Thank you for your business!', 105, finalY + 60, { align: 'center' });
    doc.text('This is a computer-generated invoice', 105, finalY + 65, { align: 'center' });

    doc.save(`Invoice_${customer.name}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  private getSubtotal(invoiceItems: InvoiceItem[]): number {
    return invoiceItems.reduce((total, item) => total + item.totalPrice, 0);
  }

  private calculateShippingCharge(subtotal: number): number {
    return subtotal > 10000 ? 0 : this.SHIPPING_RATE;
  }

  private applyDiscount(subtotal: number): number {
    const applicableDiscount = this.DISCOUNT_RATES
      .filter(rate => subtotal >= rate.minAmount)
      .sort((a, b) => b.discountPercent - a.discountPercent)[0];

    return applicableDiscount 
      ? subtotal * applicableDiscount.discountPercent 
      : 0;
  }

  private getTaxAmount(discountedSubtotal: number): number {
    return discountedSubtotal * this.TAX_RATE;
  }
}