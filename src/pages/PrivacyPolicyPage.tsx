
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";

const PrivacyPolicyPage = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-custom-purple to-custom-pink text-white py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-white/90">
              Your privacy is important to us
            </p>
          </div>
        </div>

        <div className="container-custom py-16">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 space-y-8">
                <section>
                  <p className="text-gray-600 mb-6">
                    Thank you for using the website (www.cutebae.in). Your privacy is important to us.
                    Please read the following statement to learn about our information gathering and dissemination practices.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Scope</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      www.cutebae.in website (hereinafter referred as "CUTEBAE", "we", "our", "us") are committed to protecting and respecting your privacy. 
                      By using CUTEBAE and submission of personal information and in the case of a minor - submitting your personal information either by your parents or your guardian you accept and consent to the terms and practices mentioned under this Privacy Policy.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Changes/Amendments/Modifications to the Privacy Policy</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      We will treat your information following applicable laws, and regulations.
                      This Privacy Policy is subject to changes and modifications based on business, legal or regulatory requirements and will be updated online. 
                      We will make all efforts to communicate any significant changes to this Privacy Policy to you. 
                      You are encouraged to periodically visit this page to review the Privacy Policy and any changes to it. 
                      Your continued use of the App after any modification(s) to this Privacy Policy will be deemed as your acceptance of such modification(s).
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Third-Party Services</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Please note that your mobile service provider, mobile operating system provider, third-party applications (including the applications pre-loaded on your smartphones powered by Android/iOS platform or customized Android ROM ("Device"), social media platforms, and websites that you access may also collect, use and share information about you and your usage. 
                      We do not control how these third parties collect, use, share or secure this information. 
                      For information about third-party privacy practices, please refer to or read their respective privacy policies or take appropriate consultation.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Personal Information We Collect</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Personal information is defined as information that can be used to identify you and may include details such as your name, age, gender, contact information, and your interests as personally identified in products and services. 
                      Insofar as sensitive personal information is concerned, it will carry the meaning as may be defined by applicable laws from time to time.
                    </p>
                    <p>The following is how we collect, use, share and retain personal information:</p>
                    
                    <h3 className="font-semibold text-gray-900 mt-6">Collection</h3>
                    <p>
                      We may collect personal information, whenever relevant, to help provide you with information and to complete any transaction or provide any product you have requested or authorized. 
                      You also consent to the collection of certain personal information in the course of your buying the products and/or services.
                    </p>
                    
                    <h3 className="font-semibold text-gray-900 mt-6">Sharing</h3>
                    <p>
                      We may disclose personal information to our affiliates when necessary to perform services on our behalf or your behalf, to provide display advertising and promotional services, provide search results and links (including paid listings and links), provide customer service, etc. 
                      These entities and affiliates may market to you as a result of such sharing unless you are explicitly opt out.
                    </p>
                    <p>
                      We may disclose personal information to third parties. This disclosure may be required for us to provide you access to our services, for the fulfillment of your orders, for enhancing your experience, or to comply with our legal obligations.
                    </p>
                    <p>We may also share personal information with external organizations or individuals if we believe that access, use, preservation, or disclosure of the information is reasonably necessary to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>meet any applicable law, regulation, legal process, or enforceable governmental request;</li>
                      <li>detect, prevent or otherwise address fraud, security, or technical issues;</li>
                      <li>protect against harm to the rights, property, or safety of our customers or the public, as required or permitted by law.</li>
                    </ul>
                    
                    <h3 className="font-semibold text-gray-900 mt-6">Retention</h3>
                    <p>
                      The information so collected shall be retained only for the duration necessary to fulfill the purposes outlined herein unless a longer retention period is required or permitted by law and only for the purposes defined herein or at the time of collection of information. 
                      Once the purposes are achieved, all personal information is deleted in a safe and secure mode.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      We use "cookies" to collect information and to better understand customer behaviour. 
                      You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                      However, if you do not accept cookies, you may not be able to avail our goods or services to the full extent. 
                      We do not control the use of cookies by third parties. The third party service providers have their own privacy policies addressing how they use such information.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights Relating to Your Data</h2>
                  <div className="space-y-4 text-gray-600">
                    <h3 className="font-semibold text-gray-900">Right to Review</h3>
                    <p>
                      You can review the data provided by you and can request us to correct or amend such data (to the extent feasible, as determined by us). 
                      That said, we will not be responsible for the authenticity of the data or information provided by you.
                    </p>
                    
                    <h3 className="font-semibold text-gray-900 mt-6">Withdrawal of your Consent</h3>
                    <p>
                      You can choose not to provide your data, at any time while availing our goods or services or otherwise withdraw your consent provided to us earlier, in writing to our email ID: cutebae.in@gmail.com 
                      In the event you choose to not provide or later withdraw your consent, we may not be able to provide you our services or goods. 
                      Please note that these rights are subject to our compliance with applicable laws.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      We will use commercially reasonable and legally required precautions to preserve the integrity and security of your information and data. 
                      Unfortunately, the transmission of information over the internet is not completely secure and no method of electronic storage is 100% secure and reliable, and hence we cannot guarantee absolute security.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Queries/Grievance Officer</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>For any queries, questions or grievances about this Policy, please contact us:</p>
                    <ul className="list-none space-y-2">
                      <li>📧 Email: cutebae.in@gmail.com</li>
                      <li>📞 Phone: +91 97878 73712</li>
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

export default PrivacyPolicyPage;
