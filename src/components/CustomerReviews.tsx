import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([
    { name: "Amit S.", review: "Absolutely stunning resort! The pool and ambiance were perfect. Will definitely come again.", stars: 5, date: "May 2025" },
    { name: "Priya D.", review: "The service was excellent and the location was breathtaking. Worth every penny!", stars: 5, date: "April 2025" },
    { name: "Rahul K.", review: "Loved the full-day experience. Great for families and group hangouts!", stars: 4, date: "March 2025" },
    { name: "Sneha T.", review: "Amazing hospitality and clean rooms. Totally relaxing.", stars: 5, date: "March 2025" },
    { name: "Vikas R.", review: "Pool could be cleaner, but overall good vibe and food.", stars: 3, date: "Feb 2025" },
    { name: "Kavita L.", review: "Charming place, peaceful and beautiful surroundings.", stars: 4, date: "Jan 2025" },
    { name: "Manoj P.", review: "Had a fantastic weekend getaway here with friends.", stars: 5, date: "Jan 2025" },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [newReview, setNewReview] = useState({ name: "", review: "", stars: 5 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.review) return;

    const currentDate = new Date().toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    const updated = [
      { ...newReview, date: currentDate },
      ...reviews,
    ];

    setReviews(updated);
    setCurrentIndex(0); // show the latest review first
    setNewReview({ name: "", review: "", stars: 5 });
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-white to-orange-50" id="reviews">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Guests Say</h2>
          <p className="text-gray-600 text-lg">Hear from the people who made memories at Madrass Villa</p>
        </motion.div>

        {/* Review Carousel */}
        <div className="relative">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-2xl shadow-xl border border-orange-100 text-center"
          >
            <div className="flex justify-center gap-1 mb-3">
              {Array(reviews[currentIndex].stars)
                .fill(0)
                .map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
            </div>
            <p className="text-gray-700 italic mb-3">"{reviews[currentIndex].review}"</p>
            <div className="text-sm text-gray-500">
              — {reviews[currentIndex].name}, {reviews[currentIndex].date}
            </div>
          </motion.div>

          {/* Arrow Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button onClick={goPrev} className="p-2 rounded-full bg-orange-100 hover:bg-orange-200">
              <ChevronLeft className="w-6 h-6 text-orange-600" />
            </button>
            <span className="text-gray-600 text-sm">
              {currentIndex + 1} / {reviews.length}
            </span>
            <button onClick={goNext} className="p-2 rounded-full bg-orange-100 hover:bg-orange-200">
              <ChevronRight className="w-6 h-6 text-orange-600" />
            </button>
          </div>
        </div>

        {/* Input Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white p-6 mt-14 rounded-2xl shadow-xl border border-orange-100 space-y-4"
        >
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">Add Your Review</h3>
          <Input
            type="text"
            placeholder="Your Name"
            value={newReview.name}
            onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
            required
          />
          <Textarea
            rows={3}
            placeholder="Write your review..."
            value={newReview.review}
            onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
            required
          />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                onClick={() => setNewReview({ ...newReview, stars: star })}
                className={`w-6 h-6 cursor-pointer ${
                  star <= newReview.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <Button type="submit" className="bg-orange-500 text-white hover:bg-orange-600">
            Submit Review
          </Button>
        </motion.form>
      </div>
    </section>
  );
};

export default CustomerReviews;
