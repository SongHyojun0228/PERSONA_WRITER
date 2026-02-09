import { useState, useEffect } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { type Character } from '../data/mock';
import { XIcon } from './Icons';
import { CharacterArcSection } from './CharacterArcSection';

const CharacterForm = ({ character, onSave }: { character: Character, onSave: (updatedCharacter: Character) => void }) => {
    const [formData, setFormData] = useState(character);

    useEffect(() => {
        setFormData(character);
    }, [character]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = () => {
        onSave(formData);
    };

    return (
        <div className="space-y-6 p-6">
            <div className="space-y-2">
                <label className="text-sm font-medium">이름</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} className="w-full p-2 rounded bg-paper dark:bg-midnight border border-ink/20 dark:border-pale-lavender/20" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">성별</label>
                <input type="text" name="gender" value={formData.gender} onChange={handleChange} onBlur={handleBlur} className="w-full p-2 rounded bg-paper dark:bg-midnight border border-ink/20 dark:border-pale-lavender/20" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">성격 (키워드)</label>
                <input type="text" name="personality" value={formData.personality} onChange={handleChange} onBlur={handleBlur} className="w-full p-2 rounded bg-paper dark:bg-midnight border border-ink/20 dark:border-pale-lavender/20" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">상세 설명</label>
                <textarea name="description" value={formData.description} onChange={handleChange} onBlur={handleBlur} rows={10} className="w-full p-2 rounded bg-paper dark:bg-midnight border border-ink/20 dark:border-pale-lavender/20" />
            </div>

            {/* Character Arc Section */}
            <div className="border-t border-ink/10 dark:border-pale-lavender/10 pt-6">
                <CharacterArcSection characterId={character.id} />
            </div>
        </div>
    );
};


export const CharacterSheetEditor = () => {
    const { project, addCharacter, updateCharacter, deleteCharacter } = useProjectContext();
    const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

    const characters = project?.characters || [];

    // Select the first character by default or when the selected one is deleted
    useEffect(() => {
        if (!selectedCharacterId || !characters.some(c => c.id === selectedCharacterId)) {
            setSelectedCharacterId(characters[0]?.id || null);
        }
    }, [characters, selectedCharacterId]);

    const handleDelete = (e: React.MouseEvent, charId: string, charName: string) => {
        e.stopPropagation(); // Prevent the selection from changing when clicking delete
        if(window.confirm(`'${charName}' 캐릭터를 정말 삭제하시겠습니까?`)) {
            deleteCharacter(charId);
        }
    };
    
    const selectedCharacter = characters.find(c => c.id === selectedCharacterId);

    return (
        <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-ink/10 dark:border-pale-lavender/10 p-4 space-y-2 shrink-0 max-h-48 md:max-h-none overflow-y-auto">
                <button onClick={addCharacter} className="w-full p-2 mb-4 rounded text-white bg-primary-accent dark:bg-dark-accent hover:opacity-90">
                    + 새 캐릭터 추가
                </button>
                {characters.map(char => (
                    // Modified structure to integrate delete button within the clickable area
                    <div key={char.id} className="relative group">
                        <div
                            onClick={() => setSelectedCharacterId(char.id)}
                            className={`flex items-center w-full text-left py-2 text-lg font-medium rounded-lg transition-colors cursor-pointer ${
                                selectedCharacterId === char.id
                                    ? 'bg-primary-accent/20 text-primary-accent dark:bg-dark-accent/30 dark:text-dark-accent'
                                    : 'text-ink dark:text-pale-lavender hover:bg-primary-accent/10 dark:hover:bg-dark-accent/20'
                            }`}
                            role="button" // Added role for accessibility
                            tabIndex={0} // Added tabIndex for keyboard navigation
                            onKeyDown={(e) => { // Added keyboard interaction
                                if (e.key === 'Enter' || e.key === ' ') {
                                    setSelectedCharacterId(char.id);
                                    e.preventDefault();
                                }
                            }}
                        >
                            <span className="px-4 flex-1 truncate">{char.name}</span>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button 
                                    onClick={(e) => handleDelete(e, char.id, char.name)}
                                    className="p-1 rounded-full hover:bg-red-500/20 text-red-500 transition-colors"
                                    title="캐릭터 삭제"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                {selectedCharacter ? (
                    <CharacterForm character={selectedCharacter} onSave={updateCharacter} />
                ) : (
                    <div className="p-6 text-center text-ink dark:text-pale-lavender">
                        <p>캐릭터가 없습니다.</p>
                        <p>'새 캐릭터 추가' 버튼을 눌러 첫 번째 캐릭터를 만들어보세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
