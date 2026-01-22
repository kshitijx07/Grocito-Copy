import React from "react";
import { useNavigate } from "react-router-dom";
import {
  TruckIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const DeliveryPartnerPage = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: CurrencyRupeeIcon,
      title: "Earn ₹15,000 - ₹25,000/month",
      description:
        "Competitive earnings with performance bonuses and incentives",
    },
    {
      icon: ClockIcon,
      title: "Flexible Working Hours",
      description:
        "Choose your own schedule and work when it's convenient for you",
    },
    {
      icon: TruckIcon,
      title: "Vehicle Support",
      description:
        "We provide fuel allowance and maintenance support for your vehicle",
    },
    {
      icon: UserGroupIcon,
      title: "Join Our Community",
      description: "Be part of a supportive team of delivery professionals",
    },
  ];

  const requirements = [
    "Age between 18-50 years",
    "Valid driving license",
    "Own vehicle (bike/scooter/car)",
    "Smartphone with internet connection",
    "Basic knowledge of local area",
    "Good communication skills",
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Apply Online",
      description: "Fill out our simple application form with your details",
    },
    {
      step: "2",
      title: "Document Verification",
      description: "Submit required documents for verification",
    },
    {
      step: "3",
      title: "Training Session",
      description: "Attend a brief training session about our delivery process",
    },
    {
      step: "4",
      title: "Start Earning",
      description: "Begin accepting orders and start earning immediately",
    },
  ];

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 group"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Grocito</span>
            </button>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Become a <span className="text-green-600">Delivery Partner</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Join thousands of delivery partners who are earning good money while
            serving their community. Flexible hours, competitive pay, and the
            satisfaction of bringing smiles to customers' faces.
          </p>
          <a
            href="http://localhost:3002/auth/register"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-green-500 text-white px-8 py-4 rounded-xl hover:bg-green-600 font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <TruckIcon className="w-6 h-6 mr-2" />
            Apply Now
          </a>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose Grocito?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements Section */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Requirements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{requirement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Earnings Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Earning Potential</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">₹500-800</div>
                  <div className="text-green-100">Per Day</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">₹15,000+</div>
                  <div className="text-green-100">Per Month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">₹50-100</div>
                  <div className="text-green-100">Per Delivery</div>
                </div>
              </div>
              <p className="mt-6 text-green-100">
                *Earnings may vary based on location, hours worked, and
                performance
              </p>
            </div>
          </div>
        </div>

        {/* Service Areas */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Service Areas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                "Mumbai",
                "Delhi",
                "Bangalore",
                "Hyderabad",
                "Chennai",
                "Pune",
                "Kolkata",
                "Ahmedabad",
              ].map((city, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center space-x-2 p-3 bg-green-50 rounded-lg"
                >
                  <MapPinIcon className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700 font-medium">{city}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-600 mt-6">
              Don't see your city? We're expanding rapidly! Apply now and we'll
              notify you when we launch in your area.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our team of delivery heroes and start earning today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="http://localhost:3002/auth/register"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-8 py-4 rounded-xl hover:bg-green-600 font-semibold transition-colors"
            >
              Apply as Delivery Partner
            </a>
            <button
              onClick={() => navigate("/contact")}
              className="bg-white text-green-600 border border-green-600 px-8 py-4 rounded-xl hover:bg-green-50 font-semibold transition-colors"
            >
              Have Questions? Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartnerPage;
