import { Helmet } from "react-helmet-async";
import { Check, Heart, Phone, Mail, MapPin } from "lucide-react";

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Us - CuteBae | Our Story and Mission</title>
        <meta 
          name="description" 
          content="Learn about CuteBae's journey - founded by Dr. Keerthana in Vellore. Discover our mission to provide high-quality, comfortable, and stylish kidswear for every home." 
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About Us
          </h1>
          <div className="flex justify-center mb-6">
            <Heart className="w-16 h-16 text-primary fill-primary/20" />
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-foreground/90 leading-relaxed mb-6">
              Cutebae began with a heartfelt moment — a mother searching for the perfect dress for her little girl. That mother was Dr. Keerthana, a dedicated dentist and loving mom from Vellore.
            </p>
            <p className="text-lg text-foreground/90 leading-relaxed mb-6">
              Founded on November 11, 2024, Cutebae is a reflection of her dream — a dream that has grown into a trusted retail destination for parents seeking quality kidswear.
            </p>
            <p className="text-lg text-foreground/90 leading-relaxed mb-8">
              Today, Cutebae operates as a retail store in Vellore, bringing beautifully crafted children's clothing directly to families. Every piece is thoughtfully made with:
            </p>

            {/* Features List */}
            <div className="grid gap-4 my-8">
              {[
                "Soft, premium fabrics",
                "Smooth, high-quality finishing",
                "Comfort-based designs",
                "Adorable styles kids love"
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-lg text-foreground/90">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
          <p className="text-xl text-foreground/90 leading-relaxed">
            To make high-quality, comfortable, and stylish kidswear accessible to every home.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Visit Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Location</h3>
              <p className="text-muted-foreground">Vellore, Tamil Nadu</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Phone</h3>
              <a href="tel:+919842829998" className="text-muted-foreground hover:text-primary transition-colors">
                +91 98428 29998
              </a>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <a href="mailto:cutebae.in@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                cutebae.in@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
