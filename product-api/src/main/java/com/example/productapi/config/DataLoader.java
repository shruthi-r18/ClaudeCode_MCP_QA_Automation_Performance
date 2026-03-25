package com.example.productapi.config;

import com.example.productapi.model.Product;
import com.example.productapi.service.ProductService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private ProductService productService;

    @Override
    public void run(String... args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        InputStream is = getClass().getResourceAsStream("/data/products.json");
        if (is == null) {
            throw new RuntimeException("products.json not found on classpath");
        }
        List<Product> products = mapper.readValue(is, new TypeReference<List<Product>>() {});
        productService.loadProducts(products);
        System.out.println("Loaded " + products.size() + " products into memory.");
    }
}
