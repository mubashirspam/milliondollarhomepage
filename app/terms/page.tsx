export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
        <div className="prose prose-indigo max-w-none">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. Agreement to Terms</h2>
          <p className="mb-4">
            By accessing or using our website, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please do not use our services.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">2. Pixel Purchases</h2>
          <p className="mb-4">
            When you purchase pixels, you are buying the right to display an image and a link on those specific coordinates.
            All purchases are final and subject to our content guidelines.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">3. Content Guidelines</h2>
          <p className="mb-4">
            You agree not to upload any content that is illegal, offensive, discriminatory, or infringes on third-party intellectual property rights.
            We reserve the right to remove non-compliant content without a refund.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">4. Intellectual Property</h2>
          <p className="mb-4">
            The website and its original content are owned by us. The content you upload remains yours, but you grant us a worldwide license to display it.
          </p>
        </div>
      </div>
    </div>
  );
}
