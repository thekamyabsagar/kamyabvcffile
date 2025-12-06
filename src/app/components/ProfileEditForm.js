"use client";
import { HiOutlineCheck, HiOutlineX } from "react-icons/hi";

const ProfileEditForm = ({ editForm, isSaving, onSubmit, onChange, onCancel }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-medium text-slate-700">
          Username *
        </label>
        <input
          id="username"
          type="text"
          required
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
          value={editForm.username}
          onChange={(e) => onChange("username", e.target.value)}
          disabled={isSaving}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="country" className="block text-sm font-medium text-slate-700">
            Country *
          </label>
          <input
            id="country"
            type="text"
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
            value={editForm.country}
            onChange={(e) => onChange("country", e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700">
            Phone Number *
          </label>
          <input
            id="phoneNumber"
            type="tel"
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
            value={editForm.phoneNumber}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
          Company Name *
        </label>
        <input
          id="companyName"
          type="text"
          required
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
          value={editForm.companyName}
          onChange={(e) => onChange("companyName", e.target.value)}
          disabled={isSaving}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSaving}
        >
          <HiOutlineCheck className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSaving}
        >
          <HiOutlineX className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
