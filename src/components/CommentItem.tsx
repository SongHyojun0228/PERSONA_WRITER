import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { useAuth } from '../context/AuthContext';

interface Profile {
    id: string;
    username: string;
}

export interface Comment {
    id: string;
    user_id: string | null;
    parent_comment_id: string | null;
    content: string;
    created_at: string;
    profiles: Profile;
    children: Comment[];
    is_anonymous: boolean; // Add is_anonymous field
}

interface CommentItemProps {
    comment: Comment;
    storyId: string;
    onCommentPosted: (newComment: Comment) => void;
    onCommentUpdated: (updatedComment: Comment) => void;
    onCommentDeleted: (commentId: string) => void;
    depth: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    storyId,
    onCommentPosted,
    onCommentUpdated,
    onCommentDeleted,
    depth,
}) => {
    const { session, user } = useAuth();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const [posting, setPosting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isAuthor = user && user.id === comment.user_id;

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [replyContent, editedContent]);

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session || !replyContent.trim()) {
            if(!session) alert('로그인이 필요합니다.');
            return;
        }

        try {
            setPosting(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/published-stories/${storyId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    content: replyContent,
                    parent_comment_id: comment.id,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to post reply');
            }

            const postedReply = await response.json();
            onCommentPosted(postedReply);
            setReplyContent('');
            setShowReplyForm(false);
        } catch (error) {
            console.error(error);
            alert('답글 작성에 실패했습니다.');
        } finally {
            setPosting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session || !editedContent.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }
        if (!isAuthor) {
            alert('수정 권한이 없습니다.');
            return;
        }

        try {
            setPosting(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/comments/${comment.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ content: editedContent }),
            });

            if (!response.ok) {
                throw new Error('Failed to update comment');
            }

            const updatedComment = await response.json();
            onCommentUpdated(updatedComment);
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            alert('댓글 수정에 실패했습니다.');
        } finally {
            setPosting(false);
        }
    };

    const handleDeleteClick = async () => {
        if (!session || !isAuthor) {
            alert('삭제 권한이 없습니다.');
            return;
        }
        if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/comments/${comment.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to delete comment');
                }

                onCommentDeleted(comment.id);
            } catch (error) {
                console.error(error);
                alert('댓글 삭제에 실패했습니다.');
            }
        }
    };

    const renderCommentContent = () => {
        if (isEditing) {
            return (
                <form onSubmit={handleEditSubmit} className="mt-1">
                    <textarea
                        ref={textareaRef}
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-paper dark:bg-forest-sub border-ink/20 dark:border-pale-lavender/20 focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent focus:outline-none resize-none"
                        disabled={posting}
                    />
                    <div className="flex space-x-2 mt-2">
                        <button
                            type="submit"
                            disabled={posting || !editedContent.trim()}
                            className="px-4 py-1 text-sm bg-primary-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed"
                        >
                            {posting ? '저장 중...' : '수정 완료'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsEditing(false); setEditedContent(comment.content); }}
                            className="px-4 py-1 text-sm bg-gray-300 dark:bg-forest-sub text-ink dark:text-pale-lavender font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-forest-light transition-colors"
                        >
                            취소
                        </button>
                    </div>
                </form>
            );
        }
        return <p className="mt-1">{comment.content}</p>;
    };

    const anonymousDisplayName = comment.is_anonymous ? '익명' : comment.profiles.username;

    return (
        <div className={`flex items-start space-x-4 ${depth > 0 ? 'ml-8 mt-4' : ''}`}>
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-300 dark:bg-forest-sub flex items-center justify-center font-bold text-ink dark:text-pale-lavender">
                {anonymousDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
                <div className="flex items-center space-x-2">
                    {comment.is_anonymous || !comment.user_id ? (
                        <span className="font-bold">{anonymousDisplayName}</span>
                    ) : (
                        <Link to={`/users/${comment.user_id}`} className="font-bold hover:underline">
                            {anonymousDisplayName}
                        </Link>
                    )}
                    <span className="text-xs text-ink/60 dark:text-pale-lavender/60">
                        {new Date(comment.created_at).toLocaleString()}
                    </span>
                </div>
                {renderCommentContent()}
                <div className="flex space-x-4 mt-2 text-sm">
                    {session && ( // Only show reply button if logged in
                        <button
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            className="text-primary-accent dark:text-dark-accent hover:underline"
                        >
                            답글
                        </button>
                    )}
                    {isAuthor && (
                        <>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="text-blue-500 hover:underline"
                            >
                                수정
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                className="text-red-500 hover:underline"
                            >
                                삭제
                            </button>
                        </>
                    )}
                </div>

                {showReplyForm && session && (
                    <form onSubmit={handleReplySubmit} className="mt-4">
                        <textarea
                            ref={textareaRef}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`${anonymousDisplayName}님에게 답글 달기...`}
                            className="w-full p-2 border rounded-lg bg-paper dark:bg-forest-sub border-ink/20 dark:border-pale-lavender/20 focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent focus:outline-none resize-none"
                            disabled={posting}
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                            <button
                                type="submit"
                                disabled={posting || !replyContent.trim()}
                                className="px-4 py-1 text-sm bg-primary-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed"
                            >
                                {posting ? '작성 중...' : '답글 작성'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowReplyForm(false)}
                                className="px-4 py-1 text-sm bg-gray-300 dark:bg-forest-sub text-ink dark:text-pale-lavender font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-forest-light transition-colors"
                            >
                                취소
                            </button>
                        </div>
                    </form>
                )}

                {comment.children && comment.children.length > 0 && (
                    <div className="border-l-2 border-gray-200 dark:border-forest-sub-light pl-4 mt-4">
                        {comment.children.map((childComment) => (
                            <CommentItem
                                key={childComment.id}
                                comment={childComment}
                                storyId={storyId}
                                onCommentPosted={onCommentPosted}
                                onCommentUpdated={onCommentUpdated}
                                onCommentDeleted={onCommentDeleted}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem;
