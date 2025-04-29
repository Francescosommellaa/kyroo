import type { ModuleMeta } from '../types/module';

type ModuleMetaFile = {
  moduleMeta: ModuleMeta;
};

export async function getModulesByRole(role: string): Promise<ModuleMeta[]> {
  const modules = import.meta.glob<ModuleMetaFile>('../modules/**/meta.ts', { eager: true });

  return Object.values(modules)
    .map((mod) => mod.moduleMeta)
    .filter((mod) => mod.role === role);
}