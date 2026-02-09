import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const UsernameSetupModal = () => {
  const { session, setUsername: setContextUsername } = useAuth();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || nickname.trim().length < 2) {
      setError('닉네임은 2자 이상이어야 합니다.');
      return;
    }
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me/username`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ username: nickname.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '닉네임 설정에 실패했습니다.');
      }

      // Update local state
      setContextUsername(nickname.trim());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md mx-4 p-8 space-y-6 bg-paper dark:bg-forest-primary rounded-lg shadow-xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-accent dark:text-dark-accent">
            닉네임을 설정해주세요
          </h2>
          <p className="mt-2 text-sm text-ink/70 dark:text-pale-lavender/70">
            Persona Writer에서 사용할 닉네임을 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium mb-1">
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="2자 이상 입력"
              className="w-full p-3 rounded-lg bg-paper dark:bg-midnight border-2 border-ink/20 dark:border-pale-lavender/20 focus:border-primary-accent dark:focus:border-dark-accent focus:outline-none"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || nickname.trim().length < 2}
            className="w-full p-3 rounded-lg text-white bg-primary-accent dark:bg-dark-accent hover:opacity-90 disabled:opacity-50 font-semibold transition-colors"
          >
            {loading ? '설정 중...' : '시작하기'}
          </button>
        </form>
      </div>
    </div>
  );
};
