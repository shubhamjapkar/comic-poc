'use client';

import { useState, useEffect } from 'react';
import { StoredProject, getProjects, createNewProject, deleteProject } from '../lib/storage';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Trash2, FolderOpen } from 'lucide-react';

interface ProjectManagerProps {
  onProjectSelect: (project: StoredProject) => void;
  currentProject?: any;
}

export default function ProjectManager({ onProjectSelect, currentProject }: ProjectManagerProps) {
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const stored = getProjects();
    setProjects(stored);
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const project = createNewProject(newProjectName.trim());
      setProjects([...projects, project]);
      setNewProjectName('');
      setShowCreateForm(false);
      onProjectSelect(project);
    }
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className={currentProject?.id === project.id ? 'ring-2 ring-blue-500' : ''}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{project.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onProjectSelect(project)}
                  >
                    <FolderOpen className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Characters: {project.comic.characters.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Pages: {project.comic.pages.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Updated: {new Date(project.updatedAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && !showCreateForm && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No projects found. Create your first project to get started!</p>
        </div>
      )}
    </div>
  );
}