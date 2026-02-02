import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import PublishedStoryCard from '../components/PublishedStoryCard';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient'; // Import Supabase client

interface UserProfile {
    username: string;
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
            } catch (error) {
                console.error(error);
                setUserProfile(null); // Ensure userProfile is null on error
                setStories([]);       // Ensure stories are empty on error
            } finally {
                setLoading(false); // Ensure loading is false regardless of success or failure
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
                <Header />
                <div className="text-center p-8">프로필을 불러오는 중...</div>
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
                <header className="mb-12 text-center">
                    <div className="inline-block w-24 h-24 rounded-full bg-gray-300 dark:bg-forest-sub mb-4 flex items-center justify-center">
                        <span className="text-4xl font-bold text-ink dark:text-pale-lavender inline-flex items-center justify-center h-full w-full">
                            {userProfile.username.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold">{userProfile.username}</h1>
                    <div className="mt-4">
                        {!isSelf && session && (
                            isSubscribed ? (
                                <button
                                    onClick={handleUnsubscribe}
                                    disabled={subscribing}
                                    className="px-6 py-2 border border-ink/20 dark:border-pale-lavender/20 text-ink dark:text-pale-lavender font-semibold rounded-full hover:bg-ink/5 dark:hover:bg-pale-lavender/10 transition-colors disabled:opacity-50"
                                >
                                    {subscribing ? '처리 중...' : '구독 중'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubscribe}
                                    disabled={subscribing}
                                    className="px-6 py-2 bg-primary-accent text-white font-semibold rounded-full hover:bg-opacity-90 transition-colors disabled:opacity-50"
                                >
                                    {subscribing ? '처리 중...' : '구독하기'}
                                </button>
                            )
                        )}
                    </div>
                </header>

                <main>
                    <h2 className="text-2xl font-bold mb-6">작성한 이야기</h2>
                    {stories.length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {stories.map(story => <PublishedStoryCard key={story.id} story={{...story, is_paid: false}} onStoryClick={() => {}} />)}
                        </div>
                    ) : (
                        <p className="text-center text-ink/60">아직 작성한 이야기가 없습니다.</p>
                    )}
                </main>
            </div>
        </>
    );
};

export default UserProfilePage;
