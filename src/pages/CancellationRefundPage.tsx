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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Return & Refund Policy</h1>
            <p className="text-xl text-white/90">CUTEBAE is committed to providing satisfactory service</p>
          </div>
        </div>

        <div className="container-custom py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Quick Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Limited Returns</h3>
                  <p className="text-sm text-gray-600">Major damage/wrong item only</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">24 Hours</h3>
                  <p className="text-sm text-gray-600">Return request window</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Store Credit</h3>
                  <p className="text-sm text-gray-600">6 months validity</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Video Required</h3>
                  <p className="text-sm text-gray-600">Unboxing video needed</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-8 space-y-8">
                <section>
                  <p className="text-gray-600 mb-6">
                    CUTEBAE is committed to providing its customers with satisfactory service. We do not accept returns
                    for our products except in the following cases:
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Return Conditions</h2>
                  <div className="space-y-4 text-gray-600">
                    <h3 className="font-semibold text-gray-900">
                      Major Damage with usability issue/Wrong item sent (Size different from the order)
                    </h3>
                    <p>Please double check size chart before placing your order.</p>
                    <p>
                      If you receive a product with major damage affecting its usability or if you receive the wrong
                      size compared to your size mentioned in your order, you may request a return.
                    </p>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                      <p className="text-red-700">
                        <strong>Please Note:</strong> For reasons of hygiene and safety of children, the following items
                        are non-returnable and non-exchangeable:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Undergarments, socks, multipacked items</li>
                        <li>Swimwear, newborn items, gift pack sets</li>
                        <li>Hair accessories, toys and any customized products</li>
                        <li>Items purchased on clearance or final sale</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Return Procedure</h2>
                  <div className="space-y-4 text-gray-600">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        To initiate a return, you must raise a query through our support email cutebae.in@gmail.com
                        within 24 hours of receiving the product.
                      </li>
                      <li>
                        <strong>You must provide a clear unedited unboxing video</strong> along with your valid reason
                        for return request.
                      </li>
                      <li>
                        <strong>Return requests without an unboxing video will not be accepted.</strong>
                      </li>
                      <li>
                        Tracking and shipment-based complaints raised after 3 days from the date of product dispatch
                        will not be considered.
                      </li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cancellation Policy</h2>
                  <div className="space-y-4 text-gray-600">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Orders cannot be cancelled once they are received in our system.</li>
                      <li>Please ensure the product is of the correct size before placing the order.</li>
                      <li>Refunds cannot be initiated for size-related issues.</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Disclaimer</h2>
                  <div className="space-y-4 text-gray-600">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        All photographs may slightly vary in colour from actual product due to lightning conditions or
                        screen settings.
                      </li>
                      <li>
                        Product embellishments such as embroidery, stones or beads may slightly vary in placement as
                        most of them are handcrafted.
                      </li>
                      <li>
                        Minor irregularities in finishing are not considered as defects but as a part of product
                        uniqueness and are not subjected to replacement.
                      </li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Responsibilities</h2>
                  <div className="space-y-4 text-gray-600">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Exchanges are subject to product availability and may incur additional shipping charges.</li>
                      <li>
                        If the original product is unavailable, we may offer a similar alternative product of the same
                        price or less.
                      </li>
                      <li>
                        If you choose a more expensive product during the exchange, additional payment must be cleared
                        with CUTEBAE beforehand.
                      </li>
                      <li>Products must be in original condition with tags and packaging intact.</li>
                      <li>We are unable to exchange used, laundered or customer damaged goods.</li>
                      <li>
                        CUTEBAE reserves the right to assess each case separately and take necessary action at its
                        discretion.
                      </li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Refund Process</h2>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-700">
                        <strong>Important:</strong> We do not offer direct refunds. Instead, you will receive an online
                        store credit valid for 6 months.
                      </p>
                    </div>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Refunds will be issued only by online credit return.</li>
                      <li>Shipping and self returned courier costs are non-refundable.</li>
                    </ul>
                    <p>
                      <strong>
                        Please double check size charts, product description, and delivery time before placing your
                        order.
                      </strong>
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

export default CancellationRefundPage;
