import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

/*
 * CONTACT FORM - FULLY CONFIGURED ✅
 *
 * Status: ACTIVE - Using Formspree service
 * Endpoint: https://formspree.io/f/mgvzloqd
 *
 * Features:
 * ✅ Real email delivery via Formspree
 * ✅ Form validation and error handling
 * ✅ Success/error notifications
 * ✅ Automatic form reset after submission
 * ✅ Professional UI with loading states
 * ✅ Fallback contact information
 *
 * Form submissions will be delivered to the email associated with the Formspree account.
 */
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const ContactUsPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    category: "general",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Enhanced validation
    if (!formData.name.trim()) {
      toast.error(
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>Please enter your full name</span>
        </div>
      );
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      toast.error(
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>Please enter your email address</span>
        </div>
      );
      setLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>Please enter a valid email address</span>
        </div>
      );
      setLoading(false);
      return;
    }

    if (!formData.message.trim()) {
      toast.error(
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>Please enter your message</span>
        </div>
      );
      setLoading(false);
      return;
    }

    if (formData.message.trim().length < 10) {
      toast.error(
        <div className="flex items-center space-x-2">
          <InformationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>
            Please enter a more detailed message (at least 10 characters)
          </span>
        </div>
      );
      setLoading(false);
      return;
    }

    try {
      // Submit form to Formspree
      const response = await fetch("https://formspree.io/f/mgvzloqd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || "Not provided",
          subject:
            formData.subject ||
            `${
              formData.category.charAt(0).toUpperCase() +
              formData.category.slice(1)
            } Inquiry - Grocito Contact Form`,
          message: formData.message,
          category: formData.category,
          timestamp: new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          }),
          source: "Grocito Contact Form - User Dashboard",
        }),
      });

      if (response.ok) {
        toast.success(
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-gray-900">
                Message Sent Successfully!
              </div>
              <div className="text-sm text-gray-700 mt-1">
                Thank you for contacting us! We'll get back to you within 24
                hours.
              </div>
              <div className="text-xs mt-2 text-green-600 font-medium">
                Your message has been delivered to our support team.
              </div>
            </div>
          </div>,
          {
            position: "top-center",
            autoClose: 6000,
          }
        );

        // Reset form after successful submission
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          category: "general",
        });

        // Log success for debugging
        console.log("✅ Contact form submitted successfully via Formspree");
      } else {
        // Handle Formspree errors
        const errorData = await response.json().catch(() => ({}));
        console.error("Formspree error:", errorData);
        throw new Error(`Formspree error: ${response.status}`);
      }
    } catch (error) {
      console.error("Form submission error:", error);

      // Provide specific error messages
      let errorMessage =
        "Please try again or contact us directly at codercompete@gmail.com";

      if (error.message.includes("Failed to fetch")) {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      } else if (error.message.includes("Formspree error")) {
        errorMessage =
          "Form service temporarily unavailable. Please try again in a few minutes.";
      }

      toast.error(
        <div className="flex items-start space-x-3">
          <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-gray-900">
              Failed to Send Message
            </div>
            <div className="text-sm text-gray-700 mt-1">{errorMessage}</div>
            <div className="text-xs mt-2 text-gray-600">
              <span className="font-medium">Alternative:</span> Call us at +91
              8261977472 or email codercompete@gmail.com
            </div>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 8000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: PhoneIcon,
      title: "Call Us",
      description: "Mon-Sun 6AM to 12AM",
      contact: "+91 8261977472",
      action: "tel:+918261977472",
      color: "green",
    },
    {
      icon: EnvelopeIcon,
      title: "Email Us",
      description: "We'll respond within 24 hours",
      contact: "codercompete@gmail.com",
      action: "mailto:codercompete@gmail.com",
      color: "blue",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Live Chat",
      description: "Available 24/7",
      contact: "Start Chat",
      action: "#",
      color: "purple",
    },
    {
      icon: MapPinIcon,
      title: "Visit Us",
      description: "Mon-Fri 9AM to 6PM",
      contact: "Pune, Maharashtra",
      action: "#",
      color: "orange",
    },
  ];

  const faqCategories = [
    {
      icon: QuestionMarkCircleIcon,
      title: "General Inquiries",
      description: "Questions about our service",
    },
    {
      icon: TruckIcon,
      title: "Delivery Support",
      description: "Issues with orders & delivery",
    },
    {
      icon: UserGroupIcon,
      title: "Partnership",
      description: "Become a delivery partner",
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
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Get in <span className="text-green-600">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Have questions, feedback, or need help? We're here for you 24/7.
            Choose the best way to reach us and we'll get back to you quickly.
          </p>
        </div>

        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.action}
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div
                className={`w-14 h-14 bg-gradient-to-br ${
                  method.color === "green"
                    ? "from-green-100 to-emerald-100"
                    : method.color === "blue"
                    ? "from-blue-100 to-indigo-100"
                    : method.color === "purple"
                    ? "from-purple-100 to-pink-100"
                    : "from-orange-100 to-red-100"
                } rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <method.icon
                  className={`w-7 h-7 ${
                    method.color === "green"
                      ? "text-green-600"
                      : method.color === "blue"
                      ? "text-blue-600"
                      : method.color === "purple"
                      ? "text-purple-600"
                      : "text-orange-600"
                  }`}
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {method.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{method.description}</p>
              <p
                className={`font-medium ${
                  method.color === "green"
                    ? "text-green-600"
                    : method.color === "blue"
                    ? "text-blue-600"
                    : method.color === "purple"
                    ? "text-purple-600"
                    : "text-orange-600"
                }`}
              >
                {method.contact}
              </p>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Send us a Message
              </h2>
              <p className="text-gray-600">
                Fill out the form below and we'll get back to you as soon as
                possible.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="delivery">Delivery Issue</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="technical">Technical Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Brief subject of your message"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  maxLength={1000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell us how we can help you... (minimum 10 characters)"
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    Minimum 10 characters required
                  </span>
                  <span
                    className={`text-xs ${
                      formData.message.length > 900
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.message.length}/1000
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white font-semibold py-4 px-6 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending Message...</span>
                  </div>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>

          {/* FAQ & Info Section */}
          <div className="space-y-8">
            {/* Quick Help */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 border border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Quick Help
              </h3>
              <div className="space-y-4">
                {faqCategories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 bg-white/60 rounded-2xl hover:bg-white/80 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <category.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {category.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 border border-green-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Business Hours
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-green-200/50">
                  <span className="font-medium text-gray-700">
                    Customer Support
                  </span>
                  <span className="text-green-600 font-semibold">24/7</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-green-200/50">
                  <span className="font-medium text-gray-700">
                    Delivery Service
                  </span>
                  <span className="text-green-600 font-semibold">
                    6 AM - 12 AM
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-700">
                    Office Hours
                  </span>
                  <span className="text-green-600 font-semibold">
                    9 AM - 6 PM
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-3xl p-8 border border-red-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Emergency Contact
              </h3>
              <p className="text-gray-600 mb-4">
                For urgent delivery issues or emergencies, call our 24/7
                helpline:
              </p>
              <a
                href="tel:+918261977472"
                className="inline-flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                <PhoneIcon className="w-5 h-5" />
                <span>+91 8261977472</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
