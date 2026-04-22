import { useState } from "react";
import image from '../../assets/aw.jpg'

export default function FaqSection() {
  const [openItem, setOpenItem] = useState<number | null>(null);


  const faqItems = [
    {
      id: 1,
      question: "Who can use this portal?",
      answer: "This portal is restricted for use to only staff and residents of the staff quarters of Salvation Ministries.",
    },
    {
      id: 2,
      question: "How do I use the portal?",
      answer: "The first step is to create an account if you don't have one. Secondly, an admin would approve your account and assign you to the property or office you currently occupy. You can then go on to view the existing assets for the office or apartment and also make requests for equipment or maintenance services.",
    },
    {
      id: 3,
      question: "Can I cancel a request?",
      answer: "If you make a request and before it is approved, you find out there is no need for it anymore, you may cancel the request from your dashboard.",
    },
    {
      id: 4,
      question: "What if an equipment I request is not on the list?",
      answer: "If the equipment you want to request is not on the dropdown list. You may go ahead to type the name of the equipment manually to make a request for it.",
    },
    {
      id: 5,
      question: "What if a maintenance service I request is not on the list?",
      answer: "If a maintenance service requested is not on the dropdown, it means that the requested service is not covered by our scope of services. Please contact the Facility Manager for more information.",
      note: false,
    },
  ];

  return (
    <section className="">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Image Section */}
        <div className="relative h-[600px] rounded-lg overflow-hidden">
        <img src={image} alt="Logo" className="h-[80p]" />
        </div>

        <div className="space-y-6">
          {faqItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 transition-all"
            >
              <button
                onClick={() => setOpenItem(openItem === item.id ? null : item.id)}
                className="w-full text-left px-6 py-5 hover:bg-gray-50 rounded-lg"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.question}
                </h3>
              </button>

              {openItem === item.id && item.answer && (
                <div className="px-6 pb-5 pt-2 border-t border-gray-100">
                  <p className={`text-gray-600 ${item.note ? 'pl-4 border-l-4 border-orange-400' : ''}`}>
                    {item.answer}
                    {item.note && (
                      <span className="block mt-3 text-sm bg-orange-50 p-3 rounded-md">
                        Note: {item.answer}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}