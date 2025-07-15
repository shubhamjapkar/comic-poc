import { Comic, Character, Panel } from '@/types';

const STORAGE_KEY = 'comic-project';

export interface StoredProject {
  id: string;
  name: string;
  comic: Comic;
  createdAt: string;
  updatedAt: string;
}

export function saveProject(project: StoredProject): void {
  try {
    const existingProjects = getProjects();
    const updatedProjects = existingProjects.filter(p => p.id !== project.id);
    updatedProjects.push({ ...project, updatedAt: new Date().toISOString() });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
  } catch (error) {
    console.error('Error saving project:', error);
  }
}

export function getProjects(): StoredProject[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

export function getProject(id: string): StoredProject | null {
  try {
    const projects = getProjects();
    return projects.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error getting project:', error);
    return null;
  }
}

export function deleteProject(id: string): void {
  try {
    const projects = getProjects();
    const updatedProjects = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
  } catch (error) {
    console.error('Error deleting project:', error);
  }
}

export function createNewProject(name: string): StoredProject {
  const project: StoredProject = {
    id: `project-${Date.now()}`,
    name,
    comic: {
      id: `comic-${Date.now()}`,
      title: name,
      description: '',
      characters: [],
      pages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  saveProject(project);
  return project;
}