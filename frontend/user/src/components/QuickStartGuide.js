import React, { useState } from 'react';

const QuickStartGuide = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Grocito! 🛒",
      content: "Your one-stop grocery delivery app. Let's get you started with a quick tour.",
      icon: "🎉"
    },
    {
      title: "Browse Products",
      content: "Search and filter through our wide range of fresh groceries available in your area.",
      icon: "🔍"
    },
    {
      title: "Add to Cart",
      content: "Click 'Add to Cart' on any product. You'll see the cart count update in the header.",
      icon: "🛒"
    },
    {
      title: "Manage Your Cart",
      content: "Click the cart icon to view, update quantities, or remove items from your cart.",
      icon: "✏️"
    },
    {
      title: "Place Your Order",
      content: "Add your delivery address and place your order. We support Cash on Delivery!",
      icon: "📦"
    },
    {
      title: "Track Orders",
      content: "View all your orders in the Orders section and track their status.",
      icon: "📋"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{steps[currentStep].icon}</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-600">
            {steps[currentStep].content}
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Skip
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStartGuide;