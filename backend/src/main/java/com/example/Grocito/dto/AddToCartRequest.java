package com.example.Grocito.dto;

public class AddToCartRequest {
    private Long userId;
    private Long productId;
    private int quantity;
	public AddToCartRequest() {
		super();
		// TODO Auto-generated constructor stub
	}
	public AddToCartRequest(Long userId, Long productId, int quantity) {
		super();
		this.userId = userId;
		this.productId = productId;
		this.quantity = quantity;
	}
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	public Long getProductId() {
		return productId;
	}
	public void setProductId(Long productId) {
		this.productId = productId;
	}
	public int getQuantity() {
		return quantity;
	}
	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}
	@Override
	public String toString() {
		return "AddToCartRequest [userId=" + userId + ", productId=" + productId + ", quantity=" + quantity + "]";
	}

    
}

