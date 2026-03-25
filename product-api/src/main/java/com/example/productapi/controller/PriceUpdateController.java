package com.example.productapi.controller;

import com.example.productapi.model.PriceUpdateRequest;
import com.example.productapi.model.PriceUpdateResponse;
import com.example.productapi.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class PriceUpdateController {

    @Autowired
    private ProductService productService;

    @PostMapping("/price-update")
    public ResponseEntity<PriceUpdateResponse> updatePrice(@RequestBody PriceUpdateRequest request) {
        return ResponseEntity.ok(productService.updatePrice(request));
    }
}
