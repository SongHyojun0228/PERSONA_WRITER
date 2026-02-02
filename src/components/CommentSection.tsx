import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import CommentItem, { type Comment } from './CommentItem'; // Import CommentItem and its Comment interface

interface CommentSectionProps {
    storyId: string;
}

// Helper to build a hierarchical comment tree
const buildCommentTree = (flatComments: Comment[]): Comment[] => {
    const commentsById: Record<string, Comment> = {};
    const rootComments: Comment[] = [];

    // Initialize comments with children array
    flatComments.forEach(comment => {
        commentsById[comment.id] = { ...comment, children: [] };
    });

    // Populate children
    flatComments.forEach(comment => {
        if (comment.parent_comment_id && commentsById[comment.parent_comment_id]) {
            commentsById[comment.parent_comment_id].children.push(commentsById[comment.id]);
        } else {
            rootComments.push(commentsById[comment.id]);
        }
    });

    // Sort comments (and their children) by creation date
    const sortComments = (comments: Comment[]) => {
        comments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        comments.forEach(comment => {
            if (comment.children && comment.children.length > 0) {
                sortComments(comment.children);
            }
        });
    };

    sortComments(rootComments);
    return rootComments;
};

export const CommentSection = ({ storyId }: CommentSectionProps) => {
    const { session } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]); // This will now be the hierarchical structure
    const [flatComments, setFlatComments] = useState<Comment[]>([]); // Store flat list for easier manipulation
    const [newCommentContent, setNewCommentContent] = useState(''); // Renamed to avoid conflict
    const [isAnonymous, setIsAnonymous] = useState(false); // New state for anonymous comments
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const fetchAllComments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/published-stories/${storyId}/comments`);
            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }
            const data: Comment[] = await response.json();
            setFlatComments(data);
            setComments(buildCommentTree(data));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [storyId]);

    useEffect(() => {
        fetchAllComments();
    }, [fetchAllComments]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [newCommentContent]);

    // Handlers for CommentItem actions
    const handleCommentPosted = useCallback((postedComment: Comment) => {
        setFlatComments(prev => [...prev, postedComment]);
        // To correctly update the tree, we need to rebuild it with the new flat list
        // This is a common pattern when dealing with deeply nested immutable structures
        setComments(buildCommentTree([...flatComments, postedComment]));
    }, [flatComments]); // Dependency on flatComments to ensure fresh data for rebuild

    const handleCommentUpdated = useCallback((updatedComment: Comment) => {
        setFlatComments(prev =>
            prev.map(comment => (comment.id === updatedComment.id ? updatedComment : comment))
        );
        // Rebuild tree with updated comment
        setComments(buildCommentTree(
            flatComments.map(comment => (comment.id === updatedComment.id ? updatedComment : comment))
        ));
    }, [flatComments]); // Dependency on flatComments

    const handleCommentDeleted = useCallback((commentId: string) => {
        // Filter out the deleted comment and its direct replies
        const newFlatComments = flatComments.filter(
            comment => comment.id !== commentId && comment.parent_comment_id !== commentId
        );
        setFlatComments(newFlatComments);
        setComments(buildCommentTree(newFlatComments)); // Rebuild tree
    }, [flatComments]);


    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCommentContent.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }
        if (!session && !isAnonymous) {
            alert('로그인이 필요합니다. 또는 익명으로 작성해주세요.');
            return;
        }

        try {
            setPosting(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/published-stories/${storyId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': session ? `Bearer ${session.access_token}` : '', // Only send token if logged in
                },
                body: JSON.stringify({
                    content: newCommentContent,
                    is_anonymous: isAnonymous,
                    parent_comment_id: null, // Top-level comment
                }),
            });

            if (!response.ok) {
                // Attempt to parse error message from response body
                const errorData = await response.json().catch(() => ({ message: 'Failed to post comment' }));
                throw new Error(errorData.message || 'Failed to post comment');
            }

            const postedComment: Comment = await response.json();
            handleCommentPosted(postedComment); // Use the handler to update state
            setNewCommentContent('');
            setIsAnonymous(false); // Reset anonymous checkbox
        } catch (error: any) {
            console.error(error);
            alert(`댓글 작성에 실패했습니다: ${error.message}`);
        } finally {
            setPosting(false);
        }
    };

    const totalCommentCount = flatComments.length; // Use flatComments for total count

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">댓글 ({totalCommentCount})</h2>
            <div className="space-y-6">
                {loading ? (
                    <p>댓글을 불러오는 중...</p>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            storyId={storyId}
                            onCommentPosted={handleCommentPosted}
                            onCommentUpdated={handleCommentUpdated}
                            onCommentDeleted={handleCommentDeleted}
                            depth={0}
                        />
                    ))
                ) : (
                    <p className="text-ink/60">아직 댓글이 없습니다.</p>
                )}
            </div>

            {/* Comment input for top-level comments */}
            <form onSubmit={handleSubmitComment} className="mt-8">
                <textarea
                    ref={textareaRef}
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    className="w-full p-3 border rounded-lg bg-paper dark:bg-forest-sub border-ink/20 dark:border-pale-lavender/20 focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent focus:outline-none resize-none"
                    disabled={posting}
                />
                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="anonymous-comment"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="mr-2"
                        />
                        <label htmlFor="anonymous-comment" className="text-sm">익명으로 작성</label>
                    </div>
                    <button
                        type="submit"
                        disabled={
                            posting ||
                            !newCommentContent.trim() ||
                            (!session && !isAnonymous) // Disable if no session and not anonymous
                        }
                        className="px-6 py-2 bg-primary-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed"
                    >
                        {posting ? '작성 중...' : '댓글 작성'}
                    </button>
                </div>
            </form>
        </div>
    );
};

