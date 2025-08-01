import React from "react";
import { useNavigate } from "react-router-dom";
import {
  HeartIcon,
  TruckIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  GlobeAltIcon,
  SparklesIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
} from "@heroicons/react/24/solid";

const AboutUsPage = () => {
  const navigate = useNavigate();

  const stats = [
    { number: "10K+", label: "Happy Customers", icon: UserGroupIcon },
    { number: "2K+", label: "Daily Orders", icon: TruckIcon },
    { number: "5+", label: "Cities Served", icon: GlobeAltIcon },
    { number: "10min", label: "Average Delivery", icon: ClockIcon },
  ];

  const values = [
    {
      icon: HeartIcon,
      title: "Customer First",
      description:
        "Every decision we make starts with our customers. Their satisfaction and convenience drive everything we do.",
      color: "red",
    },
    {
      icon: ShieldCheckIcon,
      title: "Quality Assured",
      description:
        "We partner with trusted suppliers and maintain strict quality standards to ensure fresh, premium products.",
      color: "green",
    },
    {
      icon: ClockIcon,
      title: "Lightning Fast",
      description:
        "Time is precious. Our advanced logistics ensure your groceries reach you in minutes, not hours.",
      color: "blue",
    },
    {
      icon: SparklesIcon,
      title: "Innovation Driven",
      description:
        "We constantly innovate to make grocery shopping more convenient, efficient, and delightful.",
      color: "purple",
    },
  ];

  const milestones = [
    {
      year: "2025",
      title: "The Beginning",
      description:
        "Founded Grocito with a vision to revolutionize grocery delivery in India",
      icon: SparklesIcon,
      type: "past",
    },
    {
      year: "2025",
      title: "Launch & Growth",
      description:
        "Successfully launched in 3 major cities with 10-minute delivery promise",
      icon: TruckIcon,
      type: "current",
    },
    {
      year: "2026",
      title: "Expansion Goals",
      description: "Expand to 15+ cities and reach 1 million happy customers",
      icon: UserGroupIcon,
      type: "future",
    },
    {
      year: "2027",
      title: "Tech Innovation",
      description:
        "Launch AI-powered inventory management and drone delivery pilots",
      icon: ClockIcon,
      type: "future",
    },
    {
      year: "2028",
      title: "Market Leadership",
      description:
        "Become India's most trusted grocery delivery platform with 50+ cities",
      icon: StarIcon,
      type: "future",
    },
    {
      year: "2030",
      title: "Global Vision",
      description:
        "Expand internationally and pioneer sustainable, carbon-neutral delivery",
      icon: GlobeAltIcon,
      type: "future",
    },
  ];

  const testimonials = [
    {
      name: "Anita Desai",
      role: "Working Mother",
      content:
        "Grocito has been a lifesaver! Fresh groceries delivered in 10 minutes - it's like magic. My family loves the quality and convenience.",
      rating: 5,
      image: "/api/placeholder/80/80",
    },
    {
      name: "Rajesh Mehta",
      role: "Business Owner",
      content:
        "The reliability is outstanding. I can focus on my business knowing my family's grocery needs are taken care of efficiently.",
      rating: 5,
      image: "/api/placeholder/80/80",
    },
    {
      name: "Kavya Reddy",
      role: "College Student",
      content:
        "Perfect for my busy schedule! The app is so easy to use and the delivery is incredibly fast. Highly recommend!",
      rating: 5,
      image: "/api/placeholder/80/80",
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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              About <span className="text-green-200">Grocito</span>
            </h1>
            <p className="text-2xl text-green-100 max-w-4xl mx-auto leading-relaxed mb-8">
              We're on a mission to revolutionize grocery shopping in India.
              Fresh groceries, delivered in minutes, with a smile.
            </p>
            <div className="flex justify-center space-x-6">
              <button className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <PlayIcon className="w-5 h-5 inline mr-2" />
                Watch Our Story
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-green-600 transition-all duration-300"
              >
                Get In Touch
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-emerald-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-teal-400 rounded-full opacity-20 animate-pulse delay-500"></div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <section className="py-16 -mt-10 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-xl text-center border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our <span className="text-green-600">Story</span>
              </h2>
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  It all started with a simple frustration - waiting hours for
                  grocery delivery while juggling work and family. Our founders
                  realized that in a world where everything is instant, grocery
                  shopping shouldn't be an exception.
                </p>
                <p>
                  In 2020, we set out to solve this problem with cutting-edge
                  technology, strategic partnerships, and an unwavering
                  commitment to customer satisfaction. Today, we're proud to
                  serve over a million customers across 15+ cities.
                </p>
                <p>
                  But we're just getting started. Our vision extends beyond fast
                  delivery - we're building a sustainable ecosystem that
                  benefits customers, partners, and communities alike.
                </p>
              </div>
              <button
                onClick={() => navigate("/contact")}
                className="mt-8 bg-green-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center"
              >
                Join Our Journey
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <HeartSolidIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Customer Satisfaction
                      </div>
                      <div className="text-sm text-gray-600">
                        98.5% Happy Customers
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <ClockIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Lightning Fast
                      </div>
                      <div className="text-sm text-gray-600">
                        Average 8.5 min delivery
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Quality Assured
                      </div>
                      <div className="text-sm text-gray-600">
                        100% Fresh Guarantee
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our <span className="text-green-600">Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core principles guide every decision we make and every
              service we provide
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-center group hover:-translate-y-2"
                >
                  <div
                    className={`bg-${value.color}-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <IconComponent
                      className={`w-8 h-8 text-${value.color}-600`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our <span className="text-green-600">Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From our founding in 2025 to our ambitious vision for the future
            </p>
          </div>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-green-400 via-emerald-500 to-blue-400 rounded-full"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => {
                const IconComponent = milestone.icon;
                const isEven = index % 2 === 0;
                const getCardStyle = () => {
                  switch (milestone.type) {
                    case "past":
                      return "bg-white border-green-200 shadow-lg";
                    case "current":
                      return "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-xl ring-2 ring-green-200";
                    case "future":
                      return "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg";
                    default:
                      return "bg-white border-gray-100 shadow-lg";
                  }
                };
                const getIconStyle = () => {
                  switch (milestone.type) {
                    case "past":
                      return "bg-green-500";
                    case "current":
                      return "bg-gradient-to-br from-green-500 to-emerald-600 ring-4 ring-green-200";
                    case "future":
                      return "bg-gradient-to-br from-blue-500 to-indigo-600";
                    default:
                      return "bg-green-500";
                  }
                };
                const getYearStyle = () => {
                  switch (milestone.type) {
                    case "past":
                      return "text-green-600";
                    case "current":
                      return "text-green-700 font-extrabold";
                    case "future":
                      return "text-blue-600";
                    default:
                      return "text-green-600";
                  }
                };
                return (
                  <div
                    key={index}
                    className={`flex items-center ${
                      isEven ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    <div
                      className={`w-1/2 ${
                        isEven ? "pr-8 text-right" : "pl-8 text-left"
                      }`}
                    >
                      <div
                        className={`rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border ${getCardStyle()}`}
                      >
                        <div
                          className={`text-2xl font-bold mb-2 ${getYearStyle()}`}
                        >
                          {milestone.year}
                          {milestone.type === "current" && (
                            <span className="ml-2 text-sm bg-green-500 text-white px-2 py-1 rounded-full">
                              NOW
                            </span>
                          )}
                          {milestone.type === "future" && (
                            <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
                              FUTURE
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white ${getIconStyle()}`}
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="w-1/2"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              What Our <span className="text-green-600">Customers</span> Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from real customers who love Grocito
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 relative group hover:-translate-y-2"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarSolidIcon
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <div className="absolute top-6 right-6 text-6xl text-green-100 font-serif">
                  "
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-3xl p-12 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Experience the{" "}
                <span className="text-green-200">Grocito</span> Difference?
              </h2>
              <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
                Join millions of satisfied customers who have made Grocito their
                trusted grocery partner. Fresh groceries, delivered in minutes,
                with a smile.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Start Shopping Now
                </button>
                <button
                  onClick={() => navigate("/delivery-partner")}
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-green-600 transition-all duration-300"
                >
                  Become a Partner
                </button>
              </div>
            </div>

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-green-400 rounded-full opacity-20 -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-emerald-400 rounded-full opacity-20 translate-x-30 translate-y-30"></div>
            <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-teal-400 rounded-full opacity-20"></div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Let's Connect
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Have questions or want to learn more about Grocito? We'd love to
                hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/contact")}
                  className="bg-green-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                >
                  Contact Us
                </button>
                <button
                  onClick={() => navigate("/help")}
                  className="bg-white text-green-600 border border-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors"
                >
                  Visit Help Center
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUsPage;
