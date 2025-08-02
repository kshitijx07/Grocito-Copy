// Location utility functions for better display

/**
 * Format location with area name and pincode
 * @param {Object} partner - Partner object with location data
 * @returns {string} - Formatted location string
 */
export const formatPartnerLocation = (partner) => {
  if (!partner) return 'Location not available';
  
  const area = partner.area || partner.city || getAreaFromPincode(partner.pincode);
  const pincode = partner.pincode || 'Unknown';
  
  return `${area}, ${pincode}`;
};

/**
 * Get area name from pincode (basic mapping)
 * @param {string} pincode - Pincode
 * @returns {string} - Area name
 */
export const getAreaFromPincode = (pincode) => {
  // Basic pincode to area mapping for common areas
  const pincodeMap = {
    '400001': 'Fort, Mumbai',
    '400002': 'Kalbadevi, Mumbai',
    '400003': 'Masjid Bunder, Mumbai',
    '400004': 'Girgaon, Mumbai',
    '400005': 'Ballard Estate, Mumbai',
    '400006': 'Malabar Hill, Mumbai',
    '400007': 'Grant Road, Mumbai',
    '400008': 'Mumbadevi, Mumbai',
    '400009': 'Mazagaon, Mumbai',
    '400010': 'Tardeo, Mumbai',
    '400011': 'Parel, Mumbai',
    '400012': 'Lalbaug, Mumbai',
    '400013': 'Dadar East, Mumbai',
    '400014': 'Dadar West, Mumbai',
    '400015': 'Sewri, Mumbai',
    '400016': 'Mahim, Mumbai',
    '400017': 'Dharavi, Mumbai',
    '400018': 'Worli, Mumbai',
    '400019': 'Matunga, Mumbai',
    '400020': 'Churchgate, Mumbai',
    '400021': 'Nariman Point, Mumbai',
    '400022': 'Sion, Mumbai',
    '400024': 'Kurla, Mumbai',
    '400025': 'Prabhadevi, Mumbai',
    '400026': 'Bandra East, Mumbai',
    '400050': 'Bandra West, Mumbai',
    '400051': 'Khar West, Mumbai',
    '400052': 'Santacruz East, Mumbai',
    '400054': 'Santacruz West, Mumbai',
    '400055': 'Vile Parle East, Mumbai',
    '400056': 'Vile Parle West, Mumbai',
    '400057': 'Andheri East, Mumbai',
    '400058': 'Andheri West, Mumbai',
    '400059': 'Goregaon East, Mumbai',
    '400060': 'Juhu, Mumbai',
    '400061': 'Malad West, Mumbai',
    '400062': 'Goregaon West, Mumbai',
    '400063': 'Malad East, Mumbai',
    '400064': 'Kandivali East, Mumbai',
    '400067': 'Kandivali West, Mumbai',
    '400068': 'Borivali East, Mumbai',
    '400069': 'Borivali West, Mumbai',
    '400070': 'Bhandup, Mumbai',
    '400071': 'Chembur, Mumbai',
    '400072': 'Powai, Mumbai',
    '400074': 'Santacruz East, Mumbai',
    '400075': 'Ghatkopar East, Mumbai',
    '400077': 'Ghatkopar West, Mumbai',
    '400078': 'Vikhroli, Mumbai',
    '400079': 'Mulund, Mumbai',
    '400080': 'Colaba, Mumbai',
    '400081': 'Dombivli, Mumbai',
    '400082': 'Kalyan, Mumbai',
    '400083': 'Ulhasnagar, Mumbai',
    '400084': 'Thane, Mumbai',
    '400085': 'Chunabhatti, Mumbai',
    '400086': 'Tilak Nagar, Mumbai',
    '400087': 'Chunabhatti, Mumbai',
    '400088': 'Bhandup West, Mumbai',
    '400089': 'Borivali East, Mumbai',
    '400090': 'Dahisar, Mumbai',
    '400091': 'Borivali West, Mumbai',
    '400092': 'Mahakali, Mumbai',
    '400093': 'Chakala, Mumbai',
    '400094': 'Malad East, Mumbai',
    '400095': 'Kandivali West, Mumbai',
    '400096': 'Kandivali East, Mumbai',
    '400097': 'Malad West, Mumbai',
    '400098': 'Andheri East, Mumbai',
    '400099': 'Andheri West, Mumbai',
    '441904': 'Nagpur East',
    '110001': 'Connaught Place, Delhi',
    '560001': 'Bangalore City',
    '600001': 'Chennai Central',
    '700001': 'Kolkata Central'
  };
  
  return pincodeMap[pincode] || 'Mumbai'; // Default to Mumbai if not found
};

/**
 * Format delivery address for display
 * @param {string} address - Full delivery address
 * @param {number} maxLength - Maximum length to display
 * @returns {string} - Formatted address
 */
export const formatDeliveryAddress = (address, maxLength = 50) => {
  if (!address || typeof address !== 'string') {
    return 'Address not available';
  }
  
  return address.length > maxLength 
    ? address.substring(0, maxLength) + '...' 
    : address;
};