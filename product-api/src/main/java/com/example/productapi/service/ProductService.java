package com.example.productapi.service;

import com.example.productapi.exception.BadRequestException;
import com.example.productapi.exception.InsufficientStockException;
import com.example.productapi.exception.ResourceNotFoundException;
import com.example.productapi.model.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ProductService {

    private final Map<String, Product> productStore = new ConcurrentHashMap<>();
    private final AtomicInteger orderCounter = new AtomicInteger(1);

    public void loadProducts(List<Product> products) {
        products.forEach(p -> productStore.put(p.getProductId(), p));
    }

    public List<Product> getAllProducts() {
        return new ArrayList<>(productStore.values());
    }

    public InventoryResponse getInventory(String productId) {
        Product p = productStore.get(productId);
        if (p == null) {
            throw new ResourceNotFoundException("Product not found: " + productId);
        }
        return new InventoryResponse(p.getProductId(), p.getName(), p.getStockStatus(), p.getQuantity());
    }

    public OrderResponse createOrder(OrderRequest request) {
        if (request.getQuantity() < 1) {
            throw new BadRequestException("Quantity must be at least 1");
        }

        Product p = productStore.get(request.getProductId());
        if (p == null) {
            throw new ResourceNotFoundException("Product not found: " + request.getProductId());
        }

        synchronized (p) {
            if (p.getQuantity() < request.getQuantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for " + p.getName() +
                        ". Available: " + p.getQuantity() +
                        ", Requested: " + request.getQuantity());
            }
            p.setQuantity(p.getQuantity() - request.getQuantity());
            updateStockStatus(p);
        }

        String orderId = "ORD-" + String.format("%05d", orderCounter.getAndIncrement());
        double total = p.getPrice() * request.getQuantity();

        return new OrderResponse(orderId, p.getProductId(), p.getName(),
                request.getQuantity(), p.getPrice(), total, "CONFIRMED", Instant.now().toString());
    }

    public PriceUpdateResponse updatePrice(PriceUpdateRequest request) {
        if (request.getNewPrice() <= 0) {
            throw new BadRequestException("Price must be greater than 0");
        }

        Product p = productStore.get(request.getProductId());
        if (p == null) {
            throw new ResourceNotFoundException("Product not found: " + request.getProductId());
        }

        double oldPrice = p.getPrice();
        p.setPrice(request.getNewPrice());

        return new PriceUpdateResponse(p.getProductId(), p.getName(),
                oldPrice, request.getNewPrice(), Instant.now().toString());
    }

    private void updateStockStatus(Product p) {
        if (p.getQuantity() == 0) {
            p.setStockStatus("OUT_OF_STOCK");
        } else if (p.getQuantity() <= 10) {
            p.setStockStatus("LOW_STOCK");
        } else {
            p.setStockStatus("IN_STOCK");
        }
    }
}
