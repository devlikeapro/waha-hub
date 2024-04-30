<script setup>
import {computed} from "vue";

const props = defineProps(['invalid'])
const classes = computed(() => props.invalid ? 'p-invalid p-component p-inputtext' : "")
</script>
<template>
    <pre class="border-round surface-ground text-900 p-5 overflow-auto" :class="classes">
        <code class="-mt-4 p-0 line-height-3 block" style="font-family: monaco, Consolas, 'Lucida Console', monospace"><slot></slot></code></pre>
</template>
