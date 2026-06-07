<script lang="ts" setup>
import WorkbenchShell from '../components/WorkbenchShell.vue';
import UtilityRail from '../components/UtilityRail.vue';
import DetailPanel from '../components/DetailPanel.vue';
import WorkspaceHeader from '../components/WorkspaceHeader.vue';
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
</script>

<template>
  <WorkbenchShell>
    <template #sider>
      <div class="sidebar-container">
        <UtilityRail />
        <DetailPanel :collapsed="!styleStore.isSmallScreen && styleStore.isMenuCollapsed" />
      </div>
    </template>

    <template #header>
      <WorkspaceHeader />
    </template>

    <template #content>
      <slot />
    </template>
  </WorkbenchShell>
</template>

<style lang="less" scoped>
.sidebar-container {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  overflow-x: hidden;
}
</style>
