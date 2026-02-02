import {
  createContext,
  useState,
  useContext,
  type ReactNode,
} from "react";
import {
  type Project,
  type Page,
  type Character,
  type Foreshadow,
  type MergedPage,
  type Relationship,
} from "../data/mock";
import { supabase } from "../lib/supabaseClient";

export type ActiveView =
  | { type: "page"; id: string }
  | { type: "characterSheet" }
  | { type: "settings"; id: string }
  | { type: 'relationships' }
  | { type: "mergedPage"; id: string };

interface ProjectContextType {
  project: Project | null;
  setProject: (project: Project | null) => void;
  activeView: ActiveView | null;
  setActiveView: (view: ActiveView | null) => void;
  updatePageContent: (view: ActiveView, newContent: string) => Promise<void>;
  updateMergedPageContent: (pageId: string, newContent: string) => Promise<void>;
  addPage: (title: string) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  reorderPages: (reorderedPages: Page[]) => Promise<void>;
  updatePageTitle: (pageId: string, newTitle: string) => Promise<void>;
  updateMergedPageTitle: (pageId: string, newTitle: string) => Promise<void>;
  addCharacter: () => Promise<void>;
  updateCharacter: (updatedCharacter: Character) => Promise<void>;
  deleteCharacter: (characterId: string) => Promise<void>;
  addForeshadow: (content: string) => Promise<void>;
  resolveForeshadow: (foreshadowId: string) => Promise<void>;
  deleteForeshadow: (foreshadowId: string) => Promise<void>;
  deleteMergedPage: (pageId: string) => Promise<void>;
  mergePages: () => Promise<void>;
  addRelationship: (sourceId: string, targetId: string, description: string) => Promise<Relationship | null>;
  deleteRelationship: (relationshipId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [activeView, setActiveView] = useState<ActiveView | null>(null);

  const updatePageContent = async (view: ActiveView, newContent: string) => {
    if (!project || view.type === "characterSheet" || view.type === 'mergedPage') return;

    let error = null;
    let updatedProject: Project | null = null;

    if (view.type === "page") {
      ({ error } = await supabase
        .from("pages")
        .update({ content: newContent })
        .eq("id", view.id));
      if (!error) {
        const newPages = project.pages.map((p) =>
          p.id === view.id ? { ...p, content: newContent } : p
        );
        updatedProject = { ...project, pages: newPages };
      }
    } else if (view.type === "settings") {
      ({ error } = await supabase
        .from("pages")
        .update({ content: newContent })
        .eq("id", view.id));
      if (!error) {
        const newSettings = { ...project.settings, content: newContent };
        updatedProject = { ...project, settings: newSettings };
      }
    }

    if (error) {
      console.error("Error updating page content:", error);
    } else if (updatedProject) {
      setProject(updatedProject);
    }
  };

  const updateMergedPageContent = async (pageId: string, newContent: string) => {
    if (!project) return;

    const { error } = await supabase
      .from('merged_pages')
      .update({ content: newContent })
      .eq('id', pageId);

    if (error) {
      console.error('Error updating merged page content:', error);
    } else {
      const newMergedPages = project.mergedPages.map(p =>
        p.id === pageId ? { ...p, content: newContent } : p
      );
      setProject({ ...project, mergedPages: newMergedPages });
    }
  };

  const addPage = async (title: string) => {
    if (!project) return;

    const { data, error } = await supabase
      .from("pages")
      .insert({
        project_id: project.id,
        title,
        content: `<h1>${title}</h1><p></p>`,
        type: "PAGE",
        sort_order: project.pages.length,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding page:", error);
    } else {
      const newPage: Page = data;
      const newProject = { ...project, pages: [...project.pages, newPage] };
      setProject(newProject);
      setActiveView({ type: "page", id: newPage.id });
    }
  };

  const deletePage = async (pageId: string) => {
    if (!project) return;

    const { error } = await supabase.from("pages").delete().eq("id", pageId);

    if (error) {
      console.error("Error deleting page:", error);
    } else {
      const newPages = project.pages.filter((p) => p.id !== pageId);
      const newProject = { ...project, pages: newPages };
      setProject(newProject);

      if (activeView?.type === "page" && activeView.id === pageId) {
        setActiveView({ type: "settings", id: project.settings.id });
      }
    }
  };

  const reorderPages = async (reorderedPages: Page[]) => {
    if (!project) return;

    const newProject = { ...project, pages: reorderedPages };
    setProject(newProject);

    const updates = reorderedPages.map((page, index) => ({
      id: page.id,
      sort_order: index,
    }));

    const { error } = await supabase
      .from("pages")
      .upsert(updates, { onConflict: "id" });

    if (error) {
      console.error("Error reordering pages:", error);
    }
  };

  const updatePageTitle = async (pageId: string, newTitle: string) => {
    if (!project) return;

    const { error } = await supabase
      .from('pages')
      .update({ title: newTitle })
      .eq('id', pageId);

    if (error) {
      console.error('Error updating page title:', error);
    } else {
      const newPages = project.pages.map(p => 
        p.id === pageId ? { ...p, title: newTitle } : p
      );
      setProject({ ...project, pages: newPages });
    }
  };

  const updateMergedPageTitle = async (pageId: string, newTitle: string) => {
    if (!project) return;

    const { error } = await supabase
      .from('merged_pages')
      .update({ title: newTitle })
      .eq('id', pageId);

    if (error) {
      console.error('Error updating merged page title:', error);
    } else {
      const newMergedPages = project.mergedPages.map(p => 
        p.id === pageId ? { ...p, title: newTitle } : p
      );
      setProject({ ...project, mergedPages: newMergedPages });
    }
  };

  const addCharacter = async () => {
    if (!project) return;
    const { data, error } = await supabase
      .from("characters")
      .insert({
        project_id: project.id,
        name: "새 캐릭터",
        gender: "",
        personality: "",
        description: "",
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding character:", error);
    } else {
      const newChar: Character = data;
      const newProject = {
        ...project,
        characters: [...project.characters, newChar],
      };
      setProject(newProject);
    }
  };

  const updateCharacter = async (updatedCharacter: Character) => {
    if (!project) return;
    const { error } = await supabase
      .from("characters")
      .update(updatedCharacter)
      .eq("id", updatedCharacter.id);

    if (error) {
      console.error("Error updating character:", error);
    } else {
      const newCharacters = project.characters.map((c) =>
        c.id === updatedCharacter.id ? updatedCharacter : c,
      );
      setProject({ ...project, characters: newCharacters });
    }
  };

  const deleteCharacter = async (characterId: string) => {
    if (!project) return;
    const { error } = await supabase
      .from("characters")
      .delete()
      .eq("id", characterId);

    if (error) {
      console.error("Error deleting character:", error);
    } else {
      const newCharacters = project.characters.filter(
        (c) => c.id !== characterId,
      );
      setProject({ ...project, characters: newCharacters });
    }
  };

  const addForeshadow = async (content: string) => {
    if (!project) return;

    const { data, error } = await supabase
      .from("foreshadows")
      .insert({
        project_id: project.id,
        content,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding foreshadow:", error);
    } else {
      const newForeshadow: Foreshadow = data;
      const newProject = {
        ...project,
        foreshadows: [...(project.foreshadows || []), newForeshadow],
      };
      setProject(newProject);
    }
  };

  const resolveForeshadow = async (foreshadowId: string) => {
    if (!project) return;

    const { data, error } = await supabase
      .from("foreshadows")
      .update({ status: "closed", resolved_at: new Date().toISOString() })
      .eq("id", foreshadowId)
      .select()
      .single();

    if (error) {
      console.error("Error resolving foreshadow:", error);
    } else {
      const updatedForeshadow: Foreshadow = data;
      const newForeshadows = project.foreshadows.map((f) =>
        f.id === foreshadowId ? updatedForeshadow : f,
      );
      const newProject = { ...project, foreshadows: newForeshadows };
      setProject(newProject);
    }
  };
  
  const deleteForeshadow = async (foreshadowId: string) => {
    if (!project) return;

    const { error } = await supabase.from('foreshadows').delete().eq('id', foreshadowId);

    if (error) {
      console.error('Error deleting foreshadow:', error);
    } else {
      const newForeshadows = project.foreshadows.filter(f => f.id !== foreshadowId);
      setProject({ ...project, foreshadows: newForeshadows });
    }
  };
  
  const deleteMergedPage = async (pageId: string) => {
    if (!project) return;

    const { error } = await supabase.from('merged_pages').delete().eq('id', pageId);

    if (error) {
      console.error('Error deleting merged page:', error);
    } else {
      const newMergedPages = project.mergedPages.filter(p => p.id !== pageId);
      setProject({ ...project, mergedPages: newMergedPages });
      if (activeView?.type === 'mergedPage' && activeView.id === pageId) {
        setActiveView({ type: 'settings', id: project.settings.id });
      }
    }
  };

  const mergePages = async () => {
    if (!project || project.pages.length === 0) return;

    const pagesToMerge = project.pages;

    if (pagesToMerge.length === 0) {
        alert('통합할 페이지가 없습니다.');
        return;
    }

    const mergedContent = pagesToMerge
      .map(page => page.content)
      .join('\n<hr style="border-top: 2px dashed #bbb; margin: 2rem 0;" />\n');
    
    const newTitle = `[통합본] ${project.name} - ${new Date().toLocaleDateString('ko-KR')}`;

    const { data, error } = await supabase
      .from('merged_pages')
      .insert({
        project_id: project.id,
        title: newTitle,
        content: mergedContent,
      })
      .select()
      .single();

    if (error) {
      console.error('Error merging pages:', error);
    } else {
      const newMergedPage: MergedPage = data;
      const newProject = { ...project, mergedPages: [...(project.mergedPages || []), newMergedPage] };
      setProject(newProject);
    }
  };

  const addRelationship = async (source_character_id: string, target_character_id: string, description: string): Promise<Relationship | null> => {
    if (!project) return null;
    const { data, error } = await supabase.from('character_relationships').insert({ project_id: project.id, source_character_id, target_character_id, description }).select('*, source:characters!source_character_id(name), target:characters!target_character_id(name)').single();
    if (error) {
      console.error("Error adding relationship:", error);
      return null;
    }
    const newRelationship: Relationship = { ...data, source_name: data.source.name, target_name: data.target.name };
    const newProject = { ...project, relationships: [...project.relationships, newRelationship] };
    setProject(newProject);
    return newRelationship;
  };

  const deleteRelationship = async (relationshipId: string) => {
    if (!project) return;
    const { error } = await supabase.from('character_relationships').delete().eq('id', relationshipId);
    if (error) {
      console.error("Error deleting relationship:", error);
    } else {
      const newRelationships = project.relationships.filter(r => r.id !== relationshipId);
      setProject({ ...project, relationships: newRelationships });
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        setProject,
        activeView,
        setActiveView,
        updatePageContent,
        updateMergedPageContent,
        addPage,
        deletePage,
        reorderPages,
        updatePageTitle,
        updateMergedPageTitle,
        addCharacter,
        updateCharacter,
        deleteCharacter,
        addForeshadow,
        resolveForeshadow,
        deleteForeshadow,
        deleteMergedPage,
        mergePages,
        addRelationship,
        deleteRelationship,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
};
