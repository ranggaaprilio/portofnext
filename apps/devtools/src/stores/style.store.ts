import { useDark, useMediaQuery, useStorage, useToggle } from '@vueuse/core';
import { defineStore } from 'pinia';
import { type Ref, watch } from 'vue';

export const useStyleStore = defineStore('style', {
  state: () => {
    const isDarkTheme = useDark();
    const toggleDark = useToggle(isDarkTheme);
    const isSmallScreen = useMediaQuery('(max-width: 900px)');
    const isMenuCollapsed = useStorage('isMenuCollapsed', false) as Ref<boolean>;
    const activeSidebarSection = useStorage<string>('activeSidebarSection', '') as Ref<string>;
    const isNavigationOpen = ref(false);

    watch(isSmallScreen, () => {
      isNavigationOpen.value = false;
    });

    return {
      isDarkTheme,
      toggleDark,
      isMenuCollapsed,
      isSmallScreen,
      activeSidebarSection,
      isNavigationOpen,
    };
  },
  actions: {
    openNavigation() {
      this.isNavigationOpen = true;
    },
    closeNavigation() {
      this.isNavigationOpen = false;
    },
    toggleNavigation() {
      this.isNavigationOpen = !this.isNavigationOpen;
    },
    toggleMenuCollapsed() {
      this.isMenuCollapsed = !this.isMenuCollapsed;
    },
    setActiveSidebarSection(section: string) {
      this.activeSidebarSection = section;
    },
  },
});
