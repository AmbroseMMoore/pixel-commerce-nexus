
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";

const TermsConditionsPage = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-custom-purple to-custom-pink text-white py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-xl text-white/90">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="container-custom py-16">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>By accessing and using CuteBae's website and services, you accept and agree to be bound by the terms and provision of this agreement.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>Permission is granted to temporarily download one copy of CuteBae's materials for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Modify or copy the materials</li>
                      <li>Use the materials for commercial purposes or public display</li>
                      <li>Attempt to reverse engineer any software on CuteBae's website</li>
                      <li>Remove any copyright or proprietary notations from the materials</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Product Information</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>We strive to provide accurate product information, including:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Product descriptions and specifications</li>
                      <li>Pricing and availability</li>
                      <li>Images and colors (may vary due to screen settings)</li>
                    </ul>
                    <p>We reserve the right to correct any errors and update information without prior notice.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Pricing and Payment</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>All prices are in Indian Rupees (INR) and include applicable taxes unless otherwise stated. We reserve the right to change prices without notice. Payment must be made at the time of purchase through our accepted payment methods.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Account</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>When creating an account, you must provide accurate and complete information. You are responsible for:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Maintaining the confidentiality of your account</li>
                      <li>All activities that occur under your account</li>
                      <li>Notifying us of any unauthorized use</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Orders and Delivery</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>By placing an order, you agree to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Provide accurate delivery information</li>
                      <li>Be available to receive the delivery</li>
                      <li>Pay any applicable delivery charges</li>
                    </ul>
                    <p>We reserve the right to refuse or cancel orders at our discretion.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Returns and Refunds</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>Returns are accepted within 7 days of delivery. Items must be unused, unwashed, and in original packaging. Refunds will be processed within 5-7 business days after we receive the returned item.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>CuteBae shall not be liable for any damages that result from the use of, or the inability to use, the materials on this website or the performance of the products, even if CuteBae has been advised of the possibility of such damages.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Privacy Policy</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modifications</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>CuteBae may revise these terms of service at any time without notice. By using this website, you agree to be bound by the current version of these terms and conditions.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>These terms and conditions are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Tamil Nadu, India.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>If you have any questions about these Terms & Conditions, please contact us:</p>
                    <ul className="list-none space-y-2">
                      <li>📧 Email: legal@cutebae.in</li>
                      <li>📞 Phone: +91 98765 43210</li>
                      <li>📍 Address: CuteBae Store, Vellore, Tamil Nadu, India</li>
                    </ul>
                  </div>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TermsConditionsPage;
