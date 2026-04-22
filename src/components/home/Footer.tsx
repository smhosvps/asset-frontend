import { Link } from "react-router-dom";
import footerlogo from '../../assets/footerlogo.png'

type Props = {};

export default function Footer({}: Props) {
  return (
    <footer className="bg-gray-900 text-white">
      <div className=" max-w-6xl mx-auto py-12 px-4 lg:px-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-8">
          {/* Services Column */}
          <div className="mb-8 md:mb-0">
          <div className="relative w-48 h-24">
          <img src={footerlogo} alt="Logo" className="h-[80px]" />
            </div>
            <h3 className="text-lg font-semibold mb-4 text-[#FF8C00]">
              Our Services
            </h3>
            <ul className="space-y-3">
              <li className="hover:text-[#FF8C00] transition-colors">
                Installation Services
              </li>
              <li className="hover:text-[#FF8C00] transition-colors">
                Equipment Request Services
              </li>
              <li className="hover:text-[#FF8C00] transition-colors">
                Maintenance Request Services
              </li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-lg font-semibold mb-4 text-[#FF8C00]">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="#home"
                  className="hover:text-[#FF8C00] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="#about"
                  className="hover:text-[#FF8C00] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="#services"
                  className="hover:text-[#FF8C00] transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="#faqs"
                  className="hover:text-[#FF8C00] transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/sign-up"
                  className="hover:text-[#FF8C00] transition-colors"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#FF8C00]">
              Quick Contact
            </h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium">Address:</p>
                <p>GRA Phase 1, PHC, Nigeria</p>
              </div>
              <div>
                <p className="font-medium">Telephone:</p>
                <p>+2348035977491</p>
              </div>
              <div>
                <p className="font-medium">Email:</p>
                <p>maintenance@smhas.org</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-800 pt-8 mt-8 text-center">
          <p className="text-sm text-gray-400">
            Copyright © SMHOS ICT Department | All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
