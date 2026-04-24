import { FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export default function SocialLinks() {
  return (

    
    <div className="mt-6 flex flex-wrap gap-4">
      
        <a
        href="https://tiktok.com/@medwithrish"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center rounded-full border border-bllue-300 p-3 text-gray-700 transition hover:scale-110 hover:bg-gray-50"
        aria-label="TikTok"
      >
        <FaTiktok size={22} />
      </a>

      
      <a
        href="https://instagram.com/medwithrish_"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center rounded-full border border-bllue-300 p-3 text-gray-700 transition hover:scale-110 hover:bg-gray-50"
        aria-label="Instagram"
      >
        <FaInstagram size={22} />
      </a>

  

      
    </div>
  );
}