package com.example.productapi.model;

public class PriceUpdateResponse {

    private String productId;
    private String productName;
    private double oldPrice;
    private double newPrice;
    private String updatedAt;

    public PriceUpdateResponse() {
    }

    public PriceUpdateResponse(String productId, String productName, double oldPrice, double newPrice, String updatedAt) {
        this.productId = productId;
        this.productName = productName;
        this.oldPrice = oldPrice;
        this.newPrice = newPrice;
        this.updatedAt = updatedAt;
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public double getOldPrice() { return oldPrice; }
    public void setOldPrice(double oldPrice) { this.oldPrice = oldPrice; }

    public double getNewPrice() { return newPrice; }
    public void setNewPrice(double newPrice) { this.newPrice = newPrice; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
