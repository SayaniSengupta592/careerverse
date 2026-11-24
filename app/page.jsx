
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Trophy,
  Target,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import HeroSection from "@/components/hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { features } from "@/data/features";
import { testimonial } from "@/data/testimonial";
import { faqs } from "@/data/faqs";
import { howItWorks } from "@/data/howItWorks";

export default function LandingPage() {
  return (
    <main className="overflow-hidden">

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="w-full py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">
              What We Offer
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mt-4">
              Powerful Features for Your Career Growth
            </h2>

            <p className="text-muted-foreground mt-5 text-base md:text-lg leading-relaxed">
              Everything you need to build confidence, improve your skills,
              and take the next step in your professional journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group border border-border/60 bg-card hover:border-primary/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 rounded-2xl"
              >
                <CardContent className="pt-8 pb-8 px-6 text-center flex flex-col items-center">
                  <div className="mb-6 p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    {feature.icon}
                  </div>

                  <h3 className="text-lg font-bold mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="w-full py-16 md:py-24 bg-muted/40 border-y border-border/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            {[
              {
                value: "50+",
                label: "Industries Covered",
                icon: <Target className="w-6 h-6" />,
              },
              {
                value: "1000+",
                label: "Interview Questions",
                icon: <CheckCircle2 className="w-6 h-6" />,
              },
              {
                value: "95%",
                label: "Success Rate",
                icon: <Trophy className="w-6 h-6" />,
              },
              {
                value: "24/7",
                label: "AI Support",
                icon: <Sparkles className="w-6 h-6" />,
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-3"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  {stat.icon}
                </div>

                <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                  {stat.value}
                </h3>

                <p className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">
              Simple Process
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4">
              How It Works
            </h2>

            <p className="text-muted-foreground mt-5 text-base md:text-lg">
              Four simple steps to accelerate your career growth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
            {howItWorks.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>

                <span className="text-xs font-bold tracking-[0.2em] text-primary mb-3">
                  STEP 0{index + 1}
                </span>

                <h3 className="font-bold text-xl mb-3">
                  {item.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20 md:py-28 bg-muted/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">
              Testimonials
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4">
              What Our Users Say
            </h2>

            <p className="text-muted-foreground mt-5 text-base md:text-lg">
              Discover how CareerVerse helps people move forward in their careers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonial.map((item, index) => (
              <Card
                key={index}
                className="bg-background border border-border/60 rounded-2xl hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <CardContent className="p-7">
                  <div className="flex items-center gap-2 text-primary mb-5">
                    <span className="text-4xl font-serif leading-none">
                      “
                    </span>
                  </div>

                  <p className="text-muted-foreground leading-relaxed mb-8 min-h-20">
                    {item.quote}
                  </p>

                  <div className="flex items-center gap-4">
                    <Image
                      width={48}
                      height={48}
                      src={item.image}
                      alt={item.author}
                      className="rounded-full object-cover border-2 border-primary/20"
                    />

                    <div>
                      <h3 className="font-semibold">{item.author}</h3>

                      <p className="text-sm text-muted-foreground">
                        {item.role}
                      </p>

                      <p className="text-sm text-primary font-medium">
                        {item.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">
              Got Questions?
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4">
              Frequently Asked Questions
            </h2>

            <p className="text-muted-foreground mt-5 text-base md:text-lg">
              Find answers to common questions about CareerVerse.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-border/60"
                >
                  <AccordionTrigger className="text-left font-semibold text-base hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>

                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="w-full px-4 pb-20 md:pb-28">
        <div className="relative overflow-hidden mx-auto max-w-6xl rounded-3xl gradient px-6 py-20 md:py-28">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-2 text-primary-foreground/90 text-sm font-semibold uppercase tracking-[0.2em]">
              <Sparkles className="w-4 h-4" />
              Your Future Starts Here
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-primary-foreground">
              Ready to Accelerate Your Career?
            </h2>

            <p className="text-primary-foreground/80 text-base md:text-lg max-w-2xl leading-relaxed">
              Take control of your professional journey with personalized
              AI-powered career guidance, smarter preparation, and tools
              designed to help you succeed.
            </p>

            <Link href="/dashboard">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 px-8 mt-3 font-semibold group"
              >
                Start Your Journey Today
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
