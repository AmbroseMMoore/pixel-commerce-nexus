
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
              Please read these terms carefully
            </p>
          </div>
        </div>

        <div className="container-custom py-16">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      This website is operated by CUTEBAE. Throughout the site, the terms "we", "us" and "our" refer to CUTEBAE. 
                      CUTEBAE offers this website, including all information, tools and Services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
                    </p>
                    <p>
                      By visiting our site and/or purchasing something from us, you engage in our "Service" and agree to be bound by the following terms and conditions ("Terms of Service", "Terms"), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. 
                      These Terms of Service apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
                    </p>
                    <p>
                      Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms of Service. 
                      If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any Services.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Section 1 - Online Store Terms</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).</li>
                      <li>You must not transmit any worms or viruses or any code of a destructive nature.</li>
                      <li>A breach or violation of any of the Terms will result in an immediate termination of your Services.</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Section 2 - General Conditions</h2>
                  <div className="space-y-4 text-gray-600">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>We reserve the right to refuse Service to anyone for any reason at any time.</li>
                      <li>You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.</li>
                      <li>You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service or any contact on the website through which the Service is provided, without express written permission by us.</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Section 3 - Accuracy, Completeness and Timeliness of Information</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information.
                    </p>
                    <p>
                      Any reliance on the material on this site is at your own risk. This site may contain certain historical information. Historical information, necessarily, is not current and is provided for your reference only.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Section 4 - Modifications to the Service and Prices</h2>
                  <div className="space-y-4 text-gray-600">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Prices for our products are subject to change without notice.</li>
                      <li>We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.</li>
                      <li>We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Section 5 - Products or Services</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Certain products or Services may be available exclusively online through the website. These products or Services may have limited quantities and are subject to return or exchange only according to our Refund policy.
                    </p>
                    <p>
                      We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.
                    </p>
                    <p>
                      We reserve the right, but are not obligated, to limit the sales of our products or Services to any person, geographic region or jurisdiction. We do not warrant that the quality of any products, Services, information, or other material purchased or obtained by you will meet your expectations, or that any errors in the Service will be corrected.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Section 6 - Accuracy of Billing and Account Information</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. 
                      These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address.
                    </p>
                    <p>
                      You agree to provide current, complete and accurate purchase and account information for all purchases made at our store. 
                      You agree to promptly update your account and other information, including your email address and credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Section 18 - Governing Law</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Section 20 - Pricing</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Except where noted otherwise, the List Price displayed for products on our website, whether in Foreign Currency or Indian Rupees represents the full price of the product and shipping charges, unless specified otherwise in the Shipping Fees.
                    </p>
                    <p>
                      Despite our best efforts, a small number of the items in our catalogue may be mispriced. If we discover a mispricing, we will do one of the following:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>If an item's correct price is lower than our stated price, we will charge the lower amount and ship you the item.</li>
                      <li>If an item's correct price is higher than our stated price, we will, at our discretion, either contact you for instructions before shipping or cancel your order and notify you of such cancellation.</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>Questions about the Terms of Service should be sent to us:</p>
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

export default TermsConditionsPage;
