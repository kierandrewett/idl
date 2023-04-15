import { nsISupports } from "./nsISupports";
import { nsIObserver } from "./nsIObserver";

export interface Demo extends nsISupports, nsIObserver {
	readonly docShell: unknown /* todo: Demo::nsIWebProgressListener */;
	PREF_INVALID: 0;
	PREF_STRING: 32;
	PREF_INT: 64;
	PREF_BOOL: 128;
	readonly remoteTab: boolean;
	new (test: unknown /* todo: Demo::nsIWebProgressListener */): Demo;
	loadURI(PREF_INVALID: number): void;
	prefIsSanitized(aPrefName: string, aResult: any): boolean;
	addObserver(aDomain: string, aObserver: nsIObserver, aHoldWeak: boolean): void;
}
