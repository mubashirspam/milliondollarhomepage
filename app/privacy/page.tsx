export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose prose-indigo max-w-none">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly to us when making a purchase, such as your email address, name, and billing information securely processed through Razorpay.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
          <p className="mb-4">
            We use the information to process your transactions, manage your pixels on the canvas, provide customer support, and send transactional notifications.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">3. Data Sharing</h2>
          <p className="mb-4">
            We do not sell or rent your personal data to third parties. We share data only with trusted service providers necessary to operate our website, such as payment processors (Razorpay).
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">4. Cookies</h2>
          <p className="mb-4">
            We use cookies to maintain your session and improve your experience on our site.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">5. Your Rights</h2>
          <p className="mb-4">
            You may request to view, update, or delete your personal information by contacting our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
