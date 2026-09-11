import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

export function FAQSection() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h2 className="mb-8 text-center">Frequently Asked Questions</h2>
      
      <Accordion type="single" collapsible className="space-y-2">
        <AccordionItem value="payment">
          <AccordionTrigger>How do I pay for my order?</AccordionTrigger>
          <AccordionContent>
            We accept payment via Zelle, Venmo, or cash on pickup. For Zelle and Venmo orders, 
            payment must be sent before your order can be confirmed. Please provide the confirmation 
            number or last 4 digits of the transaction when placing your order.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pickup">
          <AccordionTrigger>When can I pick up my order?</AccordionTrigger>
          <AccordionContent>
            You can select your preferred pickup or delivery time during checkout. We'll confirm 
            your time slot once we receive your order and payment. Please allow at least 2 hours 
            notice for regular orders and 24-48 hours for catering orders.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="catering">
          <AccordionTrigger>Do you offer catering services?</AccordionTrigger>
          <AccordionContent>
            Yes! We offer catering for events of all sizes. When placing your order, select the 
            "This is a catering order" option and provide details about your event in the special 
            requests section. Include the number of people, event date, and any specific requirements. 
            We require at least 48 hours notice for catering orders.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cancellation">
          <AccordionTrigger>What is your cancellation policy?</AccordionTrigger>
          <AccordionContent>
            Orders can be cancelled up to 4 hours before your scheduled pickup time for a full refund. 
            For catering orders, we require 24 hours notice for cancellations. Please contact us 
            directly to cancel your order.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="special-requests">
          <AccordionTrigger>Can I make special dietary requests?</AccordionTrigger>
          <AccordionContent>
            Absolutely! We're happy to accommodate dietary restrictions and preferences. Please 
            include any allergies, dietary requirements, or special instructions in the special 
            requests section when placing your order.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="specials">
          <AccordionTrigger>How do daily specials work?</AccordionTrigger>
          <AccordionContent>
            We offer special dishes on specific days of the week. These items are only available 
            on their designated days and appear in the menu when available. Check back regularly 
            to see what's special today!
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="contact">
          <AccordionTrigger>How can I contact you?</AccordionTrigger>
          <AccordionContent>
            You can reach us by phone or email provided in your order confirmation. For urgent 
            matters regarding existing orders, please call us directly.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
