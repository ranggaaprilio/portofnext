<script setup lang="ts">
import { NIcon, NTooltip } from 'naive-ui';
import {
  Code,
  Database,
  Heart,
  Home2,
  MathSymbols,
  Photo,
  Ruler,
  ShieldLock,
  TextWrap,
  TransferIn,
  Wifi,
  World,
} from '@vicons/tabler';
import { RouterLink, useRoute } from 'vue-router';
import { toolsByCategory } from '@/tools';
import { useToolStore } from '@/tools/tools.store';
import { useStyleStore } from '@/stores/style.store';

const route = useRoute();
const styleStore = useStyleStore();
const toolStore = useToolStore();

const categoryIcons: Record<string, any> = {
  'Crypto': ShieldLock,
  'Converter': TransferIn,
  'Web': World,
  'Images and videos': Photo,
  'Development': Code,
  'Network': Wifi,
  'Math': MathSymbols,
  'Measurement': Ruler,
  'Text': TextWrap,
  'Data': Database,
};

interface NavItem {
  key: string
  label: string
  icon: any
  to: string | null
  hasItems?: boolean
}

const navItems = computed<NavItem[]>(() => [
  { key: 'home', label: 'Home', icon: Home2, to: '/' },
  { key: 'favorites', label: 'Favorites', icon: Heart, to: null, hasItems: toolStore.favoriteTools.length > 0 },
  ...toolsByCategory.map(cat => ({
    key: cat.name,
    label: cat.name,
    icon: categoryIcons[cat.name] || Code,
    to: null,
  })),
]);

function handleNavClick(key: string) {
  if (key === 'home') {
    return;
  }
  styleStore.setActiveSidebarSection(key);
  if (styleStore.isSmallScreen) {
    styleStore.closeNavigation();
  }
}

function isActive(key: string) {
  if (key === 'home') {
    return route.path === '/';
  }
  if (key === 'favorites') {
    return styleStore.activeSidebarSection === 'favorites';
  }
  return styleStore.activeSidebarSection === key;
}
</script>

<template>
  <nav class="utility-rail">
    <RouterLink to="/" class="brand" @click="styleStore.setActiveSidebarSection('')">
      <div class="brand-icon">
        DT
      </div>
    </RouterLink>

    <div class="nav-items">
      <NTooltip
        v-for="item of navItems"
        :key="item.key"
        trigger="hover"
        placement="right"
      >
        <template #trigger>
          <button
            class="nav-item"
            :class="{ 'active': isActive(item.key), 'has-badge': item.hasItems }"
            @click="handleNavClick(item.key)"
          >
            <NIcon :component="item.icon" size="20" />
            <span v-if="item.hasItems" class="badge-dot" />
          </button>
        </template>
        {{ item.label }}
      </NTooltip>
    </div>
  </nav>
</template>

<style lang="less" scoped>
.utility-rail {
  width: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  border-right: 1px solid var(--devtools-border);
  background: var(--devtools-rail);
  flex-shrink: 0;
  overflow-x: hidden;
}

:deep(.n-theme-dark) .utility-rail {
  background: var(--devtools-rail);
  border-right-color: var(--devtools-border);
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  text-decoration: none;
}

.brand-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--devtools-ink), var(--devtools-secondary));
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.5px;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  padding: 0 8px;
}

.nav-item {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--devtools-muted);
  transition: all 0.15s ease;
  position: relative;
  flex-shrink: 0;

  &:hover {
    background: var(--devtools-hover);
    color: var(--devtools-text);
  }

  &.active {
    background: var(--devtools-active);
    color: var(--devtools-active-text);
  }

  &.has-badge .badge-dot {
    display: block;
  }
}

.badge-dot {
  display: none;
  position: absolute;
  top: 6px;
  right: 6px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--devtools-badge);
}

:deep(.n-theme-dark) .nav-item {
  color: var(--devtools-muted-soft);

  &:hover {
    background: var(--devtools-hover);
    color: var(--devtools-text);
  }

  &.active {
    background: var(--devtools-active);
    color: var(--devtools-active-text);
  }
}

:deep(.n-theme-dark) .badge-dot {
  background: var(--devtools-badge);
}
</style>
