<template>
    <el-row class="nav">
        <el-col class="nav__item" v-on:click="step == 2" :class="{ active: active == 1 }" :lg="6"> PICK YOUR FRAME </el-col>
        <el-col class="nav__item" :class="{ active: active == 2 }" :lg="6"> ADD YOUR MESH </el-col>
        <el-col class="nav__item" :class="{ active: active == 3 }" :lg="6"> ADD YOUR LOGO </el-col>
        <el-col class="nav__item" :class="{ active: active == 4 }" :lg="6"> PICK YOUR COLORS </el-col>
    </el-row>
</template>

<script>
export default {
    props: ["active"],
    methods: {
        change_step(step) {
            console.log(step);
        }
    }

}
</script>