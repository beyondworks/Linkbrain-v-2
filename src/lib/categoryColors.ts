export const getCategoryColor = (category: string) => {
    const normalized = category?.toLowerCase().trim();

    // Notion-style soft pastel colors matching the reference image
    const colors = {
        gray: { bg: 'bg-[#E8E8E8]', text: 'text-[#5A5A5A]' },      // Soft gray
        brown: { bg: 'bg-[#E0D5CA]', text: 'text-[#6B5A47]' },     // Warm beige
        orange: { bg: 'bg-[#FCDDC4]', text: 'text-[#C77844]' },    // Soft coral/orange
        yellow: { bg: 'bg-[#F9EAC8]', text: 'text-[#B08B3A]' },    // Soft yellow
        green: { bg: 'bg-[#D4E9D4]', text: 'text-[#5B8C5B]' },     // Soft mint green
        blue: { bg: 'bg-[#D1E7F0]', text: 'text-[#5B8DAF]' },      // Soft sky blue
        purple: { bg: 'bg-[#E3D9EC]', text: 'text-[#8B6B9E]' },    // Soft lavender
        pink: { bg: 'bg-[#F4D9E2]', text: 'text-[#B8698D]' },      // Soft rose pink
        red: { bg: 'bg-[#FADBD8]', text: 'text-[#C75F5A]' },       // Soft red/salmon
    };

    switch (normalized) {
        case 'all':
            return colors.gray;
        case 'ai':
            return colors.blue; // or purple
        case 'design':
            return colors.green; // or pink
        case 'marketing':
            return colors.orange;
        case 'business':
            return colors.purple;
        case 'it':
            return colors.brown;
        case 'coding':
            return colors.yellow; // or gray
        case 'shopping':
            return colors.pink;
        case 'news':
            return colors.red;
        default:
            // Hash-based fallback
            const palette = Object.values(colors);
            let hash = 0;
            for (let i = 0; i < normalized.length; i++) {
                hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
            }
            const index = Math.abs(hash) % palette.length;
            return palette[index];
    }
};
