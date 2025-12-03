import React from 'react';
import { Code2, Lightbulb, GitBranch } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

interface AIClipTemplateProps {
    clip: any;
}

export const AIClipTemplate: React.FC<AIClipTemplateProps> = ({ clip }) => {
    return (
        <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden">
            {/* Hero Section */}
            {clip.image && (
                <div className="relative h-64 overflow-hidden bg-gradient-to-b from-blue-600 to-blue-800">
                    <img
                        src={clip.image}
                        alt={clip.title}
                        className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                </div>
            )}

            <div className="p-8">
                {/* Title & Author */}
                <div className="mb-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-2">{clip.title}</h1>
                            {clip.author && (
                                <div className="flex items-center gap-2">
                                    {clip.authorProfile?.avatar && (
                                        <img
                                            src={clip.authorProfile.avatar}
                                            alt={clip.author}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    )}
                                    <span className="text-blue-300 font-medium">{clip.author}</span>
                                </div>
                            )}
                        </div>
                        <Badge className="bg-blue-600 text-white px-3 py-1">AI</Badge>
                    </div>
                </div>

                {/* Summary */}
                {clip.summary && (
                    <div className="mb-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700/50">
                        <div className="flex items-start gap-2">
                            <Lightbulb className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                            <p className="text-gray-200 leading-relaxed">{clip.summary}</p>
                        </div>
                    </div>
                )}

                {/* Key Insights */}
                {clip.keywords && clip.keywords.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-blue-400" />
                            Key Concepts
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {clip.keywords.map((keyword: string, idx: number) => (
                                <Badge
                                    key={idx}
                                    className="bg-blue-700/50 text-blue-100 border border-blue-600 px-3 py-1"
                                >
                                    {keyword}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Engagement Stats */}
                {clip.engagement && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {clip.engagement.views && (
                            <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-700/50">
                                <div className="text-xs text-blue-300 uppercase tracking-wide">Views</div>
                                <div className="text-xl font-bold text-white">{clip.engagement.views}</div>
                            </div>
                        )}
                        {clip.engagement.likes && (
                            <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-700/50">
                                <div className="text-xs text-blue-300 uppercase tracking-wide">Likes</div>
                                <div className="text-xl font-bold text-white">{clip.engagement.likes}</div>
                            </div>
                        )}
                        {clip.engagement.comments && (
                            <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-700/50">
                                <div className="text-xs text-blue-300 uppercase tracking-wide">Comments</div>
                                <div className="text-xl font-bold text-white">{clip.engagement.comments}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Media Items */}
                {clip.mediaItems && clip.mediaItems.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <GitBranch className="w-5 h-5 text-blue-400" />
                            Resources
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {clip.mediaItems.slice(0, 4).map((item: any, idx: number) => (
                                <div key={idx} className="bg-blue-900/20 rounded-lg overflow-hidden border border-blue-700/30">
                                    {typeof item === 'string' ? (
                                        <img
                                            src={item}
                                            alt={`resource-${idx}`}
                                            className="w-full h-32 object-cover"
                                        />
                                    ) : item.videoId ? (
                                        <div className="w-full h-32 bg-black flex items-center justify-center">
                                            <span className="text-blue-400 text-sm">Video: {item.videoId}</span>
                                        </div>
                                    ) : (
                                        <div className="w-full h-32 bg-blue-900/30 flex items-center justify-center">
                                            <span className="text-blue-300 text-sm">Resource {idx + 1}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Source Link */}
                <a
                    href={clip.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                    View Original →
                </a>
            </div>
        </div>
    );
};
