import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const faqData = [
  {
    category: "Orders & Shipping",
    questions: [
      {
        question: "How long does delivery take?",
        answer:
          "We typically deliver within 3-7 business days across India. Metro cities usually receive orders within 2-4 days.",
      },
      {
        question: "Do you offer free shipping?",
        answer:
          "Yes! We offer free shipping on orders above ₹3000. For orders below this amount, a nominal shipping charge of ₹99 applies.",
      },
      {
        question: "Can I track my order?",
        answer:
          "Absolutely! Once your order is shipped, you'll receive a tracking number via SMS and email to monitor your package.",
      },
      {
        question: "What if my order is delayed?",
        answer:
          "In rare cases of delays, we'll notify you immediately. You can also contact our support team for real-time updates.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        question: "What is your return policy?",
        answer:
          "We offer easy 7-day returns from the date of delivery. Items should be unused, unwashed, and in original packaging with tags intact.",
      },
      {
        question: "How do I return an item?",
        answer:
          "Simply go to your account, select the order, and choose 'Return Item'. We'll arrange a free pickup from your address.",
      },
      {
        question: "When will I get my refund?",
        answer:
          "Refunds are processed within 5-7 business days after we receive the returned item. The amount will be credited to your original payment method.",
      },
      {
        question: "Can I exchange for a different size?",
        answer:
          "Yes! We offer free size exchanges within 7 days. Just request an exchange instead of a return when initiating the process.",
      },
    ],
  },
  {
    category: "Products & Sizing",
    questions: [
      {
        question: "How do I choose the right size?",
        answer:
          "Each product page has a detailed size chart. We recommend measuring your child and comparing with our size guide for the best fit.",
      },
      {
        question: "Are your clothes safe for babies?",
        answer:
          "Absolutely! All our products are made from baby-safe, non-toxic materials and undergo strict quality checks.",
      },
      {
        question: "Do you have organic/eco-friendly options?",
        answer:
          "Yes! Look for our 'Eco-Friendly' tag on products. We offer a range of organic cotton and sustainable fabric options.",
      },
      {
        question: "How should I care for the clothes?",
        answer:
          "Care instructions are provided on each product page and on the garment labels. Generally, we recommend gentle machine wash in cold water.",
      },
    ],
  },
  {
    category: "Payment & Account",
    questions: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit/debit cards, UPI and net banking for eligible orders.",
      },
      {
        question: "Is it safe to pay online?",
        answer:
          "Yes! We use industry-standard SSL encryption and secure payment gateways to protect your financial information.",
      },
      {
        question: "Can I modify my order after placing it?",
        answer:
          "Orders can be modified within 1 hour of placement. After that, you'll need to cancel and place a new order.",
      },
      {
        question: "How do I create an account?",
        answer:
          "Click on 'Sign Up' and provide your email. You can also sign up using your Google account for quick access.",
      },
    ],
  },
];

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFAQs = faqData
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (item) =>
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-custom-purple to-custom-pink text-white py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Find answers to common questions about shopping with CuteBae
            </p>
          </div>
        </div>

        <div className="container-custom py-16">
          {/* Search */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-3"
              />
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="max-w-4xl mx-auto space-y-8">
            {filteredFAQs.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle className="text-2xl text-custom-purple">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((item, index) => (
                      <AccordionItem key={index} value={`${categoryIndex}-${index}`}>
                        <AccordionTrigger className="text-left font-medium hover:text-custom-purple">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 leading-relaxed">{item.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFAQs.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No FAQs found</h3>
              <p className="text-gray-600">Try different search terms or browse all categories.</p>
            </div>
          )}

          {/* Contact Section */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h3>
                <p className="text-gray-600 mb-6">
                  Can't find the answer you're looking for? Our customer support team is here to help!
                </p>
                <div className="space-y-2">
                  <p className="text-custom-purple font-medium">📧 cutebae.in@gmail.com</p>
                  <p className="text-custom-purple font-medium">📞 +91 97878 73712</p>
                  <p className="text-sm text-gray-500">Available Monday - Saturday, 10 AM - 8 PM</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FAQPage;
