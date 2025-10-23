import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageSquare, Mail, Send } from "lucide-react";
import LegalDisclaimer from "@/components/LegalDisclaimer";

const Contact = () => {
  const faqs = [
    {
      question: "How does escrow work?",
      answer: "When you place a bid or make a purchase, your payment is held in secure escrow until account verification is complete. We verify the account details match the listing, then facilitate the safe transfer of credentials. Only after both parties confirm the transaction is complete do we release the payment to the seller.",
    },
    {
      question: "How does verification happen?",
      answer: "Our team verifies account ownership by checking screenshots, statistics, and account details. We confirm the account matches the listing description and is in good standing. This process typically takes 24-48 hours and ensures you get exactly what you're paying for.",
    },
    {
      question: "What are the service fees?",
      answer: "We charge a total service fee of 8% (5% platform fee + 2% escrow fee + 1% verification fee) on all transactions. This covers verification, escrow services, negotiation support, and 24/7 customer service. All fees are clearly displayed before you confirm any purchase.",
    },
    {
      question: "Can I sell a Facebook-linked account?",
      answer: "Yes, accounts linked to any platform (Facebook, Google, Twitter, Apple) can be listed. During the transfer process, we guide both parties on safely changing account credentials and login methods to ensure a smooth transition.",
    },
    {
      question: "What happens in a dispute?",
      answer: "GameTradeX acts as a neutral mediator in all disputes. We review all evidence, communication logs, and transaction details to make a fair decision. With our escrow protection and verification processes, disputes are rare, but when they occur, we ensure both parties are treated fairly.",
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-2">Contact & Support</h1>
          <p className="text-muted-foreground">Get in touch with our team or find answers to common questions</p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Telegram</h3>
              <p className="text-sm text-muted-foreground mb-3">Fast support via Telegram</p>
              <a
                href="https://t.me/GameTradeX"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                @GameTradeX
              </a>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Discord</h3>
              <p className="text-sm text-muted-foreground mb-3">Join our community</p>
              <a
                href="https://discord.gg/gametradex"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                GameTradeX#0001
              </a>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-sm text-muted-foreground mb-3">For detailed inquiries</p>
              <a href="mailto:support@gametradex.com" className="text-primary hover:underline text-sm">
                support@gametradex.com
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Support Hours */}
        <Card className="mb-12 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Support Hours</h3>
              <p className="text-muted-foreground">
                Our team is available <span className="text-primary font-semibold">24/7</span> via Telegram and Discord
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Email responses within 12-24 hours on business days
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="mt-12 text-center bg-muted/50 rounded-lg p-8 border border-border">
          <h3 className="text-xl font-semibold mb-2">Still Have Questions?</h3>
          <p className="text-muted-foreground mb-6">
            Our support team is here to help you with any concerns or questions you may have
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://t.me/GameTradeX" target="_blank" rel="noopener noreferrer">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:shadow-glow-lg font-semibold hover:scale-105 h-10 px-4 py-2">
                <Send className="w-4 h-4" />
                Message on Telegram
              </button>
            </a>
            <a href="mailto:support@gametradex.com">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-secondary hover:border-primary/50 h-10 px-4 py-2">
                <Mail className="w-4 h-4" />
                Send Email
              </button>
            </a>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-12">
          <LegalDisclaimer />
        </div>
      </div>
    </div>
  );
};

export default Contact;
