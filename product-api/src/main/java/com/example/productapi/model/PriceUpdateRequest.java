package com.example.productapi.model;

public class PriceUpdateRequest {

    private String productId;
    private double newPrice;

    public PriceUpdateRequest() {
    }

    public PriceUpdateRequest(String productId, double newPrice) {
        this.productId = productId;
        this.newPrice = newPrice;
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public double getNewPrice() { return newPrice; }
    public void setNewPrice(double newPrice) { this.newPrice = newPrice; }
}
