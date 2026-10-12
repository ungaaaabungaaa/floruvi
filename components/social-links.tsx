import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPinterest,
  FaThreads,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { socialProfiles, whatsappUrl } from "@/lib/site";

const icons = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  pinterest: FaPinterest,
  threads: FaThreads,
  youtube: FaYoutube,
  linkedin: FaLinkedin,
  x: FaXTwitter,
};

export function SocialLinks({ iconsOnly = false }: { iconsOnly?: boolean }) {
  return (
    <div className={`social-links${iconsOnly ? " social-links-icons" : ""}`}>
      {socialProfiles.map(({ key, label, url }) => {
        const Icon = icons[key];
        return (
          <a
            key={key}
            aria-label={label}
            title={label}
            href={url}
            rel="me noopener noreferrer"
            target="_blank"
          >
            <Icon size={20} aria-hidden="true" />
            {!iconsOnly && <span>{label}</span>}
          </a>
        );
      })}
      <a
        aria-label="WhatsApp"
        title="WhatsApp"
        href={whatsappUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        <FaWhatsapp size={20} aria-hidden="true" />
        {!iconsOnly && <span>WhatsApp</span>}
      </a>
    </div>
  );
}
