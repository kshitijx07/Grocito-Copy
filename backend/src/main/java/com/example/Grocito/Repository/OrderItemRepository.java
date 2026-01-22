package com.example.Grocito.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Grocito.Entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}

