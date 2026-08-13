import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CardSim, FileText, LayoutDashboard, Moon, Radio, Settings, ShoppingCart, Smartphone, Sun, Users } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useTheme } from '@/hooks/useTheme';

/** ⌘K command palette — pages and actions. */
export default function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const { resolvedTheme, toggle } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} showCloseButton={false}>
      <CommandInput placeholder="Search pages, users, contracts…" />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-4">
            <img src="/empty-search.svg" alt="" className="h-28 w-auto opacity-90" />
            <p className="text-[13px] text-ink-3">No results found.</p>
          </div>
        </CommandEmpty>
        <CommandGroup heading="Pages">
          <CommandItem onSelect={() => go('/')}><LayoutDashboard size={15} className="mr-2" /> Dashboard</CommandItem>
          <CommandItem onSelect={() => go('/users')}><Users size={15} className="mr-2" /> Users</CommandItem>
          <CommandItem onSelect={() => go('/contracts')}><FileText size={15} className="mr-2" /> Contracts</CommandItem>
          <CommandItem onSelect={() => go('/resources')}><CardSim size={15} className="mr-2" /> Resources</CommandItem>
          <CommandItem onSelect={() => go('/services')}><Radio size={15} className="mr-2" /> Services</CommandItem>
          <CommandItem onSelect={() => go('/accessories')}><Smartphone size={15} className="mr-2" /> Accessories</CommandItem>
          <CommandItem onSelect={() => go('/orders')}><ShoppingCart size={15} className="mr-2" /> Orders</CommandItem>
          <CommandItem onSelect={() => go('/settings')}><Settings size={15} className="mr-2" /> Settings</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => { toggle(); }}>
            {resolvedTheme === 'dark' ? <Sun size={15} className="mr-2" /> : <Moon size={15} className="mr-2" />}
            Toggle theme
            <CommandShortcut>⇧T</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
