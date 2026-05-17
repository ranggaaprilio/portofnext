<script lang="ts" setup>
import WorkbenchShell from '../components/WorkbenchShell.vue';
import UtilityRail from '../components/UtilityRail.vue';
import DetailPanel from '../components/DetailPanel.vue';
import WorkspaceHeader from '../components/WorkspaceHeader.vue';
</script>

<template>
  <WorkbenchShell>
    <template #sider>
      <div class="sidebar-container">
        <UtilityRail />
        <DetailPanel />
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
  height: 100vh;
  overflow: hidden;
  overflow-x: hidden;
}
</style>
