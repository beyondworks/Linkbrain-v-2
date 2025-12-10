/**
 * Admin Authentication Utility
 * 
 * Checks if a user has admin privileges for accessing
 * restricted features like Insights and Articles pages.
 */

interface User {
    email?: string | null;
    uid?: string;
}

// Admin email addresses
const ADMIN_EMAILS = [
    'beyondworks.br@gmail.com'
];

/**
 * Check if the given user is an admin
 * @param user - Firebase user object
 * @returns true if user is admin, false otherwise
 */
export const isAdmin = (user: User | null | undefined): boolean => {
    if (!user || !user.email) {
        return false;
    }

    return ADMIN_EMAILS.includes(user.email.toLowerCase());
};

/**
 * Check if admin features should be visible
 * @param user - Firebase user object
 * @returns true if admin features should be shown
 */
export const shouldShowAdminFeatures = (user: User | null | undefined): boolean => {
    return isAdmin(user);
};
