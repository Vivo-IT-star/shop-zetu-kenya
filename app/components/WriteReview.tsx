import {useState} from 'react';

interface WriteReviewProps {
  productId?: number; // Shopify product ID
  firstImage?: string[]; // URL of the first product image
}

export default function WriteReview({productId, firstImage}: WriteReviewProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    rating: 5,
    title: "",
    body: "",
    picture_urls: [""]
  });

  function updateField(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({...form, [e.target.name]: e.target.value});
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      shop_domain: 'shop-zetu-kenya.myshopify.com',
      platform: 'shopify',
      id: productId,
      email: form.email,
      name: form.name,
      rating: Number(form.rating),
      title: form.title,
      body: form.body,
      picture_urls: firstImage
  
    };

    //console.log('Submitting review payload:', payload);

    try {
      const res = await fetch('/api/submit-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      //console.log('Judge.me submission response status:', res);

      if (!res.ok) {
        throw new Error('Failed to submit review');
      }

      setSubmitted(true);

      // Auto-close after 3 seconds
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='relative'>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-black px-6 py-3 text-white"
      >
        Write a Review
      </button>

      {/* Modal */}
      {open && (
        <div className="absolute lg:fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg  bg-white p-6">
            {!submitted ? (
              <>
                <h3 className="text-xl font-semibold mb-4">
                  Write a Review
                </h3>

                <form onSubmit={submitReview} className="space-y-4">
                  <input
                    name="name"
                    placeholder="Your name"
                    required
                    onChange={updateField}
                    className="w-full rounded border px-3 py-2"
                  />

                  <input
                    name="email"
                    type="email"
                    placeholder="Your email"
                    required
                    onChange={updateField}
                    className="w-full rounded border px-3 py-2"
                  />

                  <select
                    name="rating"
                    onChange={updateField}
                    className="w-full rounded border px-3 py-2"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r} Stars
                      </option>
                    ))}
                  </select>

                  <input
                    name="title"
                    placeholder="Review title"
                    onChange={updateField}
                    className="w-full rounded border px-3 py-2"
                  />

                  <textarea
                    name="body"
                    placeholder="Write your review"
                    required
                    rows={4}
                    onChange={updateField}
                    className="w-full rounded border px-3 py-2"
                  />

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="px-4 py-2"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded bg-black px-4 py-2 text-white"
                    >
                      {loading ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="py-12 text-center">
                <h4 className="text-2xl font-semibold mb-2">
                  Thank you!
                </h4>
                <p>Your review has been submitted.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
