<script setup lang="ts">
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { isSmallScreen, isNavigationOpen } = toRefs(styleStore);
</script>

<template>
  <div class="workbench-shell">
    <div class="sidebar-region">
      <slot name="sider" />
    </div>

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
  flex-shrink: 0;
  overflow-x: hidden;
  transition: transform 0.25s ease;

  @media (max-width: 700px) {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);

    &:has(> *:not(:empty)) {
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
}
</style>
