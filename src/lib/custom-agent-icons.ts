import {
  Brain,
  Code,
  Cpu,
  Database,
  Globe,
  LucideIcon,
  Sparkles,
  Zap,
} from 'lucide-react';

export interface CustomAgentIconOption {
  name: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
}

export const customAgentIconOptions: CustomAgentIconOption[] = [
  { name: 'Brain', icon: Brain, color: 'text-sky-400', gradient: 'from-sky-500/20 to-sky-600/10' },
  { name: 'Cpu', icon: Cpu, color: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-600/10' },
  { name: 'Zap', icon: Zap, color: 'text-yellow-400', gradient: 'from-yellow-500/20 to-yellow-600/10' },
  { name: 'Database', icon: Database, color: 'text-green-400', gradient: 'from-green-500/20 to-green-600/10' },
  { name: 'Globe', icon: Globe, color: 'text-blue-400', gradient: 'from-blue-500/20 to-blue-600/10' },
  { name: 'Code', icon: Code, color: 'text-pink-400', gradient: 'from-pink-500/20 to-pink-600/10' },
  { name: 'Sparkles', icon: Sparkles, color: 'text-orange-400', gradient: 'from-orange-500/20 to-orange-600/10' },
];

export function getCustomAgentIcon(name?: string): CustomAgentIconOption {
  return customAgentIconOptions.find((option) => option.name === name) || customAgentIconOptions[0];
}
