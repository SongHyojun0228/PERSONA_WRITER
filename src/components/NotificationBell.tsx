import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { BellIcon } from './Icons';
import { NotificationDropdown, type Notification } from './NotificationDropdown';

export const NotificationBell = () => {
    const { session } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => { // Wrap fetchNotifications in useCallback
        if (!session) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch notifications');
            const data: Notification[] = await response.json();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error(error);
        }
    }, [session]); // Dependency for useCallback


    const markAllAsReadLogic = useCallback(async () => {
        if (!session || unreadCount === 0) return;

        // Optimistically update the UI
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({...n, is_read: true})));

        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/mark-all-as-read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });
        } catch (error) {
            console.error("Failed to mark notifications as read", error);
            // If the API call fails, revert the optimistic update
            fetchNotifications(); // Re-fetch to get actual state
        }
    }, [session, unreadCount, fetchNotifications]); // Dependencies for useCallback


    useEffect(() => {
        if (session) {
            fetchNotifications();
            // Poll for new notifications every minute
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [session, fetchNotifications]); // Add fetchNotifications to dependencies
    
    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                if (isOpen) {
                    handleClose();
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);


    const handleClose = async () => {
        setIsOpen(false);
        await markAllAsReadLogic(); // Call the shared logic
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsReadLogic();
        setIsOpen(false); // Close dropdown after marking all as read
    };

    if (!session) {
        return null; // Don't show the bell if not logged in
    }

    return (
        <div ref={wrapperRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="relative p-2 rounded-full text-ink dark:text-pale-lavender hover:bg-ink/10 dark:hover:bg-pale-lavender/10"
            >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-4 w-4 text-[10px] rounded-full bg-red-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <NotificationDropdown 
                    notifications={notifications} 
                    onClose={handleClose} 
                    onMarkAllAsRead={handleMarkAllAsRead} // Pass the new handler
                />
            )}
        </div>
    );
};
