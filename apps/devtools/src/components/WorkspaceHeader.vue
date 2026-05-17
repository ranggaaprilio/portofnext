<script setup lang="ts">
import { NIcon, NTooltip } from 'naive-ui';
import { Heart, Home2, Menu2 } from '@vicons/tabler';
import { useRoute } from 'vue-router';
import NavbarButtons from './NavbarButtons.vue';
import { useStyleStore } from '@/stores/style.store';
import { useToolStore } from '@/tools/tools.store';

const route = useRoute();
const styleStore = useStyleStore();
const toolStore = useToolStore();

const pageTitle = computed(() => {
  if (route.path === '/') {
    return 'Home';
  }
  return String(route.meta.name ?? '');
});

const pageContext = computed(() => {
  if (route.path === '/') {
    return 'All tools';
  }
  const tool = toolStore.tools.find(t => t.path === route.path);
  if (tool) {
    return tool.category;
  }
  return '';
});

const currentTool = computed(() => {
  if (route.path === '/') {
    return null;
  }
  return toolStore.tools.find(t => t.path === route.path) ?? null;
});

const isFavorite = computed(() => {
  if (!currentTool.value) {
    return false;
  }
  return toolStore.isToolFavorite({ tool: currentTool.value });
});

function toggleFavorite() {
  if (!currentTool.value) {
    return;
  }
  if (isFavorite.value) {
    toolStore.removeToolFromFavorites({ tool: currentTool.value });
  }
  else {
    toolStore.addToolToFavorites({ tool: currentTool.value });
  }
}
</script>

<template>
  <header class="workspace-header">
    <div class="header-left">
      <c-button
        v-if="styleStore.isSmallScreen"
        circle
        variant="text"
        aria-label="Toggle navigation"
        @click="styleStore.toggleNavigation()"
      >
        <NIcon size="20" :component="Menu2" />
      </c-button>

      <div class="page-context">
        <span class="page-title">{{ pageTitle }}</span>
        <span v-if="pageContext" class="page-separator">/</span>
        <span v-if="pageContext" class="page-subtitle">{{ pageContext }}</span>
      </div>
    </div>

    <div class="header-center">
      <command-palette />
    </div>

    <div class="header-right">
      <NTooltip v-if="currentTool" trigger="hover">
        <template #trigger>
          <c-button
            circle
            variant="text"
            :class="{ 'is-favorite': isFavorite }"
            aria-label="Toggle favorite"
            @click="toggleFavorite"
          >
            <NIcon size="20" :component="Heart" />
          </c-button>
        </template>
        {{ isFavorite ? 'Remove from favorites' : 'Add to favorites' }}
      </NTooltip>

      <NTooltip trigger="hover">
        <template #trigger>
          <c-button to="/" circle variant="text" aria-label="Home">
            <NIcon size="20" :component="Home2" />
          </c-button>
        </template>
        Home
      </NTooltip>

      <NavbarButtons />
    </div>
  </header>
</template>

<style lang="less" scoped>
.workspace-header {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  gap: 12px;
  border-bottom: 1px solid var(--devtools-border);
  background: var(--devtools-surface);
  flex-shrink: 0;
}

:deep(.n-theme-dark) .workspace-header {
  background: var(--devtools-surface);
  border-bottom-color: var(--devtools-border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.page-context {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.page-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--devtools-text);
  white-space: nowrap;
}

:deep(.n-theme-dark) .page-title {
  color: var(--devtools-text);
}

.page-separator {
  color: var(--devtools-muted-soft);
}

.page-subtitle {
  font-size: 13px;
  color: var(--devtools-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.n-theme-dark) .page-subtitle {
  color: var(--devtools-muted-soft);
}

.header-center {
  flex: 0 1 320px;
  min-width: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.is-favorite {
  color: var(--devtools-active-text) !important;
}

:deep(.n-theme-dark) .is-favorite {
  color: var(--devtools-active-text) !important;
}

:deep(.command-palette) {
  width: 100%;
}
</style>
