import React, { useState } from 'react';
import { ExternalLink, Share2, Heart, MessageCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

interface DefaultClipTemplateProps {
    clip: any;
}

export const DefaultClipTemplate: React.FC<DefaultClipTemplateProps> = ({ clip }) => {
    const [liked, setLiked] = useState(false);
    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            ai: 'bg-blue-100 text-blue-700 border-blue-300',
            design: 'bg-purple-100 text-purple-700 border-purple-300',
            marketing: 'bg-pink-100 text-pink-700 border-pink-300',
            business: 'bg-amber-100 text-amber-700 border-amber-300',
            coding: 'bg-green-100 text-green-700 border-green-300',
            it: 'bg-indigo-100 text-indigo-700 border-indigo-300',
            shopping: 'bg-orange-100 text-orange-700 border-orange-300',
            news: 'bg-red-100 text-red-700 border-red-300',
        };
        return colors[category?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    return (
        <div className="w-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            {/* Image Container */}
            <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {clip.image ? (
                    <>
                        <img
                            src={clip.image}
                            alt={clip.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-5xl mb-2">📄</div>
                            <p className="text-gray-600 text-sm">No preview available</p>
                        </div>
                    </div>
                )}

                {/* Platform Badge Overlay */}
                <div className="absolute top-4 right-4">
                    <Badge className={`border ${getCategoryColor(clip.category)}`}>
                        {clip.platform?.toUpperCase() || 'Web'}
                    </Badge>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Category Tags */}
                <div className="flex gap-2 mb-3">
                    <Badge className={`border ${getCategoryColor(clip.category)}`}>
                        {clip.category || 'Other'}
                    </Badge>
                    {clip.sentiment && (
                        <Badge
                            className={`px-2 py-1 text-xs ${
                                clip.sentiment === 'positive'
                                    ? 'bg-green-100 text-green-700'
                                    : clip.sentiment === 'negative'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            {clip.sentiment}
                        </Badge>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 max-h-[3rem] overflow-hidden break-words hover:text-gray-700 transition-colors">
                    {clip.title}
                </h3>

                {/* Summary */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {clip.summary || 'No summary available'}
                </p>

                {/* Author Info */}
                {clip.author && (
                    <div className="flex items-center gap-2 mb-4 text-sm">
                        {clip.authorProfile?.avatar && (
                            <img
                                src={clip.authorProfile.avatar}
                                alt={clip.author}
                                className="w-6 h-6 rounded-full"
                            />
                        )}
                        <span className="text-gray-700 font-medium truncate">{clip.author}</span>
                    </div>
                )}

                {/* Keywords */}
                {clip.keywords && clip.keywords.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            {clip.keywords.slice(0, 3).map((keyword: string, idx: number) => (
                                <span
                                    key={idx}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                                >
                                    {keyword}
                                </span>
                            ))}
                            {clip.keywords.length > 3 && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                    +{clip.keywords.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Engagement Metrics */}
                {clip.engagement && (clip.engagement.views || clip.engagement.likes || clip.engagement.comments) && (
                    <div className="flex gap-4 mb-4 py-3 border-t border-b border-gray-200 text-xs text-gray-600">
                        {clip.engagement.views && (
                            <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{clip.engagement.views}</span>
                            </div>
                        )}
                        {clip.engagement.likes && (
                            <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                <span>{clip.engagement.likes}</span>
                            </div>
                        )}
                        {clip.engagement.comments && (
                            <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{clip.engagement.comments}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <a
                        href={clip.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Open
                    </a>
                    <button
                        onClick={() => setLiked(!liked)}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium border ${
                            liked
                                ? 'bg-red-50 border-red-300 text-red-600'
                                : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                    </button>
                    <button className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper component reference
const Eye = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
