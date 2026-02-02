import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import PublishedStoryCard from '../components/PublishedStoryCard';

interface FoundUser {
    id: string;
    username: string;
}

interface FoundStory {
  id: string;
  title: string;
  cover_image_url?: string;
  profiles: {
    username: string;
  };
  created_at: string;
}

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [userResults, setUserResults] = useState<FoundUser[]>([]);
    const [storyResults, setStoryResults] = useState<FoundStory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) {
                setUserResults([]);
                setStoryResults([]);
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/search?q=${encodeURIComponent(query)}`);
                if (!response.ok) {
                    throw new Error('Search failed');
                }
                const data = await response.json();
                setUserResults(data.users || []);
                setStoryResults(data.stories || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    return (
        <>
            <Header />
            <div className="max-w-6xl mx-auto p-8">
                <h1 className="text-3xl font-bold mb-8">
                    '<span className="text-primary-accent dark:text-dark-accent">{query}</span>'에 대한 검색 결과
                </h1>

                {loading ? (
                    <div className="text-center p-8">검색 중...</div>
                ) : (
                    <div className="space-y-12">
                        {/* User Results */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4 border-b pb-2">작가</h2>
                            {userResults.length > 0 ? (
                                <div className="space-y-4">
                                    {userResults.map(user => (
                                        <Link 
                                            to={`/users/${user.id}`} 
                                            key={user.id}
                                            className="flex items-center p-4 border rounded-lg hover:bg-ink/5 dark:hover:bg-pale-lavender/10 transition-colors"
                                        >
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-300 dark:bg-forest-sub flex items-center justify-center mr-4">
                                                <span className="text-xl font-bold text-ink dark:text-pale-lavender">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="text-lg font-semibold">{user.username}</span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-ink/60 py-4">일치하는 작가가 없습니다.</p>
                            )}
                        </section>

                        {/* Story Results */}
                        <section>
                             <h2 className="text-2xl font-bold mb-6 border-b pb-2">작품</h2>
                             {storyResults.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                                         {storyResults.map(story => <PublishedStoryCard key={story.id} story={{...story, is_paid: false }} onStoryClick={() => {}} />)}                                </div>
                            ) : (
                                <p className="text-center text-ink/60 py-4">일치하는 작품이 없습니다.</p>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </>
    );
};

export default SearchPage;
