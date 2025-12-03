import React from 'react';
import { AIClipTemplate } from './AIClipTemplate';
import { DesignClipTemplate } from './DesignClipTemplate';
import { NewsClipTemplate } from './NewsClipTemplate';
import { DefaultClipTemplate } from './DefaultClipTemplate';

/**
 * Smart template router that selects the appropriate clip display component
 * based on category, content type, and platform
 */
interface ClipTemplateRouterProps {
    clip: any;
}

export const ClipTemplateRouter: React.FC<ClipTemplateRouterProps> = ({ clip }) => {
    // Determine which template to use based on category
    const selectTemplate = () => {
        const category = clip.category?.toLowerCase() || 'other';
        const type = clip.type?.toLowerCase() || 'website';
        const template = clip.template?.toLowerCase() || 'web';

        console.log(`Routing clip: category=${category}, type=${type}, template=${template}`);

        // Primary categorization by category field
        switch (category) {
            case 'ai':
            case 'coding':
            case 'it':
                return 'ai';

            case 'design':
            case 'marketing':
                return 'design';

            case 'news':
            case 'article':
            case 'blog':
                return 'news';

            // Fallback to platform-based routing if category is generic
            case 'other':
            case 'website':
                if (template === 'youtube' || template === 'video') return 'default';
                if (template === 'instagram' || type === 'image') return 'design';
                if (type === 'article') return 'news';
                return 'default';

            // Shopping, Business, etc. use default template
            default:
                return 'default';
        }
    };

    const templateType = selectTemplate();

    // Render the appropriate template component
    switch (templateType) {
        case 'ai':
            return <AIClipTemplate clip={clip} />;

        case 'design':
            return <DesignClipTemplate clip={clip} />;

        case 'news':
            return <NewsClipTemplate clip={clip} />;

        case 'default':
        default:
            return <DefaultClipTemplate clip={clip} />;
    }
};

export default ClipTemplateRouter;
