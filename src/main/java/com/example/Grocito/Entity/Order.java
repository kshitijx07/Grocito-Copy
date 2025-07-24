package com.example.Grocito.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "orders")
public class Order {
    
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;


    private String status; // [ PLACED / ASSIGNED / PICKED_UP / OUT_FOR_DELIVERY / DELIVERED / CANCELLED ]
    private LocalDateTime orderTime;
    private String deliveryAddress;
    private String pincode;
    private double totalAmount;
    private double deliveryFee; // Delivery fee for the partner
    private double partnerEarning; // Partner's earning from this order
    
    // Payment Management Fields
    private String paymentMethod; // ONLINE, COD
    private String paymentStatus; // PENDING, PAID, FAILED
    private String actualPaymentMethod; // For COD: CASH, UPI, CARD (what customer actually paid with)
    private String paymentId; // Transaction ID for online payments
    private LocalDateTime paymentCompletedAt; // When payment was actually completed
    private String paymentNotes; // Additional payment notes
    
    // Delivery Timeline Fields
    private LocalDateTime assignedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime cancelledAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "delivery_partner_auth_id", referencedColumnName = "id")
    private DeliveryPartnerAuth deliveryPartner;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<OrderItem> items = new ArrayList<>();


	public Order() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Order(Long id, String status, LocalDateTime orderTime, String deliveryAddress, String pincode, double totalAmount, User user,
			List<OrderItem> items) {
		super();
		this.id = id;
		this.status = status;
		this.orderTime = orderTime;
		this.deliveryAddress = deliveryAddress;
		this.pincode = pincode;
		this.totalAmount = totalAmount;
		this.user = user;
		this.items = items;
	}

	
	// Getters & Setters
	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public LocalDateTime getOrderTime() {
		return orderTime;
	}

	public void setOrderTime(LocalDateTime orderTime) {
		this.orderTime = orderTime;
	}

	public String getDeliveryAddress() {
		return deliveryAddress;
	}

	public void setDeliveryAddress(String deliveryAddress) {
		this.deliveryAddress = deliveryAddress;
	}

	public String getPincode() {
		return pincode;
	}

	public void setPincode(String pincode) {
		this.pincode = pincode;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public List<OrderItem> getItems() {
		return items;
	}

	public void setItems(List<OrderItem> items) {
		this.items = items;
	}
	
	public double getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(double totalAmount) {
		this.totalAmount = totalAmount;
	}

	public LocalDateTime getAssignedAt() {
		return assignedAt;
	}

	public void setAssignedAt(LocalDateTime assignedAt) {
		this.assignedAt = assignedAt;
	}

	public LocalDateTime getPickedUpAt() {
		return pickedUpAt;
	}

	public void setPickedUpAt(LocalDateTime pickedUpAt) {
		this.pickedUpAt = pickedUpAt;
	}

	public LocalDateTime getDeliveredAt() {
		return deliveredAt;
	}

	public void setDeliveredAt(LocalDateTime deliveredAt) {
		this.deliveredAt = deliveredAt;
	}

	public DeliveryPartnerAuth getDeliveryPartner() {
		return deliveryPartner;
	}

	public void setDeliveryPartner(DeliveryPartnerAuth deliveryPartner) {
		this.deliveryPartner = deliveryPartner;
	}

	public double getDeliveryFee() {
		return deliveryFee;
	}

	public void setDeliveryFee(double deliveryFee) {
		this.deliveryFee = deliveryFee;
	}

	public double getPartnerEarning() {
		return partnerEarning;
	}

	public void setPartnerEarning(double partnerEarning) {
		this.partnerEarning = partnerEarning;
	}

	public LocalDateTime getCancelledAt() {
		return cancelledAt;
	}

	public void setCancelledAt(LocalDateTime cancelledAt) {
		this.cancelledAt = cancelledAt;
	}

	// Payment Management Getters & Setters
	public String getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}

	public String getPaymentStatus() {
		return paymentStatus;
	}

	public void setPaymentStatus(String paymentStatus) {
		this.paymentStatus = paymentStatus;
	}

	public String getActualPaymentMethod() {
		return actualPaymentMethod;
	}

	public void setActualPaymentMethod(String actualPaymentMethod) {
		this.actualPaymentMethod = actualPaymentMethod;
	}

	public String getPaymentId() {
		return paymentId;
	}

	public void setPaymentId(String paymentId) {
		this.paymentId = paymentId;
	}

	public LocalDateTime getPaymentCompletedAt() {
		return paymentCompletedAt;
	}

	public void setPaymentCompletedAt(LocalDateTime paymentCompletedAt) {
		this.paymentCompletedAt = paymentCompletedAt;
	}

	public String getPaymentNotes() {
		return paymentNotes;
	}

	public void setPaymentNotes(String paymentNotes) {
		this.paymentNotes = paymentNotes;
	}

	@Override
	public String toString() {
		return "Order [id=" + id + ", status=" + status + ", orderTime=" + orderTime + ", deliveryAddress="
				+ deliveryAddress + ", pincode=" + pincode + ", totalAmount=" + totalAmount + ", user=" + user 
				+ ", itemsCount=" + (items != null ? items.size() : 0)+ "]";
	}
    
	
}
