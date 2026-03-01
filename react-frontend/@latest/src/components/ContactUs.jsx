import { useState } from "react";
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function ContactUs() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    {
      id: "general",
      label: "General Inquiry",
      content: "For general questions about the platform, reach out here.",
      link: "enquiry.wheretheybelong.com"
    },
    {
      id: "support",
      label: "Support",
      content: "Need technical assistance? Our support team will help you.",
      link: "technicalsupport.wheretheybelong.com"
    },
    {
      id: "feedback",
      label: "Feedback",
      content: "Have suggestions or feedback? Share your thoughts with us.",
      link: "feedback.wheretheybelong.com"
    }
  ];

  const socialLinks = [
    { icon: <FaInstagram />, url: "https://instagram.com", name: "Instagram" },
    { icon: <FaFacebook />, url: "https://facebook.com", name: "Facebook" },
    { icon: <FaTwitter />, url: "https://twitter.com", name: "Twitter" },
    { icon: <FaLinkedin />, url: "https://linkedin.com", name: "LinkedIn" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col justify-center items-center p-8">

        <h1 className="text-4xl font-extralight text-center text-gray-800 dark:text-white mb-16">
          we're ready to help you anytime, anywhere
        </h1>

        <div className="w-full max-w-5xl rounded-2xl shadow-xl flex flex-col h-full p-10">

          {/* DOs & DON'Ts Section */}
          <div className="mb-16 text-gray-700 dark:text-white">
            <h2 className="text-3xl font-semibold text-center mb-10">
              Important Guidelines
            </h2>

            <div className="grid md:grid-cols-2 gap-10 text-lg font-light">

              {/* DOs */}
              <div className=" text-center dark:text-white">
                <h3 className="text-2xl mb-6 text-blue-600 text-center dark:text-white">Do’s</h3>

                <p className="mb-4">
                  Upload clear and recent photos where the face is fully visible. 
                  Avoid filters, heavy editing, or cropped images.
                </p>

                <p className="mb-4">
                  Provide accurate details such as last seen location and date. 
                  Correct information improves search and AI matching.
                </p>

                <p className="mb-4">
                  Share only necessary information relevant to identification. 
                  Keep personal and financial data private.
                </p>

                <p>
                  Report genuine cases and honest sightings only. 
                  False reporting may result in legal consequences.
                </p>
              </div>

              {/* DON'Ts */}
              <div className=" text-center dark:text-white">
                <h3 className="text-2xl mb-6 text-red-500 text-center dark:text-white">Don’ts</h3>

                <p className="mb-4">
                  Do not upload edited, filtered, or unclear images. 
                  Poor quality images reduce identification accuracy.
                </p>

                <p className="mb-4">
                  Do not share Aadhaar numbers, bank details, or private documents. 
                  Sensitive information must remain protected.
                </p>

                <p className="mb-4">
                  Do not confront or follow someone during a public sighting. 
                  Always prioritize your personal safety.
                </p>

                <p>
                  Do not submit fake cases or misleading information. 
                  Misuse of the platform may lead to suspension or action.
                </p>
              </div>

            </div>
          </div>

          {/* Tabs Section */}
          <div className="flex border-b border-gray-300">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-8 text-center text-2xl font-light transition-all duration-300 ${
                  activeTab === tab.id
                    ? "border-b-8 border-blue-600 text-blue-600 scale-105"
                    : "text-gray-600 hover:text-blue-300 dark:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-col dark:text-white text-center items-center justify-center p-8 text-gray-700 text-2xl font-light">
            <p>{tabs.find((tab) => tab.id === activeTab)?.content}</p>
            <p className="mt-3 text-xl">
              {tabs.find((tab) => tab.id === activeTab)?.link}
            </p>
          </div>

          {/* Social Media Footer */}
          <footer className="py-6 flex justify-center space-x-8">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-white hover:text-blue-600 text-4xl transition-transform transform hover:scale-125"
                title={link.name}
              >
                {link.icon}
              </a>
            ))}
          </footer>

        </div>
      </main>
    </div>
  );
}