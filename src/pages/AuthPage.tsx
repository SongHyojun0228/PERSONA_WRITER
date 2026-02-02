import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // New state for username
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                // Modified signUp call to include username in user_metadata
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username, // Storing username in user_metadata
                        },
                    },
                });
                if (error) throw error;
                alert('회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화해주세요.');
            }
        } catch (err: any) {
            setError(err.error_description || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-midnight">
            <div className="w-full max-w-md p-8 space-y-8 bg-primary-accent/5 dark:bg-dark-accent/10 rounded-lg shadow-lg">
                <div>
                    <h1 className="text-3xl font-bold text-center text-primary-accent dark:text-dark-accent">
                        Persona Writer
                    </h1>
                    <p className="mt-2 text-center text-sm text-ink/70 dark:text-pale-lavender/70">
                        {isLogin ? '로그인하여 당신의 세계를 펼치세요' : '가입하여 새로운 세계를 만드세요'}
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleAuth}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">이메일</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 rounded bg-paper dark:bg-midnight border border-ink/20 dark:border-pale-lavender/20" />
                    </div>
                    {!isLogin && ( // Only show username input for sign-up
                        <div className="space-y-2">
                            <label className="text-sm font-medium">닉네임</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required // Username is required for sign-up
                                className="w-full p-2 rounded bg-paper dark:bg-midnight border border-ink/20 dark:border-pale-lavender/20"
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">비밀번호</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 rounded bg-paper dark:bg-midnight border border-ink/20 dark:border-pale-lavender/20" />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className="w-full p-3 rounded text-white bg-primary-accent dark:bg-dark-accent hover:opacity-90 disabled:opacity-50">
                            {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary-accent dark:text-dark-accent hover:underline">
                        {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                    </button>
                </div>
            </div>
        </div>
    );
};
