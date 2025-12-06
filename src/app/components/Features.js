import { HiOutlineLightningBolt, HiOutlineShieldCheck, HiOutlineDeviceMobile } from "react-icons/hi";

const features = [
  {
    icon: HiOutlineLightningBolt,
    title: "Instant Extraction",
    description:
      "AI-powered OCR technology extracts contact details in seconds.",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "Privacy First",
    description:
      "Your business cards are processed securely and never stored.",
  },
  {
    icon: HiOutlineDeviceMobile,
    title: "Universal VCF",
    description:
      "Export to VCF format compatible with all phones and email clients.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12">
          Why Choose Kamyab?
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl border border-slate-200 p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
