
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Thank you for subscribing to our newsletter!");
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="py-16 bg-brand">
      <div className="container-custom text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Subscribe to Our Newsletter
        </h2>
        <p className="text-white/90 mb-8 max-w-2xl mx-auto">
          Stay updated with our latest products, exclusive offers, and fashion tips.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/90 border-0 focus-visible:ring-white"
          />
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-white text-brand hover:bg-white/90"
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;
