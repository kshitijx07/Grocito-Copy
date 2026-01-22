package com.example.Grocito.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    private String message;
    private String type;

    @Column(name = "read_status")
    private Boolean readStatus = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    private String link;

    public Notification() {
        super();
    }

    public Notification(Long userId, String message, String type, String link) {
        super();
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.link = link;
        this.readStatus = false;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Boolean getReadStatus() {
        return readStatus;
    }

    public void setReadStatus(Boolean readStatus) {
        this.readStatus = readStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    @Override
    public String toString() {
        return "Notification [id=" + id + ", userId=" + userId + ", message=" + message + ", type=" + type
                + ", readStatus=" + readStatus + ", createdAt=" + createdAt + ", link=" + link + "]";
    }
}