<template>
    <el-steps :space="200" :active="active">
    <el-step title="Frame"></el-step>
    <el-step title="Mesh"></el-step>
    <el-step title="Logo"></el-step>
    <el-step title="Server"></el-step>
    <el-step title="Finalize"></el-step>
    </el-steps>
</template>

<script>
export default {
    props: ["active"],
}
</script>
