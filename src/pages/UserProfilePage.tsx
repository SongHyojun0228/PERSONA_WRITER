import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import PublishedStoryCard from '../components/PublishedStoryCard';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LoadingBar } from '../components/LoadingBar';

interface UserProfile {
    username: string;
    bio?: string;
    profile_image_url?: string;
}

interface PublishedStory {
  id: string;
  title: string;
  cover_image_url?: string;
  profiles: {
    username: string;
  };
  created_at: string;
}

const UserProfilePage = () => {
    const { userId } = useParams<{ userId: string }>();
    const { session, loading: authLoading } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [stories, setStories] = useState<PublishedStory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSelf, setIsSelf] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [totalViews, setTotalViews] = useState(0);
    const [followerCount, setFollowerCount] = useState(0);

    // Fetch public data that doesn't require auth
    useEffect(() => {
        const fetchPublicData = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                const profilePromise = fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}/profile`);
                const storiesPromise = fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}/stories`);
                const [profileRes, storiesRes] = await Promise.all([profilePromise, storiesPromise]);
                if (!profileRes.ok) throw new Error('Failed to fetch user profile');
                if (!storiesRes.ok) throw new Error('Failed to fetch user stories');
                const profileData = await profileRes.json();
                const storiesData = await storiesRes.json();
                setUserProfile(profileData);
                setStories(storiesData);

                // Calculate total views from published stories
                const { data: publishedStories } = await supabase
                    .from('published_stories')
                    .select('view_count')
                    .eq('user_id', userId);

                const total = publishedStories?.reduce((sum, s) => sum + (s.view_count || 0), 0) || 0;
                setTotalViews(total);

                // Get follower count
                const { count: followerCnt } = await supabase
                    .from('subscriptions')
                    .select('*', { count: 'exact', head: true })
                    .eq('subscribed_to_id', userId);

                setFollowerCount(followerCnt || 0);
            } catch (error) {
                console.error(error);
                setUserProfile(null);
                setStories([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPublicData();
    }, [userId]);

    // This function can now be called from multiple places
    const fetchSubStatus = useCallback(async () => {
        if (!userId || authLoading || !session) {
            setIsSubscribed(false);
            setIsSelf(false);
            return;
        }

        const isSelfProfile = session.user.id === userId;
        setIsSelf(isSelfProfile);
        if (isSelfProfile) {
            setIsSubscribed(false);
            return;
        }

        try {
            const { count, error } = await supabase
                .from('subscriptions')
                .select('*', { count: 'exact', head: true })
                .eq('subscriber_id', session.user.id)
                .eq('subscribed_to_id', userId);

            if (error) throw error;
            setIsSubscribed((count || 0) > 0);
        } catch (error) {
            console.error("Error checking subscription status:", error);
            setIsSubscribed(false);
        }
    }, [userId, session, authLoading]);

    // Fetch private data (subscription status)
    useEffect(() => {
        fetchSubStatus();
    }, [fetchSubStatus]);


    const handleSubscribe = async () => {
        if (!session || isSelf || !userId) return;
        setSubscribing(true);
        try {
            const { error } = await supabase.from('subscriptions').insert({
                subscriber_id: session.user.id,
                subscribed_to_id: userId,
            });
            if (error && error.code !== '23505') { // Ignore 'already exists' error
                throw error;
            }
            await fetchSubStatus(); // Re-fetch status to be 100% sure
        } catch (error) {
            console.error(error);
            alert('구독에 실패했습니다.');
        } finally {
            setSubscribing(false);
        }
    };
    
    const handleUnsubscribe = async () => {
        if (!session || isSelf || !userId) return;
        setSubscribing(true);
        try {
            const { error } = await supabase.from('subscriptions').delete()
                .eq('subscriber_id', session.user.id)
                .eq('subscribed_to_id', userId);
            
            if (error) throw error;
            await fetchSubStatus(); // Re-fetch status to be 100% sure
        } catch (error) {
            console.error(error);
            alert('구독 취소에 실패했습니다.');
        } finally {
            setSubscribing(false);
        }
    };

    if (authLoading || loading) {
        return (
            <>
                <LoadingBar isLoading={true} />
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <LoadingSpinner size="lg" text="프로필을 불러오는 중..." />
                </div>
            </>
        );
    }
    
    if (!userProfile) {
         return (
            <>
                <Header />
                <div className="text-center p-8">사용자를 찾을 수 없습니다.</div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="max-w-6xl mx-auto p-8">
                {/* Author Info Section */}
                <div className="bg-paper dark:bg-forest-sub rounded-lg p-6 mb-6 shadow-md">
                    <div className="flex items-start space-x-4">
                        {/* Profile Image */}
                        <div className="w-20 h-20 rounded-full bg-primary-accent/20 dark:bg-dark-accent/20 overflow-hidden flex-shrink-0">
                            {userProfile.profile_image_url ? (
                                <img
                                    src={userProfile.profile_image_url}
                                    alt={userProfile.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary-accent dark:text-dark-accent">
                                    {userProfile.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-ink dark:text-pale-lavender">{userProfile.username}</h2>
                            {userProfile.bio && (
                                <p className="text-ink/70 dark:text-pale-lavender/70 mt-2">{userProfile.bio}</p>
                            )}

                            {/* Statistics */}
                            <div className="flex space-x-6 mt-4">
                                <div>
                                    <span className="font-bold text-lg text-ink dark:text-pale-lavender">{stories.length}</span>
                                    <span className="text-sm text-ink/60 dark:text-pale-lavender/60 ml-1">작품</span>
                                </div>
                                <div>
                                    <span className="font-bold text-lg text-ink dark:text-pale-lavender">{totalViews.toLocaleString()}</span>
                                    <span className="text-sm text-ink/60 dark:text-pale-lavender/60 ml-1">조회수</span>
                                </div>
                                <div>
                                    <span className="font-bold text-lg text-ink dark:text-pale-lavender">{followerCount}</span>
                                    <span className="text-sm text-ink/60 dark:text-pale-lavender/60 ml-1">팔로워</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        {isSelf ? (
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="px-4 py-2 bg-primary-accent dark:bg-dark-accent text-white dark:text-midnight rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                            >
                                새 작품 쓰기
                            </button>
                        ) : session && (
                            isSubscribed ? (
                                <button
                                    onClick={handleUnsubscribe}
                                    disabled={subscribing}
                                    className="px-4 py-2 border-2 border-primary-accent dark:border-dark-accent text-primary-accent dark:text-dark-accent rounded-lg hover:bg-primary-accent/10 dark:hover:bg-dark-accent/10 transition-colors disabled:opacity-50 whitespace-nowrap"
                                >
                                    {subscribing ? '처리 중...' : '팔로우 중'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubscribe}
                                    disabled={subscribing}
                                    className="px-4 py-2 border-2 border-primary-accent dark:border-dark-accent text-primary-accent dark:text-dark-accent rounded-lg hover:bg-primary-accent hover:text-white dark:hover:bg-dark-accent dark:hover:text-midnight transition-colors disabled:opacity-50 whitespace-nowrap"
                                >
                                    {subscribing ? '처리 중...' : '팔로우'}
                                </button>
                            )
                        )}
                    </div>
                </div>

                <main>
                    <h2 className="text-2xl font-bold mb-6">작성한 이야기</h2>
                    {stories.length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {stories.map(story => <PublishedStoryCard key={story.id} story={{...story, is_paid: false}} onStoryClick={() => {}} />)}
                        </div>
                    ) : (
                        <p className="text-center text-ink/60 dark:text-pale-lavender/60">아직 작성한 이야기가 없습니다.</p>
                    )}
                </main>
            </div>
        </>
    );
};

export default UserProfilePage;
