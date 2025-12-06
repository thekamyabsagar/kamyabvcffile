import { HiOutlineCreditCard } from "react-icons/hi";
import Logo from "./Logo";
const Footer = () => {
  return (
    <footer className="py-8 px-4 border-t border-slate-200 bg-white w-full">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">
            <Logo />
          </span>
        </div>
        <p className="text-sm text-slate-600">
          © {new Date().getFullYear()} Kamyab. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
