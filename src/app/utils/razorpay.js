import { useEffect, useState } from "react";

export const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if script already loaded
    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error("Failed to load Razorpay SDK");
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return isLoaded;
};

export const initiatePayment = async ({
  amount,
  packageName,
  contactLimit,
  validityDays,
  userEmail,
  userName,
  onSuccess,
  onFailure,
}) => {
  try {
    // Create order on backend
    const orderResponse = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        packageName,
        contactLimit,
        validityDays,
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      throw new Error(orderData.message || "Failed to create order");
    }

    // Razorpay options
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Kamyab VCF Converter",
      description: `${packageName} Package`,
      order_id: orderData.orderId,
      prefill: {
        name: userName || "",
        email: userEmail || "",
      },
      theme: {
        color: "#9333ea", // Purple color matching your theme
      },
      handler: async function (response) {
        try {
          // Verify payment on backend
          const verifyResponse = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packageDetails: {
                packageName,
                contactLimit,
                validityDays,
                price: amount,
              },
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyResponse.ok && verifyData.success) {
            onSuccess(verifyData);
          } else {
            throw new Error(verifyData.message || "Payment verification failed");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          onFailure(error);
        }
      },
      modal: {
        ondismiss: function () {
          onFailure(new Error("Payment cancelled by user"));
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error("Payment initiation error:", error);
    onFailure(error);
  }
};
