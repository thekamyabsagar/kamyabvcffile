import { HiOutlineUpload, HiOutlineChip, HiOutlineArrowDown } from "react-icons/hi";

const steps = [
  {
    icon: HiOutlineUpload,
    step: "01",
    title: "Upload",
    description: "Take a photo or upload an image of your visiting card.",
  },
  {
    icon: HiOutlineChip,
    step: "02",
    title: "Process",
    description: "Our AI extracts all contact information automatically.",
  },
  {
    icon: HiOutlineArrowDown,
    step: "03",
    title: "Download",
    description: "Get your VCF file ready to import to any device.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-10 px-4 bg-slate-50 mb-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12">
          How It Works
        </h2>
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-4">
          {steps.map((item, index) => (
            <div key={item.step} className="flex-1 relative">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="text-3xl font-bold text-indigo-200">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {item.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden sm:block absolute top-1/2 -right-4 w-8 h-0.5 bg-slate-300" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
