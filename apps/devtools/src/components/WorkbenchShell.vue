<script setup lang="ts">
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { isMenuCollapsed, isSmallScreen, isNavigationOpen } = toRefs(styleStore);
</script>

<template>
  <div class="workbench-shell">
    <aside
      id="workspace-sidebar"
      class="sidebar-region"
      :class="{
        'is-collapsed': !isSmallScreen && isMenuCollapsed,
        'is-open': isSmallScreen && isNavigationOpen,
      }"
      :aria-hidden="isSmallScreen && !isNavigationOpen"
      :inert="isSmallScreen && !isNavigationOpen"
    >
      <slot name="sider" />
    </aside>

    <div class="main-region">
      <slot name="header" />
      <div class="content-area">
        <slot name="content" />
      </div>
    </div>

    <div v-show="isSmallScreen && isNavigationOpen" class="overlay" @click="styleStore.closeNavigation()" />
  </div>
</template>

<style lang="less" scoped>
.workbench-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.sidebar-region {
  display: flex;
  width: 296px;
  flex-shrink: 0;
  overflow-x: hidden;
  transition: width 0.25s ease, transform 0.25s ease;

  &.is-collapsed {
    width: 56px;
  }

  @media (max-width: 900px) {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    width: min(320px, calc(100vw - 48px));
    box-shadow: 16px 0 40px rgba(27, 60, 83, 0.2);
    transform: translateX(-100%);

    &.is-open {
      transform: translateX(0);
    }
  }
}

.main-region {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 26px;
  background-color: var(--devtools-bg);

  @media (max-width: 900px) {
    padding: 18px;
  }

  @media (max-width: 520px) {
    padding: 12px;
  }
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #00000080;
  cursor: pointer;
  z-index: 99;
  backdrop-filter: blur(2px);
}
</style>
