<script setup lang="ts">
import { NIcon } from 'naive-ui';
import { RouterLink, useRoute } from 'vue-router';
import { toolsByCategory } from '@/tools';
import { useStyleStore } from '@/stores/style.store';
import { useToolStore } from '@/tools/tools.store';
import type { Tool } from '@/tools/tools.types';

const route = useRoute();
const styleStore = useStyleStore();
const toolStore = useToolStore();

const currentCategory = computed(() => {
  const section = styleStore.activeSidebarSection;
  if (!section || section === 'favorites') {
    return null;
  }
  return toolsByCategory.find((c) => c.name === section) ?? null;
});

const displayTools = computed<Tool[]>(() => {
  if (styleStore.activeSidebarSection === 'favorites') {
    return toolStore.favoriteTools;
  }
  return currentCategory.value?.components ?? [];
});

const panelTitle = computed(() => {
  if (styleStore.activeSidebarSection === 'favorites') {
    return 'Favorite Tools';
  }
  return currentCategory.value?.name ?? 'Select a category';
});

function isActiveTool(tool: Tool) {
  return route.path === tool.path;
}
</script>

<template>
  <div class="detail-panel">
    <div class="panel-header">
      <h3>{{ panelTitle }}</h3>
    </div>

    <div class="panel-content pretty-scrollbar">
      <template v-if="displayTools.length === 0">
        <div class="empty-state">
          <p v-if="styleStore.activeSidebarSection === 'favorites'">
            No favorite tools yet. Click the heart icon on any tool to add it here.
          </p>
          <p v-else>Select a category from the rail to view its tools.</p>
        </div>
      </template>
      <template v-else>
        <RouterLink
          v-for="tool in displayTools"
          :key="tool.name"
          :to="tool.path"
          class="tool-link"
          :class="{ active: isActiveTool(tool) }"
          @click="styleStore.isSmallScreen && styleStore.closeNavigation()"
        >
          <div class="tool-icon">
            <NIcon :component="tool.icon" size="18" />
          </div>
          <div class="tool-info">
            <span class="tool-name">{{ tool.name }}</span>
            <span class="tool-desc">{{ tool.description }}</span>
          </div>
          <span v-if="tool.isNew" class="new-badge" />
        </RouterLink>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
.detail-panel {
  width: 240px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--devtools-border);
  background: var(--devtools-surface);
  flex-shrink: 0;
  overflow: hidden;
}

:deep(.n-theme-dark) .detail-panel {
  background: var(--devtools-surface);
  border-right-color: var(--devtools-border);
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid var(--devtools-border-subtle);

  h3 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--devtools-text);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

:deep(.n-theme-dark) .panel-header {
  border-bottom-color: var(--devtools-border-subtle);

  h3 {
    color: var(--devtools-text);
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
}

.empty-state {
  padding: 24px 16px;
  text-align: center;
  color: var(--devtools-muted-soft);
  font-size: 13px;
  line-height: 1.5;
}

.tool-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
  transition: background 0.15s ease;
  position: relative;
  margin-bottom: 2px;

  &:hover {
    background: var(--devtools-hover);
  }

  &.active {
    background: var(--devtools-active);
    color: var(--devtools-active-text);
  }
}

:deep(.n-theme-dark) .tool-link {
  &:hover {
    background: var(--devtools-hover);
  }

  &.active {
    background: var(--devtools-active);
    color: var(--devtools-active-text);
  }
}

.tool-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--devtools-muted);
  flex-shrink: 0;
}

.tool-link.active .tool-icon {
  color: var(--devtools-active-text);
}

:deep(.n-theme-dark) .tool-icon {
  color: var(--devtools-muted-soft);
}

:deep(.n-theme-dark) .tool-link.active .tool-icon {
  color: var(--devtools-active-text);
}

.tool-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.tool-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--devtools-text);
}

.tool-desc {
  font-size: 11px;
  color: var(--devtools-muted-soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.n-theme-dark) .tool-desc {
  color: var(--devtools-muted-soft);
}

.new-badge {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--devtools-badge);
  flex-shrink: 0;
}

:deep(.n-theme-dark) .new-badge {
  background: var(--devtools-badge);
}
</style>
