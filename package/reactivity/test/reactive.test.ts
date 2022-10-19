import { effect, SetChance } from "../effect";
import { reactive } from "../reactive";

const a:object = reactive({1:2});  // reactive interface , I don't wanna write it at now
effect(()=>a[1]=5)