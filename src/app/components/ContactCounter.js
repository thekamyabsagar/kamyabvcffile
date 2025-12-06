"use client";

const ContactCounter = ({ contactsUsed, contactLimit }) => {
  if (!contactLimit) return null;

  return (
    <div className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-full shadow-sm">
      <p className="text-sm font-semibold text-indigo-700">
        Contacts: <span className="text-indigo-900">{contactsUsed || 0}</span> / <span className="text-indigo-900">{contactLimit || 0}</span>
      </p>
    </div>
  );
};

export default ContactCounter;
