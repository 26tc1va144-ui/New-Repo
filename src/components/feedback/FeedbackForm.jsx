import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Star,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Store,
  Clock,
  ThumbsUp,
  Heart
} from 'lucide-react';

/**
 * Interactive Star Rating Selector
 */
function StarRatingInput({ label, value, onChange, disabled = false, icon = null }) {
  const [hoverValue, setHoverValue] = useState(0);

  const getRatingLabel = (val) => {
    switch (val) {
      case 5: return 'Excellent';
      case 4: return 'Very Good';
      case 3: return 'Good';
      case 2: return 'Fair';
      case 1: return 'Poor';
      default: return 'Select rating';
    }
  };

  const activeScore = hoverValue || value;

  return (
    <div className="space-y-1.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
        </span>
        <span className={`text-[11px] font-bold ${
          activeScore >= 4 ? 'text-emerald-700' : activeScore >= 3 ? 'text-amber-600' : activeScore > 0 ? 'text-rose-600' : 'text-slate-400'
        }`}>
          {getRatingLabel(activeScore)} {activeScore > 0 && `(${activeScore}/5)`}
        </span>
      </div>

      <div className="flex items-center gap-1.5 pt-0.5" role="group" aria-label={`Rate ${label}`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = (hoverValue || value) >= star;
          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onClick={() => onChange(star)}
              onMouseEnter={() => !disabled && setHoverValue(star)}
              onMouseLeave={() => !disabled && setHoverValue(0)}
              className={`p-1 rounded-lg transition-transform active:scale-90 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                disabled ? 'cursor-default' : 'hover:scale-110 cursor-pointer'
              }`}
              title={`${star} star${star > 1 ? 's' : ''} - ${getRatingLabel(star)}`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                    : 'text-slate-200 hover:text-amber-200'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FeedbackForm({ order, onFeedbackSubmitted }) {
  const { currentUser, submitFeedback, getFeedbackByOrder, addToast } = useApp();

  const [foodQuality, setFoodQuality] = useState(5);
  const [pickupExperience, setPickupExperience] = useState(5);
  const [valueForMoney, setValueForMoney] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState(null);

  const isCompleted = order?.status === 'Completed' || order?.status === 'Picked Up' || order?.status === 'Collected';

  // Check if feedback already exists for this order
  useEffect(() => {
    if (!order?.id) return;
    const existing = getFeedbackByOrder(order.id);
    if (existing) {
      setSubmittedFeedback(existing);
    }
  }, [order?.id, getFeedbackByOrder]);

  const overallRating = Number(((foodQuality + pickupExperience + valueForMoney) / 3).toFixed(1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!isCompleted) {
      setErrorMessage('Feedback can only be submitted after your order has been picked up & verified in store.');
      return;
    }

    if (!foodQuality || !pickupExperience || !valueForMoney) {
      setErrorMessage('Please select a 1–5 star rating for Food Quality, Pickup Experience, and Value for Money.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        orderId: order.id,
        ratings: {
          foodQuality,
          pickupExperience,
          valueForMoney
        },
        comment: comment.trim(),
        userId: currentUser?.id || order.buyerId || 'usr-buyer-demo',
        userName: currentUser?.name || order.buyerName || 'Rahul Sharma',
        userAvatar: currentUser?.avatar || 'RS'
      };

      const result = await submitFeedback(payload);

      if (result && result.success) {
        setSubmittedFeedback(result.feedback);
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted(result.feedback);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Could not submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Case 1: Order is not yet picked up / completed
  if (!isCompleted && !submittedFeedback) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-5 text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Star className="w-5 h-5 text-slate-400" />
        </div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Experience Feedback
        </h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Feedback unlocks after store staff verifies your OTP and completes the food handover.
        </p>
      </div>
    );
  }

  // Case 2: Feedback already submitted (Prevent duplicate feedback)
  if (submittedFeedback) {
    return (
      <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 border border-emerald-200 rounded-3xl p-6 shadow-soft space-y-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Rescuer Review</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Thank you for your feedback!
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{submittedFeedback.overallRating?.toFixed(1) || '5.0'}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Your feedback helps <strong>{submittedFeedback.sellerName || order.sellerName}</strong> improve their food rescue quality and inspires neighbors to fight food waste.
        </p>

        {/* Breakdown Badges */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-white/80 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Food Quality</span>
            <span className="text-xs font-extrabold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {submittedFeedback.ratings?.foodQuality || 5}/5
            </span>
          </div>
          <div className="bg-white/80 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Pickup</span>
            <span className="text-xs font-extrabold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {submittedFeedback.ratings?.pickupExperience || 5}/5
            </span>
          </div>
          <div className="bg-white/80 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Value</span>
            <span className="text-xs font-extrabold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {submittedFeedback.ratings?.valueForMoney || 5}/5
            </span>
          </div>
        </div>

        {submittedFeedback.comment && (
          <div className="p-3 bg-white rounded-2xl border border-slate-100 text-xs text-slate-700 italic flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>"{submittedFeedback.comment}"</span>
          </div>
        )}

        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 font-mono">
          <span>Order #{order.id}</span>
          <span>Submitted {new Date(submittedFeedback.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    );
  }

  // Case 3: Completed order ready for submission
  return (
    <div className="bg-white border border-emerald-200/80 rounded-3xl p-5 sm:p-6 shadow-soft space-y-5 text-left relative overflow-hidden">
      {/* Decorative gradient top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Order Completed · Rate Your Pickup</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
            How was your ResQFood experience?
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Rate your verified rescue from <strong className="text-slate-800">{order.seller || order.sellerName}</strong> ({order.title || order.foodItem})
          </p>
        </div>

        {/* Live Overall Rating Badge */}
        <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs shrink-0">
          <div className="flex items-center gap-1 text-amber-700 font-black text-base">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{overallRating.toFixed(1)}</span>
          </div>
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-tight">Overall</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 3 Rating Selectors: Food Quality, Pickup Experience, Value for Money */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StarRatingInput
            label="Food Quality"
            icon={<span className="text-sm">🍲</span>}
            value={foodQuality}
            onChange={setFoodQuality}
            disabled={isSubmitting}
          />

          <StarRatingInput
            label="Pickup Experience"
            icon={<span className="text-sm">⏱️</span>}
            value={pickupExperience}
            onChange={setPickupExperience}
            disabled={isSubmitting}
          />

          <StarRatingInput
            label="Value for Money"
            icon={<span className="text-sm">💰</span>}
            value={valueForMoney}
            onChange={setValueForMoney}
            disabled={isSubmitting}
          />
        </div>

        {/* Optional Written Comment */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Comment (Optional)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Help your neighbors with food details
            </span>
          </label>
          <textarea
            rows="3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
            placeholder="Write your feedback... How was the taste, packaging, hygiene and counter handover?"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
            maxLength={500}
          />
          <div className="flex justify-between items-center text-[10px] text-slate-400 px-1">
            <span>Minimum 1-star required on all 3 metrics</span>
            <span>{comment.length}/500</span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Action */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified buyer review stored in database</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold shadow-soft transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting Feedback...</span>
              </>
            ) : (
              <>
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
