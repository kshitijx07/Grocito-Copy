-- Create locations table for area name and pincode mapping
CREATE TABLE IF NOT EXISTS locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pincode VARCHAR(6) NOT NULL,
    area_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    sub_district VARCHAR(100),
    service_available BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_pincode (pincode),
    INDEX idx_area_name (area_name),
    INDEX idx_city (city),
    INDEX idx_state (state),
    INDEX idx_service_available (service_available),
    INDEX idx_is_active (is_active)
);

-- Insert some sample data for major Indian cities
INSERT INTO locations (pincode, area_name, city, state, service_available) VALUES
-- Delhi
('110001', 'Connaught Place', 'New Delhi', 'Delhi', TRUE),
('110002', 'Darya Ganj', 'New Delhi', 'Delhi', TRUE),
('110003', 'Kashmere Gate', 'New Delhi', 'Delhi', TRUE),
('110005', 'Karol Bagh', 'New Delhi', 'Delhi', TRUE),
('110006', 'Ranjit Nagar', 'New Delhi', 'Delhi', TRUE),
('110007', 'Rajinder Nagar', 'New Delhi', 'Delhi', TRUE),
('110008', 'Patel Nagar', 'New Delhi', 'Delhi', TRUE),
('110009', 'R K Puram', 'New Delhi', 'Delhi', TRUE),
('110010', 'South Extension', 'New Delhi', 'Delhi', TRUE),
('110011', 'Lajpat Nagar', 'New Delhi', 'Delhi', TRUE),
('110012', 'Vasant Vihar', 'New Delhi', 'Delhi', TRUE),
('110013', 'Safdarjung', 'New Delhi', 'Delhi', TRUE),
('110014', 'Hauz Khas', 'New Delhi', 'Delhi', TRUE),
('110015', 'Jangpura', 'New Delhi', 'Delhi', TRUE),
('110016', 'Lodi Road', 'New Delhi', 'Delhi', TRUE),
('110017', 'Sarojini Nagar', 'New Delhi', 'Delhi', TRUE),
('110018', 'Cannaught Circus', 'New Delhi', 'Delhi', TRUE),
('110019', 'Kalkaji', 'New Delhi', 'Delhi', TRUE),
('110020', 'Munirka', 'New Delhi', 'Delhi', TRUE),
('110021', 'Dwarka', 'New Delhi', 'Delhi', TRUE),

-- Mumbai
('400001', 'Fort', 'Mumbai', 'Maharashtra', TRUE),
('400002', 'Kalbadevi', 'Mumbai', 'Maharashtra', TRUE),
('400003', 'Masjid Bunder', 'Mumbai', 'Maharashtra', TRUE),
('400004', 'Girgaon', 'Mumbai', 'Maharashtra', TRUE),
('400005', 'Colaba', 'Mumbai', 'Maharashtra', TRUE),
('400006', 'Malabar Hill', 'Mumbai', 'Maharashtra', TRUE),
('400007', 'Grant Road', 'Mumbai', 'Maharashtra', TRUE),
('400008', 'Mumbai Central', 'Mumbai', 'Maharashtra', TRUE),
('400009', 'Mazgaon', 'Mumbai', 'Maharashtra', TRUE),
('400010', 'Tardeo', 'Mumbai', 'Maharashtra', TRUE),
('400011', 'Jacob Circle', 'Mumbai', 'Maharashtra', TRUE),
('400012', 'Lalbaug', 'Mumbai', 'Maharashtra', TRUE),
('400013', 'Dadar East', 'Mumbai', 'Maharashtra', TRUE),
('400014', 'Dadar West', 'Mumbai', 'Maharashtra', TRUE),
('400015', 'Sewri', 'Mumbai', 'Maharashtra', TRUE),
('400016', 'Mahim', 'Mumbai', 'Maharashtra', TRUE),
('400017', 'Dharavi', 'Mumbai', 'Maharashtra', TRUE),
('400018', 'Worli', 'Mumbai', 'Maharashtra', TRUE),
('400019', 'Matunga East', 'Mumbai', 'Maharashtra', TRUE),
('400020', 'Churchgate', 'Mumbai', 'Maharashtra', TRUE),

