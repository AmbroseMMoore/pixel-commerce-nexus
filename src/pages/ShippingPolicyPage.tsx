
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
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
              We aim to deliver your cute picks as quickly and safely as possible!
            </p>
          </div>
        </div>

        <div className="container-custom py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Shipping Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-custom-purple mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Quick Processing</h3>
                  <p className="text-sm text-gray-600">1-2 business days</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Truck className="h-12 w-12 text-custom-purple mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Metro Cities</h3>
                  <p className="text-sm text-gray-600">3-5 business days</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Package className="h-12 w-12 text-custom-purple mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Non-Metro Areas</h3>
                  <p className="text-sm text-gray-600">5-10 business days</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="h-12 w-12 text-custom-purple mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Tracking</h3>
                  <p className="text-sm text-gray-600">SMS/Email/WhatsApp</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-8 space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Time</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>All orders are processed within 1-2 business days.</p>
                    
                    <h3 className="font-semibold text-gray-900">Estimated delivery time:</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Metro Cities</h4>
                        <p className="font-medium text-custom-purple">3–5 business days</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Non-Metro Areas</h4>
                        <p className="font-medium text-custom-purple">5–10 business days</p>
                      </div>
                    </div>
                    
                    <p>You will receive a tracking link via SMS/Email/WhatsApp once your order ships.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Delays</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      While we try our best to deliver on time, Cutebae is not liable for delays caused by natural disasters, strikes, or courier issues beyond our control.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Missing Parcel</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Make sure you fill in your correct address when ordering from us. We cannot accept responsibility for the wrong address being used with an order. 
                      Email us if your ordered items do not arrive and we'll get in touch with our courier company to track down the package. 
                      It is safer if you can have your items delivered when you are present, so provide a secure daytime delivery address where possible.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Support</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>For further assistance, please contact our CUTEBAE Customer Support Team:</p>
                    <ul className="list-none space-y-2">
                      <li>📧 Email: cutebae.in@gmail.com</li>
                      <li>📞 Phone: +91 9787873712</li>
                      <li>🕒 Available: 10:30 AM to 8:30 PM</li>
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
