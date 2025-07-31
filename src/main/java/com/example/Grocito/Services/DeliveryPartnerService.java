package com.example.Grocito.Services;

import com.example.Grocito.Entity.DeliveryPartner;
import com.example.Grocito.Repository.DeliveryPartnerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DeliveryPartnerService {
    private final Logger logger = LoggerFactory.getLogger(DeliveryPartnerService.class);

    @Autowired
    private DeliveryPartnerRepository deliveryPartnerRepository;

    public DeliveryPartner registerPartner(DeliveryPartner partner) {
        logger.info("Registering new delivery partner: {}", partner.getFullName());

        partner.setVerificationStatus("PENDING");
        partner.setAccountStatus("ACTIVE");
        partner.setAvailabilityStatus("OFFLINE");
        partner.setIsAvailable(false);
        partner.setTotalDeliveries(0);
        partner.setSuccessfulDeliveries(0);
        partner.setAverageRating(java.math.BigDecimal.ZERO);
        partner.setTotalEarnings(java.math.BigDecimal.ZERO);
        partner.setCreatedAt(LocalDateTime.now());
        partner.setUpdatedAt(LocalDateTime.now());

        return deliveryPartnerRepository.save(partner);
    }

    public List<DeliveryPartner> getAllDeliveryPartners(String userRole, String userPincode) {
        if ("ADMIN".equals(userRole) && userPincode != null) {
            return deliveryPartnerRepository.findByAssignedPincode(userPincode);
        } else {
            return deliveryPartnerRepository.findAll();
        }
    }

    public Optional<DeliveryPartner> getDeliveryPartnerById(Long id, String userRole, String userPincode) {
        Optional<DeliveryPartner> partnerOpt = deliveryPartnerRepository.findById(id);

        if (partnerOpt.isPresent() && "ADMIN".equals(userRole) && userPincode != null) {
            DeliveryPartner partner = partnerOpt.get();
            if (!userPincode.equals(partner.getAssignedPincode())) {
                return Optional.empty();
            }
        }

        return partnerOpt;
    }

    public DeliveryPartner updateAvailability(Long partnerId, boolean isAvailable, String availabilityStatus) {
        Optional<DeliveryPartner> partnerOpt = deliveryPartnerRepository.findById(partnerId);
        if (!partnerOpt.isPresent()) {
            throw new RuntimeException("Delivery partner not found with ID: " + partnerId);
        }

        DeliveryPartner partner = partnerOpt.get();
        partner.setIsAvailable(isAvailable);
        partner.setAvailabilityStatus(availabilityStatus);
        partner.setLastActiveAt(LocalDateTime.now());
        partner.setUpdatedAt(LocalDateTime.now());

        return deliveryPartnerRepository.save(partner);
    }

    public List<DeliveryPartner> getAvailablePartnersForPincode(String pincode) {
        return deliveryPartnerRepository.findOnlinePartnersByPincode(pincode);
    }

    public org.springframework.data.domain.Page<DeliveryPartner> getFilteredPartners(
            int page, int size, String sortBy, String verificationStatus, String accountStatus,
            String availabilityStatus, String pincode, String userRole, String userPincode) {

        List<DeliveryPartner> allPartners = getAllDeliveryPartners(userRole, userPincode);

        java.util.stream.Stream<DeliveryPartner> stream = allPartners.stream();

        if (verificationStatus != null && !verificationStatus.isEmpty()) {
            stream = stream.filter(p -> verificationStatus.equals(p.getVerificationStatus()));
        }
        if (accountStatus != null && !accountStatus.isEmpty()) {
            stream = stream.filter(p -> accountStatus.equals(p.getAccountStatus()));
        }
        if (availabilityStatus != null && !availabilityStatus.isEmpty()) {
            stream = stream.filter(p -> availabilityStatus.equals(p.getAvailabilityStatus()));
        }
        if (pincode != null && !pincode.isEmpty()) {
            stream = stream.filter(p -> pincode.equals(p.getAssignedPincode()));
        }

        List<DeliveryPartner> filteredPartners = stream.collect(java.util.stream.Collectors.toList());

        int start = page * size;
        int end = Math.min(start + size, filteredPartners.size());
        List<DeliveryPartner> pageContent = start < filteredPartners.size() ? filteredPartners.subList(start, end)
                : new java.util.ArrayList<>();

        return new org.springframework.data.domain.PageImpl<>(
                pageContent,
                org.springframework.data.domain.PageRequest.of(page, size),
                filteredPartners.size());
    }

    public DeliveryPartner updatePartner(DeliveryPartner partner) {
        logger.info("Updating delivery partner: {}", partner.getId());

        Optional<DeliveryPartner> existingOpt = deliveryPartnerRepository.findById(partner.getId());
        if (!existingOpt.isPresent()) {
            throw new RuntimeException("Delivery partner not found with ID: " + partner.getId());
        }

        DeliveryPartner existing = existingOpt.get();

        if (partner.getFullName() != null)
            existing.setFullName(partner.getFullName());
        if (partner.getEmail() != null)
            existing.setEmail(partner.getEmail());
        if (partner.getPhoneNumber() != null)
            existing.setPhoneNumber(partner.getPhoneNumber());
        if (partner.getVehicleType() != null)
            existing.setVehicleType(partner.getVehicleType());
        if (partner.getVehicleNumber() != null)
            existing.setVehicleNumber(partner.getVehicleNumber());
        if (partner.getDrivingLicense() != null)
            existing.setDrivingLicense(partner.getDrivingLicense());
        if (partner.getAssignedPincode() != null)
            existing.setAssignedPincode(partner.getAssignedPincode());
        if (partner.getBankAccountNumber() != null)
            existing.setBankAccountNumber(partner.getBankAccountNumber());
        if (partner.getBankIfscCode() != null)
            existing.setBankIfscCode(partner.getBankIfscCode());
        if (partner.getBankAccountHolderName() != null)
            existing.setBankAccountHolderName(partner.getBankAccountHolderName());

        existing.setUpdatedAt(LocalDateTime.now());

        return deliveryPartnerRepository.save(existing);
    }

    public DeliveryPartner updateLocation(Long partnerId, Double latitude, Double longitude) {
        Optional<DeliveryPartner> partnerOpt = deliveryPartnerRepository.findById(partnerId);
        if (!partnerOpt.isPresent()) {
            throw new RuntimeException("Delivery partner not found with ID: " + partnerId);
        }

        DeliveryPartner partner = partnerOpt.get();
        partner.setCurrentLatitude(java.math.BigDecimal.valueOf(latitude));
        partner.setCurrentLongitude(java.math.BigDecimal.valueOf(longitude));
        partner.setLastActiveAt(LocalDateTime.now());
        partner.setUpdatedAt(LocalDateTime.now());

        return deliveryPartnerRepository.save(partner);
    }

    public DeliveryPartner updateVerificationStatus(Long partnerId, String verificationStatus) {
        logger.info("Updating verification status for partner ID: {} to {}", partnerId, verificationStatus);

        Optional<DeliveryPartner> partnerOpt = deliveryPartnerRepository.findById(partnerId);
        if (!partnerOpt.isPresent()) {
            throw new RuntimeException("Delivery partner not found with ID: " + partnerId);
        }

        DeliveryPartner partner = partnerOpt.get();
        partner.setVerificationStatus(verificationStatus);
        partner.setUpdatedAt(LocalDateTime.now());

        return deliveryPartnerRepository.save(partner);
    }

    public java.util.Map<String, Object> getDeliveryPartnerAnalytics(String userRole, String userPincode) {
        List<DeliveryPartner> partners = getAllDeliveryPartners(userRole, userPincode);

        java.util.Map<String, Object> analytics = new java.util.HashMap<>();

        long totalPartners = partners.size();
        long verifiedPartners = partners.stream().filter(p -> "VERIFIED".equals(p.getVerificationStatus())).count();
        long pendingPartners = partners.stream().filter(p -> "PENDING".equals(p.getVerificationStatus())).count();
        long onlinePartners = partners.stream().filter(p -> "ONLINE".equals(p.getAvailabilityStatus())).count();
        long busyPartners = partners.stream().filter(p -> "BUSY".equals(p.getAvailabilityStatus())).count();

        analytics.put("totalPartners", totalPartners);
        analytics.put("verifiedPartners", verifiedPartners);
        analytics.put("pendingPartners", pendingPartners);
        analytics.put("onlinePartners", onlinePartners);
        analytics.put("busyPartners", busyPartners);
        analytics.put("offlinePartners", totalPartners - onlinePartners - busyPartners);

        return analytics;
    }

    public List<DeliveryPartner> searchPartners(String keyword, String userRole, String userPincode) {
        List<DeliveryPartner> allPartners = getAllDeliveryPartners(userRole, userPincode);

        if (keyword == null || keyword.trim().isEmpty()) {
            return allPartners;
        }

        String searchTerm = keyword.toLowerCase().trim();
        return allPartners.stream()
                .filter(partner -> (partner.getFullName() != null
                        && partner.getFullName().toLowerCase().contains(searchTerm)) ||
                        (partner.getPhoneNumber() != null && partner.getPhoneNumber().contains(searchTerm)) ||
                        (partner.getEmail() != null && partner.getEmail().toLowerCase().contains(searchTerm)) ||
                        (partner.getVehicleNumber() != null
                                && partner.getVehicleNumber().toLowerCase().contains(searchTerm)))
                .collect(java.util.stream.Collectors.toList());
    }

    public void deletePartner(Long partnerId) {
        logger.info("Soft deleting delivery partner: {}", partnerId);

        Optional<DeliveryPartner> partnerOpt = deliveryPartnerRepository.findById(partnerId);
        if (!partnerOpt.isPresent()) {
            throw new RuntimeException("Delivery partner not found with ID: " + partnerId);
        }

        DeliveryPartner partner = partnerOpt.get();
        partner.setAccountStatus("DEACTIVATED");
        partner.setUpdatedAt(LocalDateTime.now());

        deliveryPartnerRepository.save(partner);
    }

    public Optional<DeliveryPartner> getPartnerByAuthId(Long authId) {
        logger.debug("Finding delivery partner by auth ID: {}", authId);

        List<DeliveryPartner> allPartners = deliveryPartnerRepository.findAll();
        return allPartners.stream()
                .filter(partner -> partner.getAuthRecord() != null && partner.getAuthRecord().getId().equals(authId))
                .findFirst();
    }
}