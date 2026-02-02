import { Link } from 'react-router-dom';
import { BookOpenIcon, ChatBubbleLeftRightIcon, HeartIcon } from './Icons'; // Import new icons

// Base interface for all notifications
interface BaseNotification {
    id: string;
    is_read: boolean;
    created_at: string;
}

// Specific notification types
interface NewStoryNotification extends BaseNotification {
    type: 'new_story';
    data: {
        storyId: string;
        storyTitle: string;
        authorName: string;
    };
}

interface NewCommentNotification extends BaseNotification {
    type: 'new_comment';
    data: {
        storyId: string;
        storyTitle: string;
        commenterUsername: string;
    };
}

interface NewLikeNotification extends BaseNotification {
    type: 'new_like';
    data: {
        storyId: string;
        storyTitle: string;
        likerUsername: string;
    };
}

// Union type for any possible notification
export type Notification = NewStoryNotification | NewCommentNotification | NewLikeNotification;

interface NotificationDropdownProps {
    notifications: Notification[];
    onClose: () => void;
    onMarkAllAsRead: () => void; // New prop for marking all as read
}

const NotificationItem = ({ notification }: { notification: Notification }) => {
    
    const renderContent = () => {
        switch (notification.type) {
            case 'new_story':
                return {
                    icon: <BookOpenIcon className="w-5 h-5 text-primary-accent dark:text-dark-accent"/>,
                    text: (
                        <>
                            <span className="font-semibold">{notification.data.authorName}</span>님이 새 이야기를 발행했습니다.
                        </>
                    ),
                    title: notification.data.storyTitle
                };
            case 'new_comment':
                return {
                    icon: <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-500"/>,
                    text: (
                        <>
                            <span className="font-semibold">{notification.data.commenterUsername}</span>님이 회원님의 글에 댓글을 남겼습니다.
                        </>
                    ),
                    title: `RE: ${notification.data.storyTitle}`
                };
            case 'new_like':
                return {
                    icon: <HeartIcon className="w-5 h-5 text-red-500"/>,
                    text: (
                        <>
                            <span className="font-semibold">{notification.data.likerUsername}</span>님이 회원님의 글을 좋아합니다.
                        </>
                    ),
                    title: `👍 ${notification.data.storyTitle}`
                };
            default:
                // Fallback for unknown notification types
                const unknownNotif = notification as any;
                return {
                    icon: <BookOpenIcon className="w-5 h-5 text-gray-400"/>,
                    text: "새로운 알림이 있습니다.",
                    title: unknownNotif?.data?.storyTitle || ""
                };
        }
    };

    const { icon, text, title } = renderContent();
    const storyId = notification.data.storyId;

    return (
        <Link 
            to={`/story/${storyId}`}
            className={`block p-4 border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
        >
            <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                    {icon}
                </div>
                <div className="ml-3 w-0 flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        {text}
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white truncate">
                        {title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                    </p>
                </div>
            </div>
        </Link>
    );
};

export const NotificationDropdown = ({ notifications, onClose, onMarkAllAsRead }: NotificationDropdownProps) => {
    return (
        <div 
            className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
        >
            <div className="py-1">
                <div className="px-4 py-3 border-b dark:border-gray-700">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">알림</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map(n => <NotificationItem key={n.id} notification={n} />)
                    ) : (
                        <p className="text-center text-gray-500 py-8">새 알림이 없습니다.</p>
                    )}
                </div>
                <div className="px-4 py-2 border-t dark:border-gray-700 text-right flex justify-between items-center">
                    <button 
                        onClick={onMarkAllAsRead} 
                        className="text-sm text-primary-accent dark:text-dark-accent font-semibold hover:underline"
                    >
                        모두 읽음
                    </button>
                    <button onClick={onClose} className="text-sm text-primary-accent dark:text-dark-accent font-semibold">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};
