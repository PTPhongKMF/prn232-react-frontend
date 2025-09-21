import { Plane, Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-amber-50 border-t border-amber-200">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:text-left">
          {/* Brand and Copyright */}
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center justify-center gap-2 text-xl font-bold text-gray-800 md:justify-start">
              <Plane className="text-blue-600" />
              <span>Mathslide</span>
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              © 2024 Mathslide Learning. All Rights Reserved.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Made with 🧡 by LaVie
            </p>
          </div>

          {/* Links and Socials */}
          <div className="flex flex-col items-center md:items-end">
            <div className="flex gap-6">
              <Link to="/about" className="text-gray-600 transition-colors hover:text-blue-600">
                About
              </Link>
              <Link to="/privacy" className="text-gray-600 transition-colors hover:text-blue-600">
                Privacy
              </Link>
              <Link to="/terms" className="text-gray-600 transition-colors hover:text-blue-600">
                Terms
              </Link>
            </div>

            <div className="mt-4 flex gap-4">
              <a href="#" className="text-gray-500 transition-colors hover:text-blue-600">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-500 transition-colors hover:text-blue-600">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 transition-colors hover:text-blue-600">
                <Linkedin size={20} />
              </a>

            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}