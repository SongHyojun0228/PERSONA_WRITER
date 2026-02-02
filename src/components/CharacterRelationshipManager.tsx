import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, MarkerType, Handle, Position, type Edge, BackgroundVariant } from 'reactflow';
import 'reactflow/dist/style.css'; // Import default React Flow styles
import { useProjectContext } from '../context/ProjectContext';
import { TrashIcon } from './Icons';

// Custom Node component (defined outside to prevent re-creation)
const CustomCharacterNode = ({ data }: { data: { label: string } }) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-full bg-white border-2 border-primary-accent text-primary-accent dark:bg-forest-sub dark:border-dark-accent dark:text-dark-accent">
            <Handle type="source" position={Position.Top} className="w-3 h-3 bg-primary-accent dark:bg-dark-accent rounded-full" />
            <div className="text-lg font-bold">{data.label}</div>
            <Handle type="target" position={Position.Bottom} className="w-3 h-3 bg-primary-accent dark:bg-dark-accent rounded-full" />
        </div>
    );
};

// nodeTypes object (defined outside to prevent re-creation)
const nodeTypes = {
    customCharacter: CustomCharacterNode,
};

// Helper function to generate initial circular layout
const getCircularLayout = (characters: any[]) => {
    const nodes: any[] = [];
    const radius = 200;
    const center = { x: 300, y: 300 };
    const angleStep = (2 * Math.PI) / characters.length;

    characters.forEach((char, index) => {
        const angle = index * angleStep;
        nodes.push({
            id: char.id,
            position: { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) },
            data: { label: char.name },
            type: 'customCharacter', // Use a custom node type for styling
        });
    });
    return nodes;
};

export const CharacterRelationshipManager = () => {
    const { project, addRelationship, deleteRelationship } = useProjectContext();
    const [formError, setFormError] = useState<string | null>(null);

    // Form state
    const [sourceId, setSourceId] = useState('');
    const [targetId, setTargetId] = useState('');
    const [description, setDescription] = useState('');

    const characterNodes = useMemo(() => {
        if (!project?.characters) return [];
        // Generate nodes with a circular layout
        const nodes = getCircularLayout(project.characters);
        return nodes;
    }, [project?.characters]);

    const relationshipEdges = useMemo(() => {
        if (!project?.relationships || !project?.characters) return [];
    
        return project.relationships.reduce<Edge[]>((acc, rel) => {
            const sourceChar = project.characters.find(c => c.id === rel.source_character_id);
            const targetChar = project.characters.find(c => c.id === rel.target_character_id);
    
            if (sourceChar && targetChar) {
                acc.push({
                    id: rel.id,
                    source: rel.source_character_id,
                    target: rel.target_character_id,
                    label: rel.description,
                    type: 'smoothstep', // Or 'default', 'straight', 'step'
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 20,
                        height: 20,
                        color: '#6366F1', // Primary accent color
                    },
                    style: { strokeWidth: 2, stroke: '#6366F1' }, // Primary accent color
                    labelBgStyle: { fill: '#fff', color: '#333', fillOpacity: 0.8 },
                    labelShowBg: true,
                    labelStyle: { fontSize: 12, fill: '#333' },
                });
            }
            return acc;
        }, []);
    }, [project?.relationships, project?.characters]);

    const [nodes, setNodes, onNodesChange] = useNodesState(characterNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(relationshipEdges);

    // Update nodes/edges when project characters/relationships change
    useEffect(() => {
        setNodes(characterNodes);
    }, [characterNodes, setNodes]);

    useEffect(() => {
        setEdges(relationshipEdges);
    }, [relationshipEdges, setEdges]);

    const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const handleAddRelationship = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sourceId || !targetId || !description.trim()) {
            setFormError('모든 필드를 채워주세요.');
            return;
        }
        if (sourceId === targetId) {
            setFormError('캐릭터는 자기 자신과 관계를 맺을 수 없습니다.');
            return;
        }
        setFormError(null);

        const newRelationship = await addRelationship(sourceId, targetId, description.trim());
        if (newRelationship) {
            setSourceId('');
            setTargetId('');
            setDescription('');
        } else {
            setFormError('관계를 추가하는 데 실패했습니다. 동일한 관계가 이미 존재할 수 있습니다.');
        }
    };

    const handleDeleteRelationship = async (relationshipId: string) => {
        if (!window.confirm('이 관계를 정말로 삭제하시겠습니까?')) return;
        await deleteRelationship(relationshipId);
    };

    if (!project) {
        return <div className="p-4">프로젝트를 불러오는 중...</div>;
    }
    
    const availableCharacters = project.characters || [];

    return (
        <div className="p-6 bg-paper dark:bg-forest-bg rounded-lg shadow-inner flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-6 text-primary-accent dark:text-dark-accent border-b pb-2">인물 관계 관리</h2>
            
            {/* Add Relationship Form */}
            <form onSubmit={handleAddRelationship} className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 flex flex-wrap gap-4 items-end">
                <h3 className="text-lg font-semibold w-full mb-2">새 관계 추가</h3>
                <select value={sourceId} onChange={e => setSourceId(e.target.value)} className="flex-1 min-w-40 p-2 border rounded-md bg-white dark:bg-gray-700">
                    <option value="">-- 시작 캐릭터 --</option>
                    {availableCharacters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                
                <div className="flex-1 min-w-40 flex flex-col">
                    <label htmlFor="description" className="text-sm mb-1">관계 설명</label>
                    <input id="description" type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="예: 친구, 적, 스승..." className="w-full p-2 border rounded-md bg-white dark:bg-gray-700"/>
                </div>

                <select value={targetId} onChange={e => setTargetId(e.target.value)} className="flex-1 min-w-40 p-2 border rounded-md bg-white dark:bg-gray-700">
                    <option value="">-- 대상 캐릭터 --</option>
                    {availableCharacters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {formError && <p className="text-red-500 text-sm mt-2 w-full">{formError}</p>}
                <button type="submit" className="px-4 py-2 bg-primary-accent text-white rounded-md hover:bg-opacity-90 min-w-max">관계 추가</button>
            </form>

            {/* React Flow Canvas for Relationship Graph */}
            <div className="flex-1 rounded-lg border-2 border-ink/10 dark:border-pale-lavender/10" style={{ height: '600px' }}> {/* Fixed height for the graph */}
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-left"
                >
                    <MiniMap nodeStrokeColor={(n) => {
                        if (n.type === 'input') return '#0041d0';
                        if (n.type === 'customCharacter') return '#6366F1';
                        if (n.type === 'output') return '#ff0000';
                        return '#eee';
                    }} nodeColor={'#fff'} nodeBorderRadius={2} />
                    <Controls />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
            </div>

            {/* Relationship List for easy deletion (optional, could be done via graph interaction) */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">설정된 관계 목록 (삭제용)</h3>
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                    {project.relationships && project.relationships.length > 0 ? project.relationships.map(rel => (
                        <li key={rel.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div>
                                <span className="font-bold text-blue-600 dark:text-blue-400">{rel.source_name}</span>
                                <span className="mx-2">→</span>
                                <span className="italic text-gray-600 dark:text-gray-300">"{rel.description}"</span>
                                <span className="mx-2">→</span>
                                <span className="font-bold text-green-600 dark:text-green-400">{rel.target_name}</span>
                            </div>
                            <button onClick={() => handleDeleteRelationship(rel.id)} className="p-1 text-red-500 hover:text-red-700">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </li>
                    )) : <p className="text-gray-500">아직 설정된 관계가 없습니다.</p>}
                </ul>
            </div>
        </div>
    );
};
