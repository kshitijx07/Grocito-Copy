import React from 'react';

const PaymentMethodIcons = () => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-2">
      {/* UPI */}
      <div className="bg-white rounded-md p-1 shadow-sm border">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/200px-UPI-Logo-vector.svg.png" 
          alt="UPI" 
          className="h-6 w-auto"
        />
      </div>
      
      {/* Google Pay */}
      <div className="bg-white rounded-md p-1 shadow-sm border">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/200px-Google_Pay_Logo_%282020%29.svg.png" 
          alt="Google Pay" 
          className="h-6 w-auto"
        />
      </div>
      
      {/* PhonePe */}
      <div className="bg-white rounded-md p-1 shadow-sm border">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/200px-PhonePe_Logo.svg.png" 
          alt="PhonePe" 
          className="h-6 w-auto"
        />
      </div>
      
      {/* Paytm */}
      <div className="bg-white rounded-md p-1 shadow-sm border">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/200px-Paytm_Logo_%28standalone%29.svg.png" 
          alt="Paytm" 
          className="h-6 w-auto"
        />
      </div>
      
      {/* Visa */}
      <div className="bg-white rounded-md p-1 shadow-sm border">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" 
          alt="Visa" 
          className="h-6 w-auto"
        />
      </div>
      
      {/* Mastercard */}
      <div className="bg-white rounded-md p-1 shadow-sm border">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" 
          alt="Mastercard" 
          className="h-6 w-auto"
        />
      </div>
    </div>
  );
};

export default PaymentMethodIcons;