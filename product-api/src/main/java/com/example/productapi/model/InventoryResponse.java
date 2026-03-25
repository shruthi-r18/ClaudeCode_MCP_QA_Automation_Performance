package com.example.productapi.model;

public class InventoryResponse {

    private String productId;
    private String productName;
    private String stockStatus;
    private int quantity;

    public InventoryResponse() {
    }

    public InventoryResponse(String productId, String productName, String stockStatus, int quantity) {
        this.productId = productId;
        this.productName = productName;
        this.stockStatus = stockStatus;
        this.quantity = quantity;
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getStockStatus() { return stockStatus; }
    public void setStockStatus(String stockStatus) { this.stockStatus = stockStatus; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
