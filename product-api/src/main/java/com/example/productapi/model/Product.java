package com.example.productapi.model;

public class Product {

    private String productId;
    private String name;
    private double price;
    private String stockStatus;
    private String category;
    private int quantity;

    public Product() {
    }

    public Product(String productId, String name, double price, String stockStatus, String category, int quantity) {
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.stockStatus = stockStatus;
        this.category = category;
        this.quantity = quantity;
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getStockStatus() { return stockStatus; }
    public void setStockStatus(String stockStatus) { this.stockStatus = stockStatus; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
