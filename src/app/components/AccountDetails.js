"use client";
import { CiCalendar } from "react-icons/ci";

const AccountDetails = ({ createdAt, updatedAt }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/50">
      <div className="p-6 border-b border-slate-200/50">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <CiCalendar className="w-5 h-5 text-indigo-600" />
          Account Details
        </h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-slate-100">
          <span className="text-slate-600">Member since</span>
          <span className="font-medium text-slate-900">
            {createdAt
              ? new Date(createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
              : "N/A"}
          </span>
        </div>
        <div className="flex justify-between items-center py-3">
          <span className="text-slate-600">Last updated</span>
          <span className="font-medium text-slate-900">
            {updatedAt
              ? new Date(updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
