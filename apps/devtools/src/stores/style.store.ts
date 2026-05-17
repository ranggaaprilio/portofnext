import { useDark, useMediaQuery, useStorage, useToggle } from '@vueuse/core';
import { defineStore } from 'pinia';
import { type Ref, watch } from 'vue';

export const useStyleStore = defineStore('style', {
  state: () => {
    const isDarkTheme = useDark();
    const toggleDark = useToggle(isDarkTheme);
    const isSmallScreen = useMediaQuery('(max-width: 700px)');
    const isMenuCollapsed = useStorage('isMenuCollapsed', isSmallScreen.value) as Ref<boolean>;
    const activeSidebarSection = useStorage<string>('activeSidebarSection', '') as Ref<string>;
    const isNavigationOpen = ref(false);

    watch(isSmallScreen, (v) => {
      isMenuCollapsed.value = v;
      if (!v) {
        isNavigationOpen.value = false;
      }
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
    setActiveSidebarSection(section: string) {
      this.activeSidebarSection = section;
    },
  },
});
