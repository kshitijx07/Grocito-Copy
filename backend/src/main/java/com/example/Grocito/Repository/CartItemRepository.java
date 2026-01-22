package com.example.Grocito.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Grocito.Entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
