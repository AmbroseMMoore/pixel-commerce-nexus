
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicyPage = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-custom-purple to-custom-pink text-white py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>We collect information you provide directly to us, such as when you:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Create an account or make a purchase</li>
                      <li>Subscribe to our newsletter</li>
                      <li>Contact us for customer support</li>
                      <li>Participate in surveys or promotions</li>
                    </ul>
                    <p>This may include your name, email address, phone number, shipping address, and payment information.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Process and fulfill your orders</li>
                      <li>Send you order confirmations and shipping updates</li>
                      <li>Provide customer support</li>
                      <li>Send marketing communications (with your consent)</li>
                      <li>Improve our products and services</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>With service providers who help us operate our business</li>
                      <li>To comply with legal requirements</li>
                      <li>To protect our rights and safety</li>
                      <li>With your explicit consent</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>SSL encryption for data transmission</li>
                      <li>Secure payment processing</li>
                      <li>Regular security audits</li>
                      <li>Limited access to personal information</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>You have the right to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Access and update your personal information</li>
                      <li>Delete your account and personal data</li>
                      <li>Opt-out of marketing communications</li>
                      <li>Request a copy of your data</li>
                      <li>Contact us with privacy concerns</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>If you have any questions about this Privacy Policy, please contact us:</p>
                    <ul className="list-none space-y-2">
                      <li>📧 Email: privacy@cutebae.in</li>
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

export default PrivacyPolicyPage;
