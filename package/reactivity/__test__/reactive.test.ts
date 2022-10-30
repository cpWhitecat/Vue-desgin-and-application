import { effect, } from "../src/effect";
import { reactive } from "../src/reactive";

const a:object = reactive({1:2});  // reactive interface , I don't wanna write it at now
effect(()=>a[1]=5)