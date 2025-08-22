"use client";

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Coins, CheckCircle, CreditCard, Crown, Zap, Users, Sparkles, Star } from "lucide-react";
import Modal from "@/components/Modal";
import { useUser } from "@clerk/nextjs";
import { PLAN_LIMITS } from "@/lib/utils/constants/plan";

// Central plan data with monthly and yearly feature variations
const plans = [
  {
    name: "Free Plan",
    tagline: "Give AI interviews a try",
    icon: Sparkles,
    credits: { monthly: 0, yearly: 0 },
    price: { monthly: 0, yearly: 0 },
    gradient: "from-gray-100 to-gray-200",
    borderColor: "border-gray-300",
    features: {
      monthly: [
        "5 Min Mock Interview",
        "Resume Screening",
        "AI Resume Builder",
        "Basic Video Score Analysis",
        "Automated Interview Scheduling"
      ],
      yearly: [
        "60 Min Mock Interview",
        "Resume Screening",
        "AI Resume Builder",
        "Basic Video Score Analysis",
        "Automated Interview Scheduling"
      ]
    },
    highlighted: false,
    disabled: true,
  },
  {
    name: "Basic Plan",
    tagline: "Kickstart your interview prep",
    icon: Zap,
    credits: { monthly: 9000, yearly: 108000 },
    price: { monthly: 499, yearly: 4999 },
    gradient: "from-blue-100 to-indigo-100",
    borderColor: "border-blue-300",
    features: {
      monthly: [
        "150 Min Mock Interview",
        "AI Resume Creator",
        "Automated Interview Scheduling",
        "Resume Screening",
        "Video Feedback",
        "Interview Tips by AI"
      ],
      yearly: [
        "1800 Min Mock Interview",
        "AI Resume Creator",
        "Automated Interview Scheduling",
        "Resume Screening",
        "Video Feedback",
        "Interview Tips by AI"
      ]
    },
    highlighted: false,
    disabled: false,
  },
  {
    name: "Professional Plan",
    tagline: "Best for regular practice",
    icon: Crown,
    credits: { monthly: 27000, yearly: 324000 },
    price: { monthly: 1250, yearly: 14000 },
    gradient: "from-purple-100 to-pink-100",
    borderColor: "border-purple-300",
    features: {
      monthly: [
        "450 Min Mock Interview",
        "All Basic Plan Features",
        "AI Interview Insights",
        "Customizable Assessments",
        "Comprehensive Analytics",
        "Live Coding Scenarios"
      ],
      yearly: [
        "5400 Min Mock Interview",
        "All Basic Plan Features",
        "AI Interview Insights",
        "Customizable Assessments",
        "Comprehensive Analytics",
        "Live Coding Scenarios"
      ]
    },
    highlighted: true,
    disabled: false,
  },
  {
    name: "Enterprise Plan",
    tagline: "For teams and organizations",
    icon: Users,
    credits: { monthly: 120000, yearly: 1440000 },
    price: { monthly: 4999, yearly: 49999 },
    gradient: "from-emerald-100 to-teal-100",
    borderColor: "border-emerald-300",
    features: {
      monthly: [
        "2000 Min Mock Interview",
        "All Pro Plan Features",
        "Dedicated AI Coach",
        "Advanced Reporting",
        "Team Management",
        "Slack/Zoom Integration"
      ],
      yearly: [
        "24000 Min Mock Interview",
        "All Pro Plan Features",
        "Dedicated AI Coach",
        "Advanced Reporting",
        "Team Management",
        "Slack/Zoom Integration"
      ]
    },
    highlighted: false,
    disabled: false,
  },
];

export default function BuyCredits() {
  const [selectedCycle, setSelectedCycle] = useState("monthly");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedCredits, setSelectedCredits] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState("NA");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const { user } = useUser();

  const handlePayment = async () => {
    if (!user?.id) return alert("User not found");

    alert("Waiting for PayU confirmation")

    // setLoading(true);

    // const res = await fetch("/api/checkout/razorpay", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     amount: selectedPrice,
    //     clerk_id: user?.id,
    //     credits: selectedCredits,
    //     plan: selectedPlan,
    //   })
    // });

    // const result = await res.json();

    // if (!result.data?.id || !result?.state) {
    //   alert("Failed to create order");
    //   setLoading(false);
    //   return;
    // }

    // const options = {
    //   key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    //   amount: result.data.amount,
    //   currency: result.data.currency,
    //   name: "Hirenom",
    //   clerk_id: user?.id,
    //   description: `Hirenom Transaction for amount ${result.data.amount}`,
    //   order_id: result.data.id,
    //   handler: async function (response) {
    //     const verifyRes = await fetch("/api/verify-payment", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify(response),
    //     });

    //     const verify = await verifyRes.json();
    //     if (verify.state) {
    //       alert("✅ Payment Successful");
    //     } else {
    //       alert("❌ Payment verification failed");
    //     }
    //   },
    //   prefill: {
    //     name: user?.firstName || "John Doe",
    //     email: user?.emailAddresses[0]?.emailAddress || "john@example.com",
    //     contact: "9999999999",
    //   },
    //   theme: { color: "#3399cc" },
    // };

    // const rzp = new window.Razorpay(options);
    // rzp.open();
    // setLoading(false);
  };

  const handleSelection = (credits, priceObj, cycle) => {
    const price = priceObj[cycle];
    const planObj = PLAN_LIMITS[credits];
    const plan = planObj?.name || "NA";
    setSelectedCredits(credits);
    setSelectedPrice(price);
    setSelectedPlan(plan);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the plan that best fits your interview preparation needs
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setSelectedCycle("monthly")}
                className={`px-8 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  selectedCycle === "monthly" 
                    ? "bg-indigo-600 text-white shadow-lg" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedCycle("yearly")}
                className={`px-8 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                  selectedCycle === "yearly" 
                    ? "bg-indigo-600 text-white shadow-lg" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Yearly
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                  Save 10%
                </span>
              </button>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const isSelected = selectedCredits === plan.credits[selectedCycle];
              const Icon = plan.icon;
              
              return (
                <div
                  key={plan.name}
                  onClick={() =>
                    handleSelection(plan.credits[selectedCycle], plan.price, selectedCycle)
                  }
                  className={`relative cursor-pointer transition-all duration-300 ${
                    plan.disabled ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div
                    className={`h-full p-8 rounded-2xl border-2 transition-all duration-300 bg-white hover:shadow-xl ${
                      isSelected 
                        ? "border-indigo-600 shadow-lg ring-4 ring-indigo-100" 
                        : "border-gray-200 hover:border-indigo-300"
                    } ${plan.highlighted ? "ring-2 ring-indigo-200" : ""}`}
                  >
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg ${
                        isSelected || plan.highlighted
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600" 
                          : "bg-gradient-to-br from-gray-400 to-gray-600"
                      }`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-sm text-gray-600">{plan.tagline}</p>
                    </div>

                    {/* Price Display */}
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-gray-900 mb-1">
                        ₹{plan.price[selectedCycle].toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">per {selectedCycle}</div>
                    </div>

                    {/* Credits */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                        <Coins className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          {plan.credits[selectedCycle].toLocaleString()} Credits
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features[selectedCycle].map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePayment();
                      }}
                      disabled={!isSelected || loading}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                        isSelected
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {loading && isSelected ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        "Choose Plan"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Interview Report"
        width="max-w-lg"
      >
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex items-center gap-4 max-w-md mx-auto mt-10">
          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              Payments Temporarily Unavailable
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Razorpay is currently validating our application. Payment options will be available soon. Until then, enjoy free credits on us 🎉
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
