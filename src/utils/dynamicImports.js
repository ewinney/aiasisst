import dynamic from 'next/dynamic';

export const DynamicButton = dynamic(() => import('@/components/ui/button').then((mod) => mod.Button), {
  ssr: false,
});

export const DynamicNavBar = dynamic(() => import('@/components/NavBar'), {
  ssr: false,
});

export const DynamicThemeToggle = dynamic(() => import('@/components/ThemeToggle'), {
  ssr: false,
});