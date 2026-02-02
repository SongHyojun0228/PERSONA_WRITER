import React from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon, HeartIcon } from './Icons'; // Import HeartIcon
import spiritIcon from '../assets/spirit.png'; // Import spiritIcon
import { formatTimeAgo } from '../lib/timeAgo'; // Corrected import path

interface PublishedStory {
  id: string;
  title: string;
  cover_image_url?: string;
  profiles: {
    username: string;
  };
  created_at: string;
  is_paid: boolean;
  price?: number;
}

interface PublishedStoryCardProps {
  story: PublishedStory;
  onEdit?: () => void; // Optional edit handler
  onDelete?: () => void; // Optional delete handler
  onStoryClick: (storyId: string) => void; // Changed to pass only storyId
  likesCount?: number; // Added likesCount to props
  remainingTime?: string;
  overridePriceText?: string; // Added to override price display
}

const PublishedStoryCard: React.FC<PublishedStoryCardProps> = ({ story, onEdit, onDelete, onStoryClick, likesCount, remainingTime, overridePriceText }) => {
  const inspirationCount = story.is_paid && story.price ? story.price / 100 : 0;

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link navigation for paid stories
    onStoryClick(story.id);
  };

  const CardContent = (
    <div className="overflow-hidden rounded-lg shadow-lg transition-shadow duration-300 group-hover:shadow-xl bg-paper dark:bg-forest-sub h-full flex flex-col">
      <div className="relative">
        {story.cover_image_url ? (
          <img src={story.cover_image_url} alt={`${story.title} cover`} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-primary-accent dark:bg-dark-accent" />
        )}
        {remainingTime && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                {remainingTime}
            </div>
        )}
      </div>
      <div className="p-4 relative flex-grow"> {/* Added flex-grow */}
        <h3 className="text-lg font-bold truncate group-hover:text-primary-accent dark:group-hover:text-dark-accent">{story.title}</h3>
        <p className="text-sm text-ink/60 dark:text-pale-lavender/60 mt-1 flex items-center space-x-1">
          <span>by {story.profiles.username}</span>
          <span className="text-xs text-ink/40 dark:text-pale-lavender/40">• {formatTimeAgo(story.created_at)}</span>
        </p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm font-semibold text-primary-accent dark:text-dark-accent flex items-center">
            {overridePriceText ? (
              <span>{overridePriceText}</span>
            ) : story.is_paid && inspirationCount > 0 ? (
              <>
                <img src={spiritIcon} alt="영감" className="h-4 w-4 mr-1" />
                <span>{inspirationCount}</span>
              </>
            ) : (
              "무료"
            )}
          </p>
          {likesCount !== undefined && likesCount >= 0 && (
            <div className="flex items-center text-sm text-ink/60 dark:text-pale-lavender/60">
              <HeartIcon className="w-4 h-4 mr-1 text-red-500" />
              <span>{likesCount}</span>
            </div>
          )}
        </div>
        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2 flex space-x-2 z-10">
              {onEdit && (
                  <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }} 
                      className="p-1 rounded-full hover:bg-blue-500/20 text-blue-500 transition-colors"
                      title="글 수정"
                  >
                      <PencilIcon className="w-4 h-4" />
                  </button>
              )}
              {onDelete && (
                  <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }} 
                      className="p-1 rounded-full hover:bg-red-500/20 text-red-500 transition-colors"
                      title="글 삭제"
                  >
                      <TrashIcon className="w-4 h-4" />
                  </button>
              )}
          </div>
        )}
      </div>
    </div>
  );

  return story.is_paid ? (
    <div className="block group cursor-pointer" onClick={handleCardClick}>
      {CardContent}
    </div>
  ) : (
    <Link to={`/story/${story.id}`} className="block group">
      {CardContent}
    </Link>
  );
};
export default PublishedStoryCard;
