import React, { useState } from 'react';
import { Palette, Eye, Share2, Heart } from 'lucide-react';
import { Badge } from '../ui/badge';

interface DesignClipTemplateProps {
    clip: any;
}

export const DesignClipTemplate: React.FC<DesignClipTemplateProps> = ({ clip }) => {
    const [liked, setLiked] = useState(false);

    return (
        <div className="w-full bg-white rounded-2xl overflow-hidden shadow-xl">
            {/* Visual Showcase */}
            <div className="relative h-96 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
                {clip.image ? (
                    <>
                        <img
                            src={clip.image}
                            alt={clip.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-200 to-pink-200">
                        <Palette className="w-16 h-16 text-purple-400 opacity-50" />
                    </div>
                )}
            </div>

            <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{clip.title}</h1>
                        {clip.author && (
                            <div className="flex items-center gap-2">
                                {clip.authorProfile?.avatar && (
                                    <img
                                        src={clip.authorProfile.avatar}
                                        alt={clip.author}
                                        className="w-10 h-10 rounded-full ring-2 ring-purple-200"
                                    />
                                )}
                                <div>
                                    <p className="font-semibold text-gray-900">{clip.author}</p>
                                    {clip.publishDate && (
                                        <p className="text-sm text-gray-500">
                                            {new Date(clip.publishDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <Badge className="bg-purple-100 text-purple-700 px-3 py-1 font-semibold">
                        Design
                    </Badge>
                </div>

                {/* Summary */}
                {clip.summary && (
                    <p className="text-lg text-gray-700 mb-8 leading-relaxed border-l-4 border-purple-400 pl-4">
                        {clip.summary}
                    </p>
                )}

                {/* Design Elements */}
                {clip.keywords && clip.keywords.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Design Elements</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {clip.keywords.map((keyword: string, idx: number) => (
                                <div
                                    key={idx}
                                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200"
                                >
                                    <p className="text-sm font-medium text-gray-800">{keyword}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Visual Gallery */}
                {clip.mediaItems && clip.mediaItems.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-purple-600" />
                            Visual References
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {clip.mediaItems.slice(0, 6).map((item: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="group relative rounded-lg overflow-hidden bg-gray-200 aspect-square cursor-pointer hover:shadow-lg transition-all"
                                >
                                    {typeof item === 'string' ? (
                                        <img
                                            src={item}
                                            alt={`design-reference-${idx}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                                            <span className="text-gray-600 text-sm font-medium">
                                                Media {idx + 1}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Engagement & Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-6">
                        {clip.engagement?.likes && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Heart className="w-5 h-5" />
                                <span className="text-sm font-medium">{clip.engagement.likes}</span>
                            </div>
                        )}
                        {clip.engagement?.views && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Eye className="w-5 h-5" />
                                <span className="text-sm font-medium">{clip.engagement.views}</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setLiked(!liked)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors"
                    >
                        <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                        Save
                    </button>
                </div>

                {/* Source Link */}
                <a
                    href={clip.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-6 text-center py-3 rounded-lg border-2 border-purple-300 text-purple-700 font-semibold hover:bg-purple-50 transition-colors"
                >
                    View Full Design →
                </a>
            </div>
        </div>
    );
};
