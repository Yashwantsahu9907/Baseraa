import React, { useState, useEffect, useContext } from 'react';
import { Star, MessageSquare, Send, Trash2, Edit3, X, Filter } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const ReviewSection = ({ listingId, listingType, initialAverage, initialCount, onReviewAdded }) => {
    const { user, api } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [editingReview, setEditingReview] = useState(null);

    const fetchReviews = async () => {
        try {
            setFetchLoading(true);
            const res = await api.get(`/reviews/${listingType}/${listingId}?sort=${sortBy}`);
            setReviews(res.data);
        } catch (error) {
            console.error('Fetch Reviews Error:', error);
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [listingId, sortBy]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return toast.warning('Please select a star rating');
        if (!reviewText.trim()) return toast.warning('Please write a review text');

        setLoading(true);
        try {
            if (editingReview) {
                await api.put(`/reviews/${editingReview._id}`, { rating, reviewText });
                toast.success('Review updated successfully');
            } else {
                await api.post(`/reviews/${listingType}/${listingId}`, { rating, reviewText });
                toast.success('Review submitted successfully');
            }
            setRating(0);
            setReviewText('');
            setEditingReview(null);
            fetchReviews();
            if (onReviewAdded) onReviewAdded();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error processing review');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await api.delete(`/reviews/${reviewId}`);
            toast.success('Review deleted');
            fetchReviews();
            if (onReviewAdded) onReviewAdded();
        } catch (error) {
            toast.error('Error deleting review');
        }
    };

    const startEditing = (review) => {
        setEditingReview(review);
        setRating(review.rating);
        setReviewText(review.reviewText);
        window.scrollTo({ top: document.getElementById('review-form').offsetTop - 100, behavior: 'smooth' });
    };

    const userReview = reviews.find(r => r.user?._id === user?._id);

    return (
        <div className="mt-12 mb-20">
            <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
                Reviews & Ratings
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Stats & Form Column */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Average Card */}
                    <div className="glass p-8 rounded-3xl border-2 border-slate-100/50 shadow-xl shadow-slate-200/40 text-center animate-fade-in">
                        <p className="text-slate-400 font-black uppercase text-xs tracking-widest mb-2">Average Rating</p>
                        <h3 className="text-6xl font-black text-slate-900 mb-2">{initialAverage?.toFixed(1) || '0.0'}</h3>
                        <div className="flex justify-center mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star} 
                                    className={`w-6 h-6 ${star <= Math.round(initialAverage || 0) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} 
                                />
                            ))}
                        </div>
                        <p className="text-slate-500 font-bold">Based on {initialCount || 0} reviews</p>
                    </div>

                    {/* Review Form */}
                    {user?.role === 'Student' && (
                        <div id="review-form" className="glass p-8 rounded-3xl border-2 border-primary-500/10 shadow-xl shadow-primary-500/5 animate-slide-up">
                            <h4 className="font-black text-slate-800 mb-6 flex items-center justify-between">
                                {editingReview ? 'Update Your Review' : 'Write a Review'}
                                {editingReview && (
                                    <button 
                                        onClick={() => {
                                            setEditingReview(null);
                                            setRating(0);
                                            setReviewText('');
                                        }}
                                        className="text-red-500 p-1 hover:bg-red-50 rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </h4>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Stars */}
                                <div className="space-y-2">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Your Rating</p>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHover(star)}
                                                onMouseLeave={() => setHover(0)}
                                                className="transition-transform active:scale-90"
                                            >
                                                <Star 
                                                    className={`w-8 h-8 transition-all ${
                                                        star <= (hover || rating) 
                                                            ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                                                            : 'text-slate-200'
                                                    }`} 
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Textarea */}
                                <div className="space-y-2">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Your Thoughts</p>
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Tell others about your experience..."
                                        className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm focus:border-primary-500 outline-none transition-all min-h-[120px]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || (userReview && !editingReview)}
                                    className="w-full bg-primary-600 text-white rounded-2xl py-4 font-black text-sm shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            {editingReview ? 'UPDATE REVIEW' : 'SUBMIT REVIEW'}
                                        </>
                                    )}
                                </button>
                                {userReview && !editingReview && (
                                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tighter">You have already reviewed this listing</p>
                                )}
                            </form>
                        </div>
                    )}
                </div>

                {/* Reviews List Column */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative group">
                            <span className="flex items-center gap-2 text-sm font-black text-slate-600">
                                <Filter className="w-4 h-4" />
                                Sort By
                            </span>
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent font-black text-primary-600 text-sm outline-none cursor-pointer hover:underline underline-offset-4"
                            >
                                <option value="newest">Newest First</option>
                                <option value="highest">Highest Rated</option>
                                <option value="lowest">Lowest Rated</option>
                            </select>
                        </div>
                    </div>

                    {fetchLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="bg-slate-50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold">No reviews yet. Be the first to share your experience!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((rev) => (
                                <div key={rev._id} className="group glass p-6 rounded-3xl border border-slate-100 hover:border-primary-200 transition-all hover:shadow-xl hover:shadow-slate-200/40 animate-fade-in relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg overflow-hidden">
                                                {rev.user?.profileImage ? (
                                                    <img src={rev.user.profileImage} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    rev.user?.name?.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                    {rev.user?.name}
                                                    {rev.user?._id === user?._id && <span className="text-[8px] bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">You</span>}
                                                </h5>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    {format(new Date(rev.createdAt), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                                            <span className="text-xs font-black text-amber-600">{rev.rating}.0</span>
                                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                        </div>
                                    </div>

                                    <p className="text-slate-600 text-sm leading-relaxed pr-8">
                                        {rev.reviewText}
                                    </p>

                                    {rev.user?._id === user?._id && (
                                        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => startEditing(rev)}
                                                className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                                title="Edit Review"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(rev._id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Delete Review"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewSection;
