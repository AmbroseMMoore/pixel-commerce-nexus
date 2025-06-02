
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, Clock, MapPin } from "lucide-react";

const ShippingPolicyPage = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-custom-purple to-custom-pink text-white py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping Policy</h1>
            <p className="text-xl text-white/90">
              Fast, reliable delivery across India
            </p>
          </div>
        </div>

        <div className="container-custom py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Shipping Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <Truck className="h-12 w-12 text-custom-purple mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Free Shipping</h3>
                  <p className="text-sm text-gray-600">On orders above ₹999</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-custom-purple mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Quick Delivery</h3>
                  <p className="text-sm text-gray-600">3-7 business days</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Package className="h-12 w-12 text-custom-purple mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Secure Packaging</h3>
                  <p className="text-sm text-gray-600">Safe & eco-friendly</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="h-12 w-12 text-custom-purple mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Pan India</h3>
                  <p className="text-sm text-gray-600">Delivery everywhere</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-8 space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Charges</h2>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="font-semibold text-green-700">✅ FREE SHIPPING on orders above ₹999</p>
                    </div>
                    <p>For orders below ₹999, a flat shipping charge of ₹99 applies across India.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Timeframes</h2>
                  <div className="space-y-4 text-gray-600">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Metro Cities</h3>
                        <p>Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata</p>
                        <p className="font-medium text-custom-purple">2-4 business days</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Other Cities & Towns</h3>
                        <p>All other locations across India</p>
                        <p className="font-medium text-custom-purple">4-7 business days</p>
                      </div>
                    </div>
                    <p className="text-sm">*Business days exclude Sundays and public holidays</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Processing</h2>
                  <div className="space-y-4 text-gray-600">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Orders are processed within 1-2 business days</li>
                      <li>You'll receive an order confirmation email immediately after purchase</li>
                      <li>A shipping confirmation with tracking details will be sent once dispatched</li>
                      <li>Orders placed after 2 PM may be processed the next business day</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Tracking Your Order</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>Once your order is shipped, you can track it using:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Track order link in your account dashboard</li>
                      <li>Tracking number sent via SMS and email</li>
                      <li>Real-time updates on delivery status</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Partners</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>We work with trusted delivery partners including:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Bluedart</li>
                      <li>Delhivery</li>
                      <li>DTDC</li>
                      <li>India Post</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Special Circumstances</h2>
                  <div className="space-y-4 text-gray-600">
                    <h3 className="font-semibold text-gray-900">Undeliverable Packages</h3>
                    <p>If a package cannot be delivered due to incorrect address or unavailability:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Our delivery partner will attempt delivery 2-3 times</li>
                      <li>Package will be returned to our warehouse</li>
                      <li>We'll contact you to arrange re-delivery (additional charges may apply)</li>
                    </ul>
                    
                    <h3 className="font-semibold text-gray-900 mt-6">Force Majeure</h3>
                    <p>Delivery may be delayed due to natural disasters, strikes, or other unforeseen circumstances beyond our control.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>For shipping-related queries, contact us:</p>
                    <ul className="list-none space-y-2">
                      <li>📧 Email: shipping@cutebae.in</li>
                      <li>📞 Phone: +91 98765 43210</li>
                      <li>🕒 Available: Monday - Saturday, 10 AM - 8 PM</li>
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

export default ShippingPolicyPage;
