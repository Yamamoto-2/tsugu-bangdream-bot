/**
 * User Repository Interface
 * Abstract interface for user data access
 */

import { tsuguUser, userPlayerInList } from '@/types/User';

/**
 * User repository interface
 * Defines all user data access operations
 */
export interface IUserRepository {
    /**
     * Create a new user
     */
    createUser(platform: string, userId: string): Promise<tsuguUser>;

    /**
     * Get user by platform and userId
     */
    getUser(platform: string, userId: string): Promise<tsuguUser | null>;

    /**
     * Update user data (partial update)
     */
    updateUser(platform: string, userId: string, update: Partial<tsuguUser>): Promise<void>;

    /**
     * Update user player list (bind or unbind)
     */
    updateUserPlayerList(
        platform: string,
        userId: string,
        bindingAction: 'bind' | 'unbind',
        tsuguUserServer: userPlayerInList,
        verifyed: boolean
    ): Promise<{ status: string, data: string }>;

    /**
     * Delete user
     */
    deleteUser(platform: string, userId: string): Promise<void>;

    /**
     * Disconnect from database (cleanup)
     */
    disconnect(): Promise<void>;
}

