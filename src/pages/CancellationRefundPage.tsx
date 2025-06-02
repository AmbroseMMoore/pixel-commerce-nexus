
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, XCircle, CheckCircle, Clock } from "lucide-react";

const CancellationRefundPage = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-custom-purple to-custom-pink text-white py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Cancellation & Refund Policy</h1>
            <p className="text-xl text-white/90">
              Easy cancellations and hassle-free refunds
            </p>
          </div>
        </div>

        <div className="container-custom py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Quick Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Free Cancellation</h3>
                  <p className="text-sm text-gray-600">Within 1 hour of order</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Easy Returns</h3>
                  <p className="text-sm text-gray-600">7-day return policy</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Quick Refunds</h3>
                  <p className="text-sm text-gray-600">5-7 business days</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">24/7 Support</h3>
                  <p className="text-sm text-gray-600">Customer assistance</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-8 space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Cancellation</h2>
                  <div className="space-y-4 text-gray-600">
                    <h3 className="font-semibold text-gray-900">Before Shipment</h3>
                    <p>You can cancel your order free of charge within 1 hour of placing it. After 1 hour, cancellation may not be possible if the order has already been processed for shipment.</p>
                    
                    <h3 className="font-semibold text-gray-900 mt-6">How to Cancel</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Log into your account and go to "My Orders"</li>
                      <li>Find the order you want to cancel</li>
                      <li>Click "Cancel Order" and select a reason</li>
                      <li>Confirm cancellation</li>
                    </ul>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                      <p className="text-amber-700"><strong>Note:</strong> Orders that have been shipped cannot be cancelled. You can return them once delivered.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Policy</h2>
                  <div className="space-y-4 text-gray-600">
                    <h3 className="font-semibold text-gray-900">Return Window</h3>
                    <p>We accept returns within 7 days of delivery. The return window starts from the date of delivery as confirmed by our logistics partner.</p>
                    
                    <h3 className="font-semibold text-gray-900 mt-6">Return Conditions</h3>
                    <p>Items eligible for return must be:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Unused and unwashed</li>
                      <li>In original packaging with all tags intact</li>
                      <li>Without any damage or stains</li>
                      <li>Accompanied by original invoice</li>
                    </ul>
                    
                    <h3 className="font-semibold text-gray-900 mt-6">Non-Returnable Items</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Items used, washed, or damaged by customer</li>
                      <li>Items without original tags or packaging</li>
                      <li>Intimate wear and undergarments (for hygiene reasons)</li>
                      <li>Items purchased during clearance sales (if specified)</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Process</h2>
                  <div className="space-y-4 text-gray-600">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="bg-custom-purple/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <span className="text-custom-purple font-bold text-xl">1</span>
                        </div>
                        <h3 className="font-semibold mb-2">Initiate Return</h3>
                        <p className="text-sm">Login to your account and select "Return Item" from your order history.</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-custom-purple/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <span className="text-custom-purple font-bold text-xl">2</span>
                        </div>
                        <h3 className="font-semibold mb-2">Schedule Pickup</h3>
                        <p className="text-sm">We'll arrange free pickup from your address within 1-2 business days.</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-custom-purple/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <span className="text-custom-purple font-bold text-xl">3</span>
                        </div>
                        <h3 className="font-semibold mb-2">Get Refund</h3>
                        <p className="text-sm">Refund processed within 5-7 days after we receive the item.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Policy</h2>
                  <div className="space-y-4 text-gray-600">
                    <h3 className="font-semibold text-gray-900">Refund Timeline</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Order Cancellation:</strong> Immediate refund if cancelled within 1 hour</li>
                      <li><strong>Returns:</strong> 5-7 business days after we receive the returned item</li>
                      <li><strong>Failed Delivery:</strong> 3-5 business days if order couldn't be delivered</li>
                    </ul>
                    
                    <h3 className="font-semibold text-gray-900 mt-6">Refund Methods</h3>
                    <p>Refunds will be processed to your original payment method:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Credit/Debit Cards:</strong> 5-7 business days</li>
                      <li><strong>UPI/Net Banking:</strong> 3-5 business days</li>
                      <li><strong>Cash on Delivery:</strong> Bank transfer within 7-10 business days</li>
                    </ul>
                    
                    <h3 className="font-semibold text-gray-900 mt-6">Partial Refunds</h3>
                    <p>In some cases, partial refunds may be issued for:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Items returned with missing accessories or packaging</li>
                      <li>Items with minor damage due to customer handling</li>
                      <li>Items returned after the specified return period</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Exchanges</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>We offer free size exchanges within 7 days of delivery. To exchange an item:</p>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Select "Exchange" instead of "Return" when initiating the process</li>
                      <li>Choose your preferred size (subject to availability)</li>
                      <li>We'll arrange pickup of the original item</li>
                      <li>New item will be shipped once we receive the returned item</li>
                    </ol>
                    <p className="text-sm bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                      <strong>Note:</strong> If the new item costs more, you'll need to pay the difference. If it costs less, we'll refund the difference.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Support</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>For any questions about cancellations, returns, or refunds, contact our customer support:</p>
                    <ul className="list-none space-y-2">
                      <li>📧 Email: returns@cutebae.in</li>
                      <li>📞 Phone: +91 98765 43210</li>
                      <li>💬 WhatsApp: +91 98765 43210</li>
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

export default CancellationRefundPage;