-- Bangalore
('560001', 'Bangalore GPO', 'Bangalore', 'Karnataka', TRUE),
('560002', 'Bangalore City Market', 'Bangalore', 'Karnataka', TRUE),
('560003', 'Malleshwaram', 'Bangalore', 'Karnataka', TRUE),
('560004', 'Basavanagudi', 'Bangalore', 'Karnataka', TRUE),
('560005', 'Seshadripuram', 'Bangalore', 'Karnataka', TRUE),
('560006', 'Chamrajpet', 'Bangalore', 'Karnataka', TRUE),
('560007', 'Rajajinagar', 'Bangalore', 'Karnataka', TRUE),
('560008', 'Sadashivanagar', 'Bangalore', 'Karnataka', TRUE),
('560009', 'Rajmahal Vilas', 'Bangalore', 'Karnataka', TRUE),
('560010', 'Vyalikaval', 'Bangalore', 'Karnataka', TRUE),
('560011', 'Shivajinagar', 'Bangalore', 'Karnataka', TRUE),
('560012', 'Malleswaram West', 'Bangalore', 'Karnataka', TRUE),
('560013', 'Sadashivanagar', 'Bangalore', 'Karnataka', TRUE),
('560014', 'Vasanthnagar', 'Bangalore', 'Karnataka', TRUE),
('560015', 'Kumara Park', 'Bangalore', 'Karnataka', TRUE),
('560016', 'Sanjaynagar', 'Bangalore', 'Karnataka', TRUE),
('560017', 'Yeshwantpur', 'Bangalore', 'Karnataka', TRUE),
('560018', 'Malleswaram', 'Bangalore', 'Karnataka', TRUE),
('560019', 'Jalahalli', 'Bangalore', 'Karnataka', TRUE),
('560020', 'Rajajinagar', 'Bangalore', 'Karnataka', TRUE),

-- Pune
('411001', 'Pune City', 'Pune', 'Maharashtra', FALSE),
('411002', 'Ganeshpeth', 'Pune', 'Maharashtra', FALSE),
('411003', 'Pune Cantonment', 'Pune', 'Maharashtra', FALSE),
('411004', 'Pune University', 'Pune', 'Maharashtra', FALSE),
('411005', 'Shivajinagar', 'Pune', 'Maharashtra', FALSE),
('411006', 'Budhwar Peth', 'Pune', 'Maharashtra', FALSE),
('411007', 'Aundh', 'Pune', 'Maharashtra', FALSE),
('411008', 'Shivaji Nagar', 'Pune', 'Maharashtra', FALSE),
('411009', 'Deccan Gymkhana', 'Pune', 'Maharashtra', FALSE),
('411010', 'Ghole Road', 'Pune', 'Maharashtra', FALSE),

-- Chennai
('600001', 'Chennai GPO', 'Chennai', 'Tamil Nadu', FALSE),
('600002', 'Anna Salai', 'Chennai', 'Tamil Nadu', FALSE),
('600003', 'Egmore', 'Chennai', 'Tamil Nadu', FALSE),
('600004', 'Mylapore', 'Chennai', 'Tamil Nadu', FALSE),
('600005', 'Triplicane', 'Chennai', 'Tamil Nadu', FALSE),
('600006', 'Chepauk', 'Chennai', 'Tamil Nadu', FALSE),
('600007', 'Vepery', 'Chennai', 'Tamil Nadu', FALSE),
('600008', 'Thousand Lights', 'Chennai', 'Tamil Nadu', FALSE),
('600009', 'Egmore', 'Chennai', 'Tamil Nadu', FALSE),
('600010', 'Kilpauk', 'Chennai', 'Tamil Nadu', FALSE);

-- Add some sample data for areas where service is not available yet
INSERT INTO locations (pincode, area_name, city, state, service_available) VALUES
-- Hyderabad (service not available)
('500001', 'Abids', 'Hyderabad', 'Telangana', FALSE),
('500002', 'Nampally', 'Hyderabad', 'Telangana', FALSE),
('500003', 'Kachiguda', 'Hyderabad', 'Telangana', FALSE),
('500004', 'Sultan Bazar', 'Hyderabad', 'Telangana', FALSE),
('500005', 'Secunderabad', 'Hyderabad', 'Telangana', FALSE),

-- Kolkata (service not available)
('700001', 'Kolkata GPO', 'Kolkata', 'West Bengal', FALSE),
('700002', 'Howrah', 'Kolkata', 'West Bengal', FALSE),
('700003', 'Ultadanga', 'Kolkata', 'West Bengal', FALSE),
('700004', 'Howrah', 'Kolkata', 'West Bengal', FALSE),
('700005', 'Alipore', 'Kolkata', 'West Bengal', FALSE);