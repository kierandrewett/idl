import { Demo } from "../types/Demo";

// let A: Demo
let A = {} as Demo;

// let A: Demo
// new (test: unknown) => Demo
let b = new A(undefined);

// (method) Demo.loadURI(PREF_INVALID: number): void
b.loadURI(0);
