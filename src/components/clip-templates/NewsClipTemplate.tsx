import React from 'react';
import { Calendar, User, Share2, BookmarkPlus } from 'lucide-react';
import { Badge } from '../ui/badge';

interface NewsClipTemplateProps {
    clip: any;
}

export const NewsClipTemplate: React.FC<NewsClipTemplateProps> = ({ clip }) => {
    const publishDate = clip.publishDate ? new Date(clip.publishDate) : new Date();

    return (
        <div className="w-full bg-white rounded-2xl overflow-hidden">
            {/* Article Header Background */}
            {clip.image && (
                <div className="relative h-80 overflow-hidden bg-gray-900">
                    <img
                        src={clip.image}
                        alt={clip.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/10" />
                </div>
            )}

            <article className="p-8 md:p-12">
                {/* Meta Information */}
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
                        {clip.type === 'article' ? 'Article' : 'News'}
                    </Badge>
                    {clip.sentiment && (
                        <Badge
                            className={`px-3 py-1 ${
                                clip.sentiment === 'positive'
                                    ? 'bg-green-100 text-green-700'
                                    : clip.sentiment === 'negative'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            {clip.sentiment.charAt(0).toUpperCase() + clip.sentiment.slice(1)}
                        </Badge>
                    )}
                </div>

                {/* Main Title */}
                <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    {clip.title}
                </h1>

                {/* Author & Publication Info */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 pb-8 border-b border-gray-200">
                    {clip.author && (
                        <div className="flex items-center gap-3">
                            {clip.authorProfile?.avatar && (
                                <img
                                    src={clip.authorProfile.avatar}
                                    alt={clip.author}
                                    className="w-12 h-12 rounded-full"
                                />
                            )}
                            <div>
                                <p className="flex items-center gap-2 font-semibold text-gray-900">
                                    <User className="w-4 h-4" />
                                    {clip.author}
                                </p>
                                {clip.publishDate && (
                                    <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                        <Calendar className="w-4 h-4" />
                                        {publishDate.toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary/Excerpt */}
                {clip.summary && (
                    <p className="text-xl text-gray-700 mb-8 italic leading-relaxed border-l-4 border-blue-500 pl-6">
                        "{clip.summary}"
                    </p>
                )}

                {/* Keywords/Topics */}
                {clip.keywords && clip.keywords.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold uppercase text-gray-600 tracking-wide mb-3">
                            Topics Covered
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {clip.keywords.map((keyword: string, idx: number) => (
                                <a
                                    key={idx}
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                                >
                                    #{keyword}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Engagement Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-y border-gray-200">
                    {clip.engagement?.views && (
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {clip.engagement.views}
                            </div>
                            <p className="text-sm text-gray-600">Views</p>
                        </div>
                    )}
                    {clip.engagement?.likes && (
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {clip.engagement.likes}
                            </div>
                            <p className="text-sm text-gray-600">Recommendations</p>
                        </div>
                    )}
                    {clip.engagement?.comments && (
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {clip.engagement.comments}
                            </div>
                            <p className="text-sm text-gray-600">Comments</p>
                        </div>
                    )}
                </div>

                {/* Media Gallery */}
                {clip.mediaItems && clip.mediaItems.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Related Images
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {clip.mediaItems.slice(0, 6).map((item: any, idx: number) => (
                                typeof item === 'string' && (
                                    <img
                                        key={idx}
                                        src={item}
                                        alt={`article-image-${idx}`}
                                        className="rounded-lg object-cover h-40 w-full hover:opacity-75 transition-opacity"
                                    />
                                )
                            ))}
                        </div>
                    </div>
                )}

                {/* Comments Section */}
                {clip.comments && clip.comments.length > 0 && (
                    <div className="mb-8 py-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Comments ({clip.comments.length})
                        </h3>
                        <div className="space-y-4">
                            {clip.comments.slice(0, 3).map((comment: any, idx: number) => (
                                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                                    <p className="font-semibold text-gray-900">{comment.author}</p>
                                    <p className="text-gray-700 mt-1">{comment.text}</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {comment.postedAt} {comment.likes && `• ${comment.likes} likes`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <a
                        href={clip.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold"
                    >
                        Read Full Article
                    </a>
                    <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold flex items-center gap-2">
                        <BookmarkPlus className="w-5 h-5" />
                        Save
                    </button>
                </div>
            </article>
        </div>
    );
};
