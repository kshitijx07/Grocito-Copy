import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const FAQsPage = () => {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Debug log to check if component is loading
  console.log("FAQsPage component loaded");

  const faqCategories = [
    {
      title: "General Questions",
      icon: "❓",
      faqs: [
        {
          question: "What is Grocito?",
          answer:
            "Grocito is a fast grocery delivery service that delivers fresh groceries to your doorstep in just 10 minutes. We offer a wide range of products including fruits, vegetables, dairy, snacks, and household essentials.",
        },
        {
          question: "In which areas do you deliver?",
          answer:
            "We currently deliver in major cities across India. You can check if we deliver to your area by entering your pincode on our homepage. We're constantly expanding to new areas.",
        },
        {
          question: "What are your delivery hours?",
          answer:
            "We deliver from 6:00 AM to 12:00 AM (midnight) every day of the week. Our delivery partners work round the clock to ensure you get your groceries when you need them.",
        },
        {
          question: "Is there a minimum order value?",
          answer:
            "Yes, we have a minimum order value of ₹99 to ensure efficient delivery. This helps us maintain our quick delivery promise while keeping costs reasonable.",
        },
      ],
    },
    {
      title: "Orders & Delivery",
      icon: "🚚",
      faqs: [
        {
          question: "How fast is your delivery?",
          answer:
            "We deliver most orders within 10 minutes! Our network of local stores and delivery partners ensures lightning-fast delivery to your doorstep.",
        },
        {
          question: "Can I track my order?",
          answer:
            "Yes! Once you place an order, you can track it in real-time through our app or website. You'll receive updates when your order is being prepared, picked up, and on the way.",
        },
        {
          question: "What if I'm not available during delivery?",
          answer:
            "Our delivery partner will call you before arriving. If you're not available, you can reschedule the delivery or ask someone else to receive it on your behalf.",
        },
        {
          question: "Can I modify or cancel my order?",
          answer:
            "You can modify or cancel your order within 2 minutes of placing it. After that, our team starts preparing your order and changes may not be possible.",
        },
      ],
    },
    {
      title: "Payments & Pricing",
      icon: "💳",
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major payment methods including credit/debit cards, UPI, net banking, digital wallets, and cash on delivery (COD).",
        },
        {
          question: "Are there any delivery charges?",
          answer:
            "Delivery is free for orders above ₹199. For orders below ₹199, we charge a nominal delivery fee of ₹25.",
        },
        {
          question: "Do you offer any discounts or offers?",
          answer:
            "Yes! We regularly offer discounts, cashback, and special deals. Check our app or website for current offers. First-time users get a special welcome discount.",
        },
        {
          question: "Is my payment information secure?",
          answer:
            "Absolutely! We use industry-standard encryption and secure payment gateways to protect your financial information. We never store your card details.",
        },
      ],
    },
    {
      title: "Products & Quality",
      icon: "🥬",
      faqs: [
        {
          question: "How do you ensure product quality?",
          answer:
            "We source products directly from trusted suppliers and maintain strict quality checks. Our team inspects all fresh produce before delivery to ensure you get the best quality.",
        },
        {
          question: "What if I receive damaged or expired products?",
          answer:
            "We offer a 100% quality guarantee. If you receive any damaged or expired products, contact us immediately and we'll provide a full refund or replacement.",
        },
        {
          question: "Do you sell organic products?",
          answer:
            "Yes! We have a dedicated organic section with certified organic fruits, vegetables, and other products. Look for the 'Organic' label on product listings.",
        },
        {
          question: "Can I return products?",
          answer:
            "Yes, you can return products within 24 hours of delivery if you're not satisfied. We offer hassle-free returns for most products except perishable items that have been opened.",
        },
      ],
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked <span className="text-green-600">Questions</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about Grocito's services, delivery,
            payments, and more.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="bg-white rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {category.title}
                  </h2>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {category.faqs.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 100 + faqIndex;
                  return (
                    <div key={faqIndex} className="p-6">
                      <button
                        onClick={() => toggleFAQ(globalIndex)}
                        className="w-full flex justify-between items-center text-left group"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                          {faq.question}
                        </h3>
                        {openFAQ === globalIndex ? (
                          <ChevronUpIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 text-gray-400 group-hover:text-green-600 flex-shrink-0 transition-colors" />
                        )}
                      </button>

                      {openFAQ === globalIndex && (
                        <div className="mt-4 text-gray-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Our customer support
              team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/contact")}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-semibold transition-colors"
              >
                Contact Support
              </button>
              <a
                href="tel:+919876543210"
                className="bg-white text-green-600 border border-green-600 px-6 py-3 rounded-lg hover:bg-green-50 font-semibold transition-colors"
              >
                Call Us: +91 8261977472
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQsPage;
