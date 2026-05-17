<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import { NGlobalStyle, NMessageProvider, NNotificationProvider, darkTheme } from 'naive-ui';
import { darkThemeOverrides, lightThemeOverrides } from './themes';
import { layouts } from './layouts';
import { useStyleStore } from './stores/style.store';

const route = useRoute();
const layout = computed(() => route?.meta?.layout ?? layouts.base);
const styleStore = useStyleStore();

const theme = computed(() => (styleStore.isDarkTheme ? darkTheme : null));
const themeOverrides = computed(() => (styleStore.isDarkTheme ? darkThemeOverrides : lightThemeOverrides));
</script>

<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <NGlobalStyle />
    <NMessageProvider placement="bottom">
      <NNotificationProvider placement="bottom-right">
        <component :is="layout">
          <RouterView />
        </component>
      </NNotificationProvider>
    </NMessageProvider>
  </n-config-provider>
</template>

<style>
body {
  min-height: 100%;
  margin: 0;
  padding: 0;
}

html {
  height: 100%;
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}

:root {
  --devtools-ink: #1B3C53;
  --devtools-primary: #234C6A;
  --devtools-secondary: #456882;
  --devtools-sand: #D2C1B6;
  --devtools-bg: #D2C1B6;
  --devtools-surface: #ffffff;
  --devtools-rail: #f7f2ef;
  --devtools-border: rgba(27, 60, 83, 0.18);
  --devtools-border-subtle: rgba(27, 60, 83, 0.1);
  --devtools-text: #1B3C53;
  --devtools-muted: #456882;
  --devtools-muted-soft: rgba(69, 104, 130, 0.72);
  --devtools-hover: rgba(69, 104, 130, 0.14);
  --devtools-active: rgba(210, 193, 182, 0.55);
  --devtools-active-text: #234C6A;
  --devtools-badge: #234C6A;
}

html.dark,
.n-theme-dark {
  --devtools-bg: #1B3C53;
  --devtools-surface: #234C6A;
  --devtools-rail: #1B3C53;
  --devtools-border: rgba(210, 193, 182, 0.24);
  --devtools-border-subtle: rgba(210, 193, 182, 0.14);
  --devtools-text: #f3ebe6;
  --devtools-muted: #D2C1B6;
  --devtools-muted-soft: rgba(210, 193, 182, 0.68);
  --devtools-hover: rgba(69, 104, 130, 0.55);
  --devtools-active: rgba(210, 193, 182, 0.15);
  --devtools-active-text: #D2C1B6;
  --devtools-badge: #D2C1B6;
}
</style>
