export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Cancellation and Refund Policy</h1>
        <div className="prose prose-indigo max-w-none">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">No Refunds</h2>
          <p className="mb-4">
            Due to the nature of digital real estate on our canvas, all pixel purchases are considered final. Once pixels are purchased and your image is displayed, we cannot offer a refund or cancellation of the order.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Exceptions</h2>
          <p className="mb-4">
            Refunds will only be considered in the case of a verified technical error on our platform that prevented your pixels from being appropriately allocated or displayed, provided you report the issue within 7 days of the transaction.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Content Removal</h2>
          <p className="mb-4">
            If your uploaded content is removed by our administration for violating our Terms and Conditions (e.g., illegal or offensive content), you will not be eligible for a refund.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Contact Us</h2>
          <p className="mb-4">
            If you experience technical issues with your purchase, please contact our support team immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
