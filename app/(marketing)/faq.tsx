"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    question: "What is included in the free trial?",
    answer: "The 3-day free trial includes full access to our AI chat platform, unlimited conversations, and all premium features. No credit card required to start."
  },
  {
    question: "How does the AI-powered chat work?",
    answer: "Our platform uses advanced AI models including GPT-4, Claude, and Gemini to provide intelligent, context-aware conversations. The AI can help with coding, writing, analysis, and creative tasks."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time from your account settings. There are no cancellation fees, and you'll retain access until your current billing period ends."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and other secure payment methods through our payment processor LemonSqueezy."
  },
  {
    question: "Is my data secure and private?",
    answer: "Absolutely. We use enterprise-grade security measures, end-to-end encryption, and never store or share your personal conversations. Your privacy is our top priority."
  },
  {
    question: "Can I integrate this with my existing tools?",
    answer: "Yes, we offer API access and integrations with popular development tools, productivity apps, and workflow systems. Check our documentation for supported integrations."
  },
  {
    question: "Do you offer team or enterprise plans?",
    answer: "Yes, we have flexible team plans with collaboration features, admin controls, and priority support. Contact our sales team for enterprise pricing and custom solutions."
  },
  {
    question: "What if I need help or support?",
    answer: "We provide comprehensive documentation, video tutorials, and email support. Premium users get priority support with faster response times."
  }
];

export default function FAQ() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about our AI chat platform
            </p>
          </div>
          
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-center">Got Questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border rounded-lg px-4 hover:bg-muted/50 transition-colors"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-6">
                      <span className="text-lg font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
          
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Still have questions?{" "}
              <a 
                href="mailto:support@yourdomain.com" 
                className="text-primary hover:underline font-medium"
              >
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}