"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import UploadProgress from "./components/UploadProgress";
import CardTypeToggle from "./components/CardTypeToggle";
import ImagePreviewGrid from "./components/ImagePreviewGrid";
import FileUploadInput from "./components/FileUploadInput";
import SuccessDownload from "./components/SuccessDownload";
import ConsentDialog from "./components/ConsentDialog";
import Header from "./components/Header";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";

export default function Home() {
  const [files, setFiles] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [outputUrl, setOutputUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cardType, setCardType] = useState("single");
  const [showConsent, setShowConsent] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  // Fetch contact info when user is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchContactInfo();
    }
  }, [status]);

  const fetchContactInfo = async () => {
    try {
      const response = await fetch("/api/contacts/usage");
      if (response.ok) {
        const data = await response.json();
        setContactInfo(data);
      }
    } catch (error) {
      console.error("Failed to fetch contact info:", error);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    // Validate files
    const validFiles = [];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB per file
    const maxTotalFiles = 50; // Maximum total files allowed

    Array.from(selectedFiles).forEach(file => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only JPEG, PNG, and WebP images are allowed.`);
        return;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        toast.error(`File too large: ${file.name}. Maximum size is 10MB.`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length === 0) {
      return;
    }

    // Check total file count
    if (imagePreviews.length + validFiles.length > maxTotalFiles) {
      toast.error(`Maximum ${maxTotalFiles} files allowed.`);
      return;
    }

    try {
      // Create preview URLs for validated files
      const newPreviewUrls = validFiles.map(file => ({
        file: file,
        url: URL.createObjectURL(file)
      }));
      
      // Append new files to existing ones
      const updatedPreviews = [...imagePreviews, ...newPreviewUrls];
      setImagePreviews(updatedPreviews);
      
      // Combine existing files with new files
      const dt = new DataTransfer();
      updatedPreviews.forEach(preview => dt.items.add(preview.file));
      setFiles(dt.files);
    } catch (error) {
      console.error('Error creating file preview:', error);
      toast.error('Failed to process files. Please try again.');
    }
  };

  const handleDeleteImage = (index) => {
    try {
      // Revoke the URL to free memory
      if (imagePreviews[index]?.url) {
        URL.revokeObjectURL(imagePreviews[index].url);
      }

      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setImagePreviews(newPreviews);
      
      // Convert remaining previews back to a FileList-like object
      if (newPreviews.length > 0) {
        const dt = new DataTransfer();
        newPreviews.forEach(preview => dt.items.add(preview.file));
        setFiles(dt.files);
      } else {
        setFiles(null);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast.error("Please select at least one photo!");
      return;
    }

    // Show consent dialog instead of immediate upload
    setShowConsent(true);
  };

  const handleUploadConfirmed = async () => {
    setShowConsent(false);
    setLoading(true);
    setOutputUrl(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]); // "files" key matches your n8n webhook input
      }

      // Use different webhook URLs based on card type
      const webhookUrl = cardType === "single" 
        ? process.env.NEXT_PUBLIC_WEBHOOK_URL_SINGLE 
        : process.env.NEXT_PUBLIC_WEBHOOK_URL_DOUBLE;

      if (!webhookUrl) {
        throw new Error("Webhook URL not configured for " + cardType + " sided cards");
      }

      const res = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Get response as text to check if it's JSON error or VCF file
      const responseText = await res.text();
      
      // Try to parse as JSON to check for error response
      try {
        const jsonData = JSON.parse(responseText);
        // Check if it's an error response
        if (jsonData.error || (Array.isArray(jsonData) && jsonData[0]?.error)) {
          toast.error("Please provide a valid visiting card photo!");
          setLoading(false);
          return;
        }
      } catch (e) {
        // Not JSON, it's a VCF file - this is expected
      }

      // Only count the contacts AFTER successful VCF conversion
      if (status === "authenticated") {
        const contactCheckResponse = await fetch("/api/contacts/usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageCount: files.length,
            cardType: cardType
          }),
        });

        const contactCheckData = await contactCheckResponse.json();

        if (!contactCheckResponse.ok) {
          toast.error(contactCheckData.message || "Contact limit exceeded!");
          setLoading(false);
          return;
        }       
        // Refresh contact info after successful usage
        await fetchContactInfo();
      }

      // Create blob from response and set download URL
      const blob = new Blob([responseText], { type: 'text/vcard' });
      const url = window.URL.createObjectURL(blob);
      setOutputUrl(url);
      toast.success("VCF file created successfully!");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Something went wrong while uploading!");
    } finally {
      setLoading(false);
    }
  };

  const handleConvertAnother = () => {
    setOutputUrl(null);
    setFiles(null);
    setImagePreviews([]);
    // Refresh contact info after conversion
    if (status === "authenticated") {
      fetchContactInfo();
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-white">
      <Header />
      
      {/* Contact Counter - Only show for authenticated users with active package */}
      {status === "authenticated" && contactInfo && contactInfo.status === "active" && (
        <div className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-full shadow-sm">
          <p className="text-sm font-semibold text-indigo-700">
            Contacts: <span className="text-indigo-900">{contactInfo.contactsUsed || 0}</span> / <span className="text-indigo-900">{contactInfo.contactLimit || 0}</span>
          </p>
        </div>
      )}
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center border border-gray-100 mt-12">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight text-center drop-shadow-sm">
          Kamyab VCF Converter
        </h1>

        {/* Contact Info Display for authenticated users */}
        {status === "authenticated" && contactInfo && contactInfo.status === "active" && !loading}

        {/* Exhausted Contacts Warning */}
        {status === "authenticated" && contactInfo?.isExhausted && !contactInfo?.isExpired && !loading && (
          <div className="w-full mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-700 text-center font-semibold mb-2">
              ⚠️ Contact limit exhausted! Please upgrade your package to continue.
            </p>
            <button
              onClick={() => window.location.href = "/packages?upgrade=true"}
              className="w-full py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 text-sm"
            >
              Upgrade Package
            </button>
          </div>
        )}

        {/* Expired Package Warning */}
        {status === "authenticated" && contactInfo?.isExpired && !loading && (
          <div className="w-full mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600 text-center font-semibold mb-2">
              Your package has expired. Please purchase a new package to continue.
            </p>
            <button
              onClick={() => window.location.href = "/packages"}
              className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm"
            >
              Renew Package
            </button>
          </div>
        )}

        {/* No Package Warning */}
        {status === "authenticated" && contactInfo?.status === "no-package" && !loading && (
          <div className="w-full mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-700 text-center font-semibold mb-3">
              ⚠️ No active package found. Please select a package to continue.
            </p>
            <button
              onClick={() => router.push("/packages")}
              className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm"
            >
              View Packages
            </button>
          </div>
        )}

        {/* Show upload progress when loading */}
        {loading && <UploadProgress imageCount={imagePreviews.length} />}

        {/* Card Type Toggle */}
        {!outputUrl && !loading && (
          <CardTypeToggle cardType={cardType} onToggle={setCardType} />
        )}

        {/* Custom file input */}
        {!outputUrl && !loading && (
          <FileUploadInput
            hasImages={imagePreviews.length > 0}
            onFileSelect={handleFileSelect}
          />
        )}

        {/* Image Previews */}
        {!outputUrl && !loading && (
          <ImagePreviewGrid
            imagePreviews={imagePreviews}
            onDeleteImage={handleDeleteImage}
          />
        )}

        {!outputUrl && !loading && (
          <button
            onClick={handleUpload}
            disabled={!files}
            className={`w-full py-3 mt-2 rounded-xl font-semibold text-lg shadow-md transition-all duration-200
              ${!files ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-500 text-white hover:shadow-lg"}`}
          >
            Upload & Convert
          </button>
        )}

        {outputUrl && (
          <SuccessDownload
            outputUrl={outputUrl}
            onConvertAnother={handleConvertAnother}
          />
        )}
      </div>
      
      {/* Features Section */}
      <Features />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Footer */}
      <Footer />

      {/* Consent Dialog */}
      <ConsentDialog
        isOpen={showConsent}
        onClose={() => setShowConsent(false)}
        onConfirm={handleUploadConfirmed}
        cardType={cardType}
        imageCount={files ? files.length : 0}
      />
    </main>
  );
}
