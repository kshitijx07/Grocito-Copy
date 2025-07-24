package com.example.Grocito.Entity;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

    private String fullName;
    @Column(unique = true)
    private String email;
    private String password;
    private String role; // [ USER / ADMIN / DELIVERY_PARTNER ]
    private String address;
    private String pincode;
    private String contactNumber; 
    private LocalDate registeredDate;
    private LocalDate lastLogin;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Order> orders;
    
    @OneToOne(mappedBy = "user")
    @JsonIgnore
    private Cart cart;
    
    public User() {
		super();
		// TODO Auto-generated constructor stub
	}



	public User(Long id, String fullName, String email, String password, String role, String address, String pincode,
			String contactNumber, LocalDate registeredDate, List<Order> orders, Cart cart) {
		super();
		this.id = id;
		this.fullName = fullName;
		this.email = email;
		this.password = password;
		this.role = role;
		this.address = address;
		this.pincode = pincode;
		this.contactNumber = contactNumber;
		this.registeredDate = registeredDate;
		this.orders = orders;
		this.cart = cart;
	}







	// Getters & Setters
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getPincode() {
		return pincode;
	}

	public void setPincode(String pincode) {
		this.pincode = pincode;
	}
	
	public String getContactNumber() {
		return contactNumber;
	}

	public void setContactNumber(String contactNumber) {
		this.contactNumber = contactNumber;
	}

	public LocalDate getRegisteredDate() {
		return registeredDate;
	}



	public void setRegisteredDate(LocalDate registeredDate) {
		this.registeredDate = registeredDate;
	}

	public LocalDate getLastLogin() {
		return lastLogin;
	}

	public void setLastLogin(LocalDate lastLogin) {
		this.lastLogin = lastLogin;
	}

	public List<Order> getOrders() {
		return orders;
	}

	public void setOrders(List<Order> orders) {
		this.orders = orders;
	}

	public Cart getCart() {
		return cart;
	}

	public void setCart(Cart cart) {
		this.cart = cart;
	}

	@Override
	public String toString() {
		return "User [id=" + id + ", fullName=" + fullName + ", email=" + email + ", password=" + password + ", role="
				+ role + ", address=" + address + ", pincode=" + pincode + ", contactNumber=" + contactNumber + ", orders=" + orders + "]";
	}

    
}
