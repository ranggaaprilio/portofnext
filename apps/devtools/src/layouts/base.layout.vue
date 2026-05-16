<script lang="ts" setup>
import { NIcon, useThemeVars } from 'naive-ui';

import { RouterLink } from 'vue-router';
import { Home2, Menu2 } from '@vicons/tabler';

import HeroGradient from '../assets/hero-gradient.svg?component';
import MenuLayout from '../components/MenuLayout.vue';
import NavbarButtons from '../components/NavbarButtons.vue';
import { toolsByCategory } from '@/tools';
import { useStyleStore } from '@/stores/style.store';
import { config } from '@/config';
import type { ToolCategory } from '@/tools/tools.types';
import { useToolStore } from '@/tools/tools.store';
import { useTracker } from '@/modules/tracker/tracker.services';
import CollapsibleToolMenu from '@/components/CollapsibleToolMenu.vue';

const themeVars = useThemeVars();
const styleStore = useStyleStore();
const _version = config.app.version;
const _commitSha = config.app.lastCommitSha.slice(0, 7);

const { tracker: _tracker } = useTracker();

const toolStore = useToolStore();

const tools = computed<ToolCategory[]>(() => [
  ...(toolStore.favoriteTools.length > 0 ? [{ name: 'Your favorite tools', components: toolStore.favoriteTools }] : []),
  ...toolsByCategory,
]);
</script>

<template>
  <MenuLayout class="menu-layout" :class="{ isSmallScreen: styleStore.isSmallScreen }">
    <template #sider>
      <RouterLink to="/" class="hero-wrapper">
        <HeroGradient class="gradient" />
        <div class="text-wrapper">
          <div class="title">
            DEV - TOOLS
          </div>
          <div class="divider" />
          <div class="subtitle">
            All You Need For Development
          </div>
        </div>
      </RouterLink>

      <div class="sider-content">
        <!-- <div v-if="styleStore.isSmallScreen" flex justify-center>
          <NavbarButtons />
        </div> -->

        <CollapsibleToolMenu :tools-by-category="tools" />

        <div class="footer">
          <div>
            DEV-Tools
          </div>
          <div>
            © {{ new Date().getFullYear() }}
          </div>
        </div>
      </div>
    </template>

    <template #content>
      <div flex items-center justify-center gap-2>
        <c-button
          circle
          variant="text"
          aria-label="Toggle menu"
          @click="styleStore.isMenuCollapsed = !styleStore.isMenuCollapsed"
        >
          <NIcon size="25" :component="Menu2" />
        </c-button>

        <n-tooltip trigger="hover">
          <template #trigger>
            <c-button to="/" circle variant="text" aria-label="Home">
              <NIcon size="25" :component="Home2" />
            </c-button>
          </template>
          Home
        </n-tooltip>

        <c-button v-if="config.app.env === 'development'" to="/c-lib" circle variant="text" aria-label="UI Lib">
          <icon-mdi:brush-variant text-20px />
        </c-button>

        <command-palette />

        <div>
          <NavbarButtons />
        </div>

        <!-- <n-tooltip trigger="hover">
          <template #trigger>
            <c-button
              round
              href="https://www.buymeacoffee.com/cthmsst"
              rel="noopener"
              target="_blank"
              class="support-button"
              :bordered="false"
              @click="() => tracker.trackEvent({ eventName: 'Support button clicked' })"
            >
              Buy me a coffee
              <NIcon v-if="!styleStore.isSmallScreen" :component="Heart" ml-2 />
            </c-button>
          </template>
          ❤ Support IT Tools development !
        </n-tooltip> -->
      </div>
      <slot />
    </template>
  </MenuLayout>
</template>

<style lang="less" scoped>
// ::v-deep(.n-layout-scroll-container) {
//     @percent: 4%;
//     @position: 25px;
//     @size: 50px;
//     @color: #eeeeee25;
//     background-image: radial-gradient(@color @percent, transparent @percent),
//         radial-gradient(@color @percent, transparent @percent);
//     background-position: 0 0, @position @position;
//     background-size: @size @size;
// }

.support-button {
  background: #2563eb;
  background: linear-gradient(48deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%);
  color: #fff !important;
  transition: padding ease 0.2s !important;

  &:hover {
    color: #fff;
    padding-left: 30px;
    padding-right: 30px;
  }
}

.footer {
  text-align: center;
  color: #838587;
  margin-top: 20px;
  padding: 20px 0;
}

.sider-content {
  padding-top: 160px;
  padding-bottom: 200px;
}

.hero-wrapper {
  position: absolute;
  display: block;
  left: 0;
  width: 100%;
  z-index: 10;
  overflow: hidden;

  .gradient {
    margin-top: -65px;
  }

  .text-wrapper {
    position: absolute;
    left: 0;
    width: 100%;
    text-align: center;
    top: 16px;
    color: #fff;

    .title {
      font-size: 25px;
      font-weight: 600;
    }

    .divider {
      width: 50px;
      height: 2px;
      border-radius: 4px;
      background-color: v-bind('themeVars.primaryColor');
      margin: 0 auto 5px;
    }

    .subtitle {
      font-size: 16px;
    }
  }
}
</style>
